// src/app/api/cron/cleanup/route.ts
import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // --- GÜVENLİK KONTROLÜ (CRON_CLEANUP ile) ---
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_CLEANUP; // ÖZEL ANAHTAR

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }
  // ----------------------------------------------

  const supabase = await createClient();

  try {
    // 15 Dakika Öncesini Hesapla
    // Onay maili 15 dk geçerli olduğu için, bundan eski ve onaylanmamışları siliyoruz.
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 'pending' statüsünde olan ve oluşturulma zamanı 15 dk'dan eski kayıtları sil
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