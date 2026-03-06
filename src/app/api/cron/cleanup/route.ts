// src/app/api/cron/cleanup/route.ts

import { getAdminClient } from '@/server/db/supabase'; // Admin yetkisi lazım!
import { NextResponse } from 'next/server';

// Bu endpoint'i dışarıdan herkes çağırmasın diye basit bir güvenlik önlemi alabiliriz.
// URL şöyle olacak: /api/cron/cleanup?key=GIZLI_SIFRE
const CRON_KEY = process.env.CRON_SECRET_KEY; 

export async function GET(request: Request) {
  try {
    // 1. Güvenlik Kontrolü
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== CRON_KEY) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // 2. Admin Client ile SQL Fonksiyonunu Çağır
    const supabase = getAdminClient();
    
    const { error } = await supabase.rpc('cleanup_expired_appointments');

    if (error) {
      console.error('Cleanup Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Temizlik tamamlandı.' });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}