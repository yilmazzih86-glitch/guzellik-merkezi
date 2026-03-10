"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/server/db/supabaseClient';
import styles from './Cancel.module.css';

function CancelAppointmentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const supabase = createClient();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Geçersiz veya eksik randevu bağlantısı.');
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select('*, services(name), staff(name)')
          .eq('id', id)
          .single();

        if (fetchError || !data) throw new Error('Randevu bulunamadı veya silinmiş.');
        setAppointment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, supabase]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (updateError) throw updateError;
      
      setAppointment({ ...appointment, status: 'cancelled' });
      setSuccess(true);
    } catch (err: any) {
      alert('İptal işlemi sırasında bir hata oluştu: ' + err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Randevu bilgileriniz yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorCard}>
        <h2>Hata 😔</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Veritabanı ilişki yapısına göre (Array veya Obje) isimleri çekme
  const serviceName = Array.isArray(appointment?.services) ? appointment.services[0]?.name : appointment?.services?.name;
  const staffName = Array.isArray(appointment?.staff) ? appointment.staff[0]?.name : appointment?.staff?.name;
  
  // Tarihi Türkçe ve okunaklı formata çevirme
  const formattedDate = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(appointment.start_at));

  return (
    <div className={styles.card}>
      {success || appointment.status === 'cancelled' ? (
        <div className={styles.successState}>
          <div className={styles.icon}>✅</div>
          <h2>Randevunuz İptal Edildi</h2>
          <p>
            <strong>{formattedDate}</strong> tarihindeki <strong>{serviceName}</strong> randevunuz başarıyla iptal edilmiştir.
          </p>
          <p className={styles.subText}>Yeni bir randevu oluşturmak isterseniz ana sayfamızı ziyaret edebilirsiniz.</p>
        </div>
      ) : appointment.status === 'completed' ? (
         <div className={styles.errorCard}>
           <h2>İptal Edilemez</h2>
           <p>Bu randevu çoktan tamamlanmış veya geçmiş olarak görünüyor.</p>
         </div>
      ) : (
        <div className={styles.cancelState}>
          <div className={styles.iconWarning}>⚠️</div>
          <h2>Randevu İptali</h2>
          <p className={styles.desc}>Aşağıdaki randevunuzu iptal etmek üzeresiniz. Bu işlem geri alınamaz.</p>
          
          <div className={styles.detailsBox}>
            <p><span>Hizmet:</span> {serviceName}</p>
            <p><span>Uzman:</span> {staffName}</p>
            <p><span>Tarih:</span> {formattedDate}</p>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.cancelBtn} 
              onClick={handleCancel} 
              disabled={isCancelling}
            >
              {isCancelling ? 'İptal Ediliyor...' : 'Evet, Randevumu İptal Et'}
            </button>
            <button 
              className={styles.keepBtn} 
              onClick={() => window.location.href = '/'}
            >
              Vazgeç, Randevumu Koru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CancelAppointmentPage() {
  // Next.js 13+ kuralları gereği useSearchParams kullanan yapılar Suspense içine alınmalıdır
  return (
    <div className={styles.pageContainer}>
      <Suspense fallback={<div className={styles.loading}>Yükleniyor...</div>}>
        <CancelAppointmentContent />
      </Suspense>
    </div>
  );
}