import { createClient } from '@/server/db/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  const supabase = await createClient();

  try {
    const { id, status } = await request.json();

    // Sadece izin verilen statüleri kabul et
    if (!id || !['no_show', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Geçersiz parametreler.' }, { status: 400 });
    }

    // 1. Randevu durumunu güncelle
    const { error } = await supabase
      .from('appointments')
      .update({ status: status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}