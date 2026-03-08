// src/app/api/cron/reminders/route.ts
import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // --- GÜVENLİK KONTROLÜ (CRON_REMINDERS ile) ---
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_REMINDERS; // ÖZEL ANAHTAR

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  // -----------------------------------------------

  const supabase = await createClient();

  try {
    const now = new Date().toISOString();

    // 1. Gönderilmesi Gereken Hatırlatmaları Bul
    const { data: dueReminders, error } = await supabase
      .from('reminders')
      .select(`
        id, type, appointment_id, attempts,
        appointments (
          start_at, status,
          services (name),
          customers (full_name, email, phone)
        )
      `)
      .lte('scheduled_for', now)
      .is('sent_at', null)
      .lt('attempts', 3)
      .limit(10);

    if (error) throw error;
    
    if (!dueReminders || dueReminders.length === 0) {
      return NextResponse.json({ message: 'Gönderilecek hatırlatma yok.' });
    }

    // 2. n8n'e Gönderim Döngüsü
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const results = [];

    for (const reminder of dueReminders) {
      const appt: any = reminder.appointments;
      
      // İptal edilmişse gönderme, işlendi say
      if (appt.status === 'cancelled' || appt.status === 'no_show') {
         await supabase.from('reminders').update({ 
             sent_at: new Date().toISOString(), 
             last_error: 'Randevu iptal olduğu için gönderilmedi.' 
         }).eq('id', reminder.id);
         continue;
      }

      // Supabase Array/Object Kontrolü
      const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
      const service = Array.isArray(appt.services) ? appt.services[0] : appt.services;

      if (webhookUrl) {
        try {
           await fetch(webhookUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               type: 'REMINDER_EMAIL',
               subType: reminder.type,
               appointmentId: reminder.appointment_id,
               customer: {
                 name: customer?.full_name,
                 email: customer?.email,
                 phone: customer?.phone
               },
               service: service?.name,
               date: appt.start_at
             })
           });

           // Başarılı -> sent_at güncelle
           await supabase.from('reminders').update({ sent_at: new Date().toISOString() }).eq('id', reminder.id);
           results.push({ id: reminder.id, status: 'sent' });

        } catch (webhookErr: any) {
           // Hata -> attempts artır
           await supabase.from('reminders').update({ 
               attempts: (reminder as any).attempts + 1,
               last_error: webhookErr.message
           }).eq('id', reminder.id);
           results.push({ id: reminder.id, status: 'failed' });
        }
      }
    }

    return NextResponse.json({ success: true, processed: results.length });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}