// src/app/api/appointments/confirm/route.ts

import { createClient } from '@/server/db/supabase'; 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Randevu ID eksik.' }, { status: 400 });
    }

    // 1. Randevuyu bul
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('status, created_at')
      .eq('id', id)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
    }

    // 2. Zaten onaylı mı?
    if (appointment.status === 'confirmed') {
      return NextResponse.json({ success: true, message: 'Zaten onaylı.' });
    }

    // 3. 15 Dakika Süre Kontrolü (Backend Koruması)
    const createdAt = new Date(appointment.created_at).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - createdAt) / 60000;

    if (diffMinutes > 15) {
      return NextResponse.json({ error: 'Onay süresi (15 dk) doldu. Lütfen yeni randevu alın.' }, { status: 410 }); // 410: Gone
    }

    // 4. Onaylama İşlemi
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}