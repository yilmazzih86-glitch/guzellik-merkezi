// src/app/api/cron/reminders/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { differenceInMinutes, parseISO } from 'date-fns';

export async function GET(request: Request) {
  // 1. GÜVENLİK KONTROLÜ
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_REMINDERS; 

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
  }

  // DİKKAT: Cron arka planda çalıştığı için Service Role Key kullanılır (Bypass RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date();
    const webhookUrl = process.env.N8N_REMINDER_WEBHOOK_URL;
    const results = [];

    // Gelecek 25 saat ve geçmiş 2 saat içindeki randevuları tek seferde çekiyoruz.
    // Aynı zamanda bu randevu için daha önce gönderilmiş hatırlatmaları da (reminders) çekiyoruz.
    const minTime = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id, start_at, end_at, status,
        services (name),
        customers (full_name, email, phone),
        staff (name),
        reminders (type)
      `)
      .in('status', ['confirmed', 'completed']) // Sadece onaylılar ve tamamlananlar
      .gte('start_at', minTime)
      .lte('start_at', maxTime);

    if (error) throw error;

    // Her bir randevuyu süzgeçten geçir
    for (const appt of appointments || []) {
      const startAt = parseISO(appt.start_at);
      const endAt = parseISO(appt.end_at);
      
      // Bu randevu için daha önce gönderilmiş mesaj tiplerinin listesi
      const sentTypes = appt.reminders?.map((r: any) => r.type) || [];
      let typeToSend = null;

      // ZAMAN HESAPLAMALARI (Farkları dakika cinsinden buluyoruz)
      const minsToStart = differenceInMinutes(startAt, now);
      const minsSinceEnd = differenceInMinutes(now, endAt);

      // KURAL 1: 24 SAAT ÖNCESİ (23 - 24.5 saat arasıysa ve henüz gönderilmediyse)
      if (minsToStart <= 24 * 60 + 30 && minsToStart >= 23 * 60 && !sentTypes.includes('24_HOURS_BEFORE') && appt.status === 'confirmed') {
        typeToSend = '24_HOURS_BEFORE';
      }
      // KURAL 2: 2 SAAT ÖNCESİ (1 - 2.5 saat arasıysa ve henüz gönderilmediyse)
      else if (minsToStart <= 2 * 60 + 30 && minsToStart >= 60 && !sentTypes.includes('2_HOURS_BEFORE') && appt.status === 'confirmed') {
        typeToSend = '2_HOURS_BEFORE';
      }
      // KURAL 3: BİTİMDEN 30 DK SONRA (30 - 120 dakika arası geçtiyse ve gönderilmediyse)
      else if (minsSinceEnd >= 30 && minsSinceEnd <= 120 && !sentTypes.includes('30_MINS_AFTER') && (appt.status === 'confirmed' || appt.status === 'completed')) {
        typeToSend = '30_MINS_AFTER';
      }

      // EĞER GÖNDERİLECEK BİR MESAJ TÜRÜ BULUNDUYSA -> n8n'e gönder
      if (typeToSend && webhookUrl) {
         // Supabase Array/Object karmaşasını düzelt
         const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
         const service = Array.isArray(appt.services) ? appt.services[0] : appt.services;
         const staff = Array.isArray(appt.staff) ? appt.staff[0] : appt.staff;

         try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'REMINDER_WEBHOOK',
                subType: typeToSend, // 24_HOURS_BEFORE, 2_HOURS_BEFORE veya 30_MINS_AFTER
                appointmentId: appt.id,
                customer: {
                  name: customer?.full_name,
                  email: customer?.email,
                  phone: customer?.phone
                },
                service: service?.name,
                staff: staff?.name,
                date: appt.start_at
              })
            });

            // Başarılı olursa 'reminders' tablosuna LOG olarak ekle ki bir daha gönderilmesin!
            await supabase.from('reminders').insert({
              appointment_id: appt.id,
              type: typeToSend,
              scheduled_for: now.toISOString(),
              sent_at: now.toISOString(),
              attempts: 1
            });

            results.push({ appointment_id: appt.id, type: typeToSend, status: 'sent' });

         } catch (webhookErr) {
            console.error('n8n Webhook hatası:', webhookErr);
         }
      }
    }

    return NextResponse.json({ success: true, processed_count: results.length, details: results });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}