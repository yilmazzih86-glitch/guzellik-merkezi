// src/app/api/availability/route.ts

// ✅ DOĞRU IMPORT (Server Side)
import { createClient } from '@/server/db/supabase'; 
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');
  const serviceId = searchParams.get('serviceId');

  if (!date || !staffId) {
    return NextResponse.json({ error: 'Tarih ve Personel seçimi zorunludur.' }, { status: 400 });
  }

  // Sunucu taraflı client oluşturuluyor
  const supabase = await createClient();

  try {
    // 1. Hizmet süresini bul (Varsayılan 30 dk)
    let duration = 30; 

    if (serviceId) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('duration_min') // Sütun adı veritabanınızda 'duration_min'
        .eq('id', serviceId)
        .single();
      
      if (serviceData?.duration_min) {
        duration = serviceData.duration_min;
      }
    }

    // 2. Akıllı Slot Motorunu Çalıştır (RPC)
    const { data: slots, error } = await supabase
      .rpc('get_available_slots', {
        p_date: date,
        p_staff_id: staffId,
        p_service_duration: duration
      });

    if (error) {
      console.error('RPC Hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Veriyi düzenle ve gönder
    // Gelen veri: [{ slot: "09:00" }, { slot: "09:30" }] -> Çıktı: ["09:00", "09:30"]
    const formattedSlots = slots ? slots.map((s: any) => s.slot) : [];

    return NextResponse.json(formattedSlots);

  } catch (err: any) {
    console.error('API Hatası:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}