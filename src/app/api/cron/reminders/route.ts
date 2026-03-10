// src/app/api/cron/reminders/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { differenceInMinutes, parseISO } from 'date-fns';

export async function GET(request: Request) {
  // 1. GÜVENLİK KONTROLÜ (n8n'den gelen Bearer Token)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_REMINDERS; 

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date(); // Vercel'in nerede olduğu fark etmez, mutlak zamanı alır.
    const webhookUrl = process.env.N8N_REMINDER_WEBHOOK_URL;
    const results = [];

    // Taramayı -2 saat ile +25 saat arasında yapıyoruz
    const minTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id, start_at, end_at, status,
        services (name),
        customers (full_name, email, phone),
        staff (name),
        reminders (type)
      `)
      .in('status', ['confirmed', 'completed'])
      .gte('start_at', minTime)
      .lte('start_at', maxTime);

    if (error) throw error;

    for (const appt of appointments || []) {
      
      const startAt = parseISO(appt.start_at);
      const endAt = parseISO(appt.end_at);
      const sentTypes = appt.reminders?.map((r: any) => r.type) || [];
      let typeToSend = null;

      const minsToStart = differenceInMinutes(startAt, now);
      const minsSinceEnd = differenceInMinutes(now, endAt);

      if (minsToStart <= 24 * 60 + 30 && minsToStart >= 23 * 60 && !sentTypes.includes('24_HOURS_BEFORE') && appt.status === 'confirmed') {
        typeToSend = '24_HOURS_BEFORE';
      } else if (minsToStart <= 2 * 60 + 30 && minsToStart >= 60 && !sentTypes.includes('2_HOURS_BEFORE') && appt.status === 'confirmed') {
        typeToSend = '2_HOURS_BEFORE';
      } else if (minsSinceEnd >= 30 && minsSinceEnd <= 120 && !sentTypes.includes('30_MINS_AFTER') && (appt.status === 'confirmed' || appt.status === 'completed')) {
        typeToSend = '30_MINS_AFTER';
      }

      if (typeToSend && webhookUrl) {
         const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
         const service = Array.isArray(appt.services) ? appt.services[0] : appt.services;
         const staff = Array.isArray(appt.staff) ? appt.staff[0] : appt.staff;

         // YENİ: Türkiye saatine (Europe/Istanbul) göre okunaklı formatlama (Örn: 28 Mart 2026 Cumartesi, 16:00)
         const formattedDateTR = new Intl.DateTimeFormat('tr-TR', {
           timeZone: 'Europe/Istanbul',
           weekday: 'long',
           year: 'numeric',
           month: 'long',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
         }).format(startAt);

         try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'REMINDER_WEBHOOK',
                subType: typeToSend,
                appointmentId: appt.id,
                customer: {
                  name: customer?.full_name,
                  email: customer?.email,
                  phone: customer?.phone
                },
                service: service?.name,
                staff: staff?.name,
                date: formattedDateTR // ARTIK DİREKT HAZIR METİN OLARAK GİDİYOR
              })
            });

            await supabase.from('reminders').insert({
              appointment_id: appt.id,
              type: typeToSend,
              scheduled_for: now.toISOString(),
              sent_at: now.toISOString(),
              attempts: 1
            });

            results.push({ appointment_id: appt.id, type: typeToSend, status: 'sent', formatted_date: formattedDateTR });

         } catch (webhookErr) {
            console.error('n8n Webhook hatası:', webhookErr);
         }
         console.log(`Randevu ${appt.id} -> Başlamasına kalan dakika: ${minsToStart}, Durum: ${appt.status}`);
      }
    }

    return NextResponse.json({ success: true, processed_count: results.length, details: results });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}