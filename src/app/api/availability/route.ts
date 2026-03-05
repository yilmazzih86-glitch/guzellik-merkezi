import { createClient } from '@/server/db/supabase'; 
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');
  const serviceId = searchParams.get('serviceId');

  if (!date || !staffId) {
    return NextResponse.json({ error: 'Parametreler eksik.' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    let duration = 30;
    if (serviceId) {
      const { data } = await supabase
        .from('services')
        .select('duration_min')
        .eq('id', serviceId)
        .single();
      if (data) duration = data.duration_min;
    }

    const { data: slots, error } = await supabase
      .rpc('get_available_slots', {
        p_date: date,
        p_staff_id: staffId,
        p_service_duration: duration
      });

    if (error) {
      console.error('RPC Error:', error);
      return NextResponse.json([]);
    }

    // ARTIK DEĞİŞTİRMEDEN DİREKT GÖNDERİYORUZ
    // Çıktı formatı: [{ slot_time: "09:00", is_available: true }, ...]
    return NextResponse.json(slots);

  } catch (err) {
    return NextResponse.json([]);
  }
}