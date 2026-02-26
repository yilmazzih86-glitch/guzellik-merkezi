// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../server/db/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, staffId, startAt, customer } = body;

    if (!serviceId || !startAt || !customer?.fullName || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Servis süresini bul ve bitiş tarihini (endAt) hesapla
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_min')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Servis bulunamadı.' }, { status: 404 });
    }

    const startDateTime = new Date(startAt);
    const endDateTime = new Date(startDateTime.getTime() + service.duration_min * 60000);

    // SQL RPC fonksiyonumuzu çağırarak güvenli Transaction başlatıyoruz
    const { data, error: rpcError } = await supabase.rpc('book_appointment', {
      p_customer_name: customer.fullName,
      p_customer_phone: customer.phone,
      p_customer_email: customer.email,
      p_service_id: serviceId,
      p_staff_id: staffId || null,
      p_start_at: startDateTime.toISOString(),
      p_end_at: endDateTime.toISOString()
    });

    if (rpcError) {
      if (rpcError.message.includes('OVERLAP_ERROR')) {
        return NextResponse.json({ error: 'Seçilen saat dilimi artık müsait değil. Lütfen başka bir saat seçin.' }, { status: 409 });
      }
      throw rpcError;
    }

    return NextResponse.json({ 
      success: true, 
      appointment: data 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Randevu oluşturma hatası:', error);
    return NextResponse.json({ error: 'Randevu oluşturulurken beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}