// src/app/api/cron/cleanup/route.ts
import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. GÜVENLİK KONTROLÜ
  // n8n'den gelen "Authorization: Bearer <ŞİFRE>" başlığını kontrol et
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_CLEANUP; 

  // Şifreler eşleşmiyorsa kapıyı açma
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // 2. TEMİZLİK İŞLEMİ
    // Şu andan 15 dakika öncesini hesapla
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 'pending' (onaylanmamış) ve süresi dolmuş randevuları sil
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', fifteenMinutesAgo)
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Süresi dolan randevular temizlendi.',
      deletedCount: data.length 
    });

  } catch (err: any) {
    console.error('Cleanup Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}