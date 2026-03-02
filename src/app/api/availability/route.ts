import { createClient } from '@/server/db/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');
  const serviceId = searchParams.get('serviceId');

  // --- DEBUG LOG ---
  console.log("-------------------------------------------------");
  console.log("📡 API İSTEĞİ GELDİ:");
  console.log("👉 Tarih:", date);
  console.log("👉 Staff ID:", staffId);
  console.log("👉 Service ID:", serviceId); // Burası null mı geliyor?
  // -----------------

  if (!date || !staffId || !serviceId) {
    return NextResponse.json(
      { error: 'Eksik parametreler.' }, 
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Hizmet Süresi Sorgusu
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, duration_min') // Sadece gerekli alanlar
    .eq('id', serviceId)
    .single();

  // --- DEBUG LOG (VERİTABANI SONUCU) ---
  if (serviceError) {
    console.error("❌ DB HATASI (Service):", serviceError.message);
    console.error("❌ DB HATASI (Kod):", serviceError.code);
    console.error("❌ DB HATASI (Detay):", serviceError.details);
  } else {
    console.log("✅ Hizmet Bulundu:", service);
  }
  // -------------------------------------

  if (serviceError || !service) {
    // Hata detayını ekrana da basalım ki görelim
    return NextResponse.json({ 
      error: 'Seçilen hizmet bulunamadı.', 
      details: serviceError ? serviceError.message : 'Veri null döndü' 
    }, { status: 404 });
  }

  // RPC Çağrısı
  const { data: slots, error: rpcError } = await supabase
    .rpc('get_available_slots', {
      p_date: date,
      p_staff_id: staffId,
      p_duration_min: service.duration_min
    });

  if (rpcError) {
    console.error("❌ RPC HATASI:", rpcError);
    return NextResponse.json({ error: 'RPC Hatası', details: rpcError.message }, { status: 500 });
  }

  return NextResponse.json(slots);
}