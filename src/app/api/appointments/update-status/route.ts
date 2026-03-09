import { createClient } from '@/server/db/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { id, status } = await request.json();

    // 1. Validasyon: Sadece izin verilen statüler
    const allowedStatuses = ['completed', 'no_show', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Geçersiz statü.' }, { status: 400 });
    }

    // 2. Güncelleme İşlemi
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}