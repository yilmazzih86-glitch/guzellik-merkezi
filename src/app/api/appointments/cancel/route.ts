// src/app/api/appointments/cancel/route.ts
import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Randevu ID eksik.' }, { status: 400 });
    }

    // 1. Randevuyu bul ve durumunu güncelle
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select(`
        *,
        services (name),
        staff (name),
        customers (full_name, email, phone)
      `)
      .single();

    if (error || !appointment) {
      console.error('İptal Hatası:', error);
      return NextResponse.json({ error: 'Randevu bulunamadı veya iptal edilemedi.' }, { status: 500 });
    }

    // 2. n8n Webhook Tetikleme (İptal Bildirimi)
    // İşletmeye ve müşteriye "Randevunuz iptal edildi" maili atmak için
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      // Arka planda tetikle, await etme (Fire and Forget)
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'APPOINTMENT_CANCELLED',
          appointmentId: appointment.id,
          customer: {
            name: appointment.customers?.full_name,
            email: appointment.customers?.email,
            phone: appointment.customers?.phone
          },
          service: appointment.services?.name,
          staff: appointment.staff?.name,
          startAt: appointment.start_at
        })
      }).catch(err => console.error('Webhook Hatası:', err));
    }

    return NextResponse.json({ success: true, message: 'Randevu başarıyla iptal edildi.' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}