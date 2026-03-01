// src/app/admin/staff/[id]/availability/AvailabilityForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/server/db/supabaseClient';
import styles from './Availability.module.css';

// Veritabanı Tipi
interface AvailabilityData {
  [key: string]: string[] | null;
}

interface Props {
  staffId: string;
  initialData: AvailabilityData | null;
  staffName: string;
}

const DAYS = [
  { key: 'monday', label: 'Pazartesi' },
  { key: 'tuesday', label: 'Salı' },
  { key: 'wednesday', label: 'Çarşamba' },
  { key: 'thursday', label: 'Perşembe' },
  { key: 'friday', label: 'Cuma' },
  { key: 'saturday', label: 'Cumartesi' },
  { key: 'sunday', label: 'Pazar' },
];

export default function AvailabilityForm({ staffId, initialData, staffName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Kurulumu
  const [schedule, setSchedule] = useState(() => {
    const initialState: any = {};
    
    DAYS.forEach((day) => {
      const dbValue = initialData ? initialData[day.key] : null;
      
      // Eğer DB'de değer varsa -> Çalışıyor (isWorking: true)
      if (Array.isArray(dbValue) && dbValue.length === 2) {
        initialState[day.key] = { start: dbValue[0], end: dbValue[1], isWorking: true };
      } else {
        // Değer yoksa (null) -> Çalışmıyor (isWorking: false)
        // Varsayılan saatleri yine de 09:00-18:00 tutuyoruz ki tikleyince hazır gelsin.
        initialState[day.key] = { start: '09:00', end: '18:00', isWorking: false };
      }
    });
    return initialState;
  });

  const handleSave = async () => {
    setLoading(true);
    const dbPayload: AvailabilityData = {};
    
    DAYS.forEach((day) => {
      const dayState = schedule[day.key];
      // Eğer "Çalışıyor" seçiliyse saatleri gönder
      if (dayState.isWorking) {
        dbPayload[day.key] = [dayState.start, dayState.end];
      } else {
        // Çalışmıyorsa NULL gönder
        dbPayload[day.key] = null;
      }
    });

    try {
      const { error } = await supabaseClient
        .from('staff')
        .update({ availability: dbPayload })
        .eq('id', staffId);

      if (error) throw error;
      alert('Çalışma saatleri başarıyla güncellendi!');
      router.refresh();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayKey: string, field: string, value: any) => {
    setSchedule((prev: any) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value }
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          ⏰ Çalışma Saatleri: <span style={{color: 'var(--color-primary)'}}>{staffName}</span>
        </h1>
        <p className={styles.subtitle}>Personelin çalıştığı günleri işaretleyip saat aralığını girin.</p>
      </header>

      <div className={styles.scheduleList}>
        {DAYS.map((day) => {
          const info = schedule[day.key];
          
          return (
            <div key={day.key} className={`${styles.dayCard} ${!info.isWorking ? styles.dayOff : ''}`}>
              
              {/* Sol: Checkbox + Gün İsmi */}
              <div className={styles.dayInfo} style={{ gap: '1rem' }}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={info.isWorking}
                  onChange={(e) => updateDay(day.key, 'isWorking', e.target.checked)}
                  style={{ width: '1.5rem', height: '1.5rem' }}
                />
                <span className={styles.dayName} style={{ opacity: info.isWorking ? 1 : 0.5 }}>
                  {day.label}
                </span>
              </div>

              {/* Orta: Saat Seçiciler veya Kapalı Mesajı */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                {info.isWorking ? (
                  <div className={styles.timeInputs}>
                    <input 
                      type="time" 
                      className={styles.input}
                      value={info.start}
                      onChange={(e) => updateDay(day.key, 'start', e.target.value)}
                    />
                    <span className={styles.separator}>-</span>
                    <input 
                      type="time" 
                      className={styles.input}
                      value={info.end}
                      onChange={(e) => updateDay(day.key, 'end', e.target.value)}
                    />
                  </div>
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Kapalı / İzinli
                  </span>
                )}
              </div>

              {/* Sağ: Durum Metni (Opsiyonel, görseli güçlendirmek için) */}
              <div style={{ width: '80px', textAlign: 'right', marginLeft: '1rem' }}>
                 <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: info.isWorking ? '#10b981' : '#9ca3af',
                    backgroundColor: info.isWorking ? '#d1fae5' : '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px'
                 }}>
                  {info.isWorking ? 'AKTİF' : 'PASİF'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      <div className={styles.actionBar}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          Geri Dön
        </button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
}