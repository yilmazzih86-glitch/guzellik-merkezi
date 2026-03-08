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

    // 1. ÖNCE MEVCUT DURUMU VE TARİHİ KONTROL ET
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('status, start_at, services(name), customers(full_name, email, phone)')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
    }

    // --- GÜVENLİK KONTROLLERİ ---

    // A) Zaten iptal edilmişse: Kullanıcıya "Başarılı" gibi davran ama işlem yapma
    if (appointment.status === 'cancelled') {
      return NextResponse.json({ 
        success: true, 
        message: 'Randevunuz zaten iptal edilmiş durumda.' 
      });
    }

    // B) Randevu tamamlanmışsa veya "gelmedi" işaretlenmişse: İptal EDİLEMEZ
    if (['completed', 'no_show'].includes(appointment.status)) {
      return NextResponse.json({ 
        error: 'Geçmiş veya tamamlanmış randevular iptal edilemez.' 
      }, { status: 400 });
    }

    // C) Randevu zamanı geçmiş mi?
    const appointmentDate = new Date(appointment.start_at);
    const now = new Date();
    if (appointmentDate < now) {
       return NextResponse.json({ 
        error: 'Tarihi geçmiş randevular üzerinde işlem yapılamaz.' 
      }, { status: 400 });
    }

    // --- İŞLEM ---

    // 2. DURUMU 'cancelled' OLARAK GÜNCELLE
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId);

    if (updateError) {
      throw new Error('İptal işlemi sırasında veritabanı hatası.');
    }

    // 3. n8n WEBHOOK (Opsiyonel)
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      
      // TypeScript Hatası Düzeltmesi:
      // Supabase bazen ilişkili verileri dizi olarak döndürür.
      // Biz de garantilemek için dizi mi diye kontrol edip ilk elemanı alıyoruz.
      const customerData: any = appointment.customers;
      const serviceData: any = appointment.services;

      const customer = Array.isArray(customerData) ? customerData[0] : customerData;
      const service = Array.isArray(serviceData) ? serviceData[0] : serviceData;

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'APPOINTMENT_CANCELLED',
          appointmentId: appointmentId,
          customer: {
            name: customer?.full_name,
            email: customer?.email,
            phone: customer?.phone
          },
          service: service?.name,
          reason: 'User cancelled via email link'
        })
      }).catch(err => console.error('Webhook Error:', err));
    }

    return NextResponse.json({ success: true, message: 'Randevunuz başarıyla iptal edildi.' });

  } catch (err: any) {
    console.error('Cancel Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}