// src/app/api/cron/cleanup/route.ts
import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. GÜVENLİK KONTROLÜ (Bearer Token & CRON_CLEANUP)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_CLEANUP; // Sizin belirlediğiniz değişken

  // Eğer şifre eşleşmezse 401 hatası ver
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // 2. TEMİZLİK İŞLEMİ
    // 15 dakika öncesini hesapla
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 'pending' statüsünde olan ve süresi dolmuş kayıtları sil
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