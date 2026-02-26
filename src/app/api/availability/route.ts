// src/app/api/availability/route.ts
import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../server/db/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date'); // YYYY-MM-DD
  const serviceId = searchParams.get('serviceId');

  if (!dateStr || !serviceId) {
    return NextResponse.json({ error: 'date ve serviceId zorunludur.' }, { status: 400 });
  }

  const supabase = getAdminClient();

  try {
    // 1. İşletme ayarlarını ve servis süresini çek
    const [settingsRes, serviceRes] = await Promise.all([
      supabase.from('settings').select('opening_hours, booking_rules, timezone').single(),
      supabase.from('services').select('duration_min').eq('id', serviceId).single()
    ]);

    if (settingsRes.error || serviceRes.error) throw new Error('Ayar veya servis bulunamadı.');

    const { opening_hours, booking_rules, timezone } = settingsRes.data;
    const { duration_min } = serviceRes.data;

    // 2. İstenen tarihin gününü bul (mon, tue, wed...)
    const dateObj = new Date(dateStr);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayOfWeek = days[dateObj.getDay()];
    const todayHours = opening_hours[dayOfWeek] || [];

    // 3. O güne ait mevcut randevuları çek (Çakışma kontrolü için)
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`).toISOString();
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`).toISOString();

    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_at, end_at')
      .eq('status', 'confirmed')
      .gte('start_at', startOfDay)
      .lte('start_at', endOfDay);

    const bookedSlots = appointments || [];
    const slots = [];
    const now = new Date();
    
    // Minimum bildirim süresini (min_notice_minutes) hesapla
    const minNoticeMs = (booking_rules.min_notice_minutes || 0) * 60 * 1000;
    const earliestAllowedTime = now.getTime() + minNoticeMs;

    // 4. Slotları oluştur
    for (const interval of todayHours) {
      // Örn interval: { start: "10:00", end: "20:00" }
      let currentSlotTime = new Date(`${dateStr}T${interval.start}:00.000Z`).getTime();
      const endTime = new Date(`${dateStr}T${interval.end}:00.000Z`).getTime();
      const slotDurationMs = (booking_rules.slot_minutes || 30) * 60 * 1000;
      const serviceDurationMs = duration_min * 60 * 1000;

      while (currentSlotTime + serviceDurationMs <= endTime) {
        const slotStart = new Date(currentSlotTime);
        const slotEnd = new Date(currentSlotTime + serviceDurationMs);
        
        // Geçmişte mi veya min_notice kuralına takılıyor mu?
        let isAvailable = slotStart.getTime() >= earliestAllowedTime;

        // Randevu çakışma kontrolü
        if (isAvailable) {
          const hasOverlap = bookedSlots.some((app: { start_at: string; end_at: string }) => {
            const appStart = new Date(app.start_at).getTime();
            const appEnd = new Date(app.end_at).getTime();
            return currentSlotTime < appEnd && slotEnd.getTime() > appStart;
          });
          if (hasOverlap) isAvailable = false;
        }

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: isAvailable
        });

        currentSlotTime += slotDurationMs; // Sonraki slota geç
      }
    }

    return NextResponse.json({ timezone, slots });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}