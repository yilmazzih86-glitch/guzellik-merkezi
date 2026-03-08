// src/app/api/appointments/confirm/route.ts
import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'Randevu ID eksik.' }, { status: 400 });
    }

    // 1. ÖNCE RANDEVUNUN GÜNCEL DURUMUNU ÇEKELİM
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('status, start_at')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
    }

    // 2. KRİTİK KONTROLLER
    
    // A) Eğer randevu iptal edilmişse ASLA onaylama
    if (appointment.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Bu randevu iptal edilmiştir. Tekrar onaylanamaz.',
        code: 'APPOINTMENT_CANCELLED' // Frontend'de özel mesaj göstermek için kod
      }, { status: 400 });
    }

    // B) Zaten onaylanmışsa işlem yapma
    if (appointment.status === 'confirmed') {
      return NextResponse.json({ success: true, message: 'Randevu zaten onaylı.' });
    }

    // C) Süre kontrolü (15 dakika kuralı) - Opsiyonel ama önerilir
    // Randevu oluşturulma zamanını created_at'ten kontrol etmek daha doğru olurdu ama
    // şimdilik basitçe pending durumundaysa devam ediyoruz.

    // 3. HER ŞEY YOLUNDAYSA ONAYLA
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId);

    if (updateError) {
      throw new Error('Güncelleme sırasında hata oluştu.');
    }

    // 4. (Opsiyonel) n8n'e "Randevu Onaylandı" bildirimi gönderilebilir.

    return NextResponse.json({ success: true, message: 'Randevu başarıyla onaylandı.' });

  } catch (err: any) {
    console.error('Confirm Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}