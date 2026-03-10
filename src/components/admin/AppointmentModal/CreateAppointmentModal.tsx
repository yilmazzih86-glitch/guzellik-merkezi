// src/components/admin/AppointmentModal/CreateAppointmentModal.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/server/db/supabaseClient';
import { addMinutes, format, parseISO } from 'date-fns';
import styles from './CreateAppointmentModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

export default function CreateAppointmentModal({ isOpen, onClose, onSuccess }: Props) {
  const supabase = useMemo(() => createClient(), []);

  // Sistem Verileri
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  
  // Yüklenme Durumları
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Müşteri Tipi
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Form State'leri
  const [customerId, setCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Akıllı Saat Sistemi
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [staffOffDay, setStaffOffDay] = useState(false); // Personel o gün izinli mi?

  // Veritabanından verileri çekerken staff'ın availability (mesai) JSON'unu da alıyoruz
  useEffect(() => {
    if (!isOpen) return; 

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [custRes, servRes, staffRes] = await Promise.all([
          supabase.from('customers').select('id, full_name').order('full_name'),
          supabase.from('services').select('id, name, duration_min').eq('active', true),
          supabase.from('staff').select('id, name, availability').eq('active', true) // availability EKLENDİ
        ]);

        if (custRes.data) setCustomers(custRes.data);
        if (servRes.data) setServices(servRes.data);
        if (staffRes.data) setStaffs(staffRes.data);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, supabase]);

  // AKILLI SAAT ASİSTANI (DİNAMİK MESAİ)
  useEffect(() => {
    if (!date || !staffId || !serviceId) {
      setAvailableSlots([]);
      setTime('');
      setStaffOffDay(false);
      return;
    }

    const fetchAndCalculateSlots = async () => {
      setIsLoadingSlots(true);
      setStaffOffDay(false);

      try {
        const selectedService = services.find(s => s.id === serviceId);
        const selectedStaff = staffs.find(s => s.id === staffId);
        const duration = selectedService?.duration_min || 30;

        // 1. Seçilen tarihin hangi gün olduğunu bul (İngilizce isim olarak)
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const selectedDateObj = new Date(date);
        const dayName = dayNames[selectedDateObj.getDay()]; // Örn: 'monday'

        // 2. Personelin o günkü mesaisini çek
        const staffAvailability = selectedStaff?.availability?.[dayName];

        // Eğer o gün için kayıt null veya tanımlı değilse (İzinli Gün)
        if (!staffAvailability) {
          setAvailableSlots([]);
          setStaffOffDay(true);
          setTime('');
          setIsLoadingSlots(false);
          return;
        }

        // 3. Mesai başlangıç ve bitişini al (Örn: ["09:00", "18:00"])
        const [startHourStr, endHourStr] = staffAvailability;
        
        const dayStart = new Date(`${date}T00:00:00`).toISOString();
        const dayEnd = new Date(`${date}T23:59:59`).toISOString();

        // 4. O günkü, o personele ait İPTAL EDİLMEMİŞ randevuları çek
        const { data: existingApts, error } = await supabase
          .from('appointments')
          .select('start_at, end_at, status')
          .eq('staff_id', staffId)
          .neq('status', 'cancelled')
          .gte('start_at', dayStart)
          .lte('start_at', dayEnd);

        if (error) throw error;

        // 5. Uygun saatleri dinamik mesaiye göre oluştur
        const slots: string[] = [];
        let currentSlot = new Date(`${date}T${startHourStr}:00`); // Sabit 09:00 yerine dinamik
        const endOfShift = new Date(`${date}T${endHourStr}:00`);  // Sabit 20:00 yerine dinamik

        while (currentSlot < endOfShift) {
          const slotStart = currentSlot;
          const slotEnd = addMinutes(currentSlot, duration);

          // Hizmet bitişi mesai bitişini aşıyorsa daha fazla randevu yazılamaz
          if (slotEnd > endOfShift) break;

          const hasOverlap = existingApts?.some(apt => {
            const aptStart = new Date(apt.start_at);
            const aptEnd = new Date(apt.end_at);
            return slotStart < aptEnd && slotEnd > aptStart;
          });

          if (!hasOverlap) {
            slots.push(format(slotStart, 'HH:mm'));
          }

          currentSlot = addMinutes(currentSlot, 30); 
        }

        setAvailableSlots(slots);
        
        if (time && !slots.includes(time)) {
          setTime('');
        }

      } catch (error) {
        console.error('Saatler hesaplanamadı:', error);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAndCalculateSlots();
  }, [date, staffId, serviceId, services, staffs, supabase, time]);


  // Form Gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalCustomerId = customerId;

      if (isNewCustomer) {
        const { data: newCust, error: custErr } = await supabase
          .from('customers')
          .insert({
            full_name: newCustomerName,
            phone: newCustomerPhone,
          })
          .select('id')
          .single();

        if (custErr) throw custErr;
        finalCustomerId = newCust.id;
      }

      const selectedService = services.find(s => s.id === serviceId);
      const duration = selectedService?.duration_min || 30; 
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = addMinutes(startDateTime, duration);

      const { error } = await supabase.from('appointments').insert({
        customer_id: finalCustomerId,
        service_id: serviceId,
        staff_id: staffId,
        start_at: startDateTime.toISOString(),
        end_at: endDateTime.toISOString(),
        status: 'confirmed', 
        source: 'admin'
      });

      if (error) throw error;

      setCustomerId(''); setNewCustomerName(''); setNewCustomerPhone('');
      setServiceId(''); setStaffId(''); setDate(''); setTime('');
      setIsNewCustomer(false);
      
      onSuccess(); 

    } catch (error: any) {
      alert('Hata: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Yeni Randevu Oluştur</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {loadingData ? (
          <div className={styles.loadingState}>Sistem verileri yükleniyor...</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.customerTypeTabs}>
              <button 
                type="button" 
                className={`${styles.tabBtn} ${!isNewCustomer ? styles.activeTab : ''}`}
                onClick={() => setIsNewCustomer(false)}
              >
                Kayıtlı Müşteri
              </button>
              <button 
                type="button" 
                className={`${styles.tabBtn} ${isNewCustomer ? styles.activeTab : ''}`}
                onClick={() => setIsNewCustomer(true)}
              >
                + Yeni Müşteri
              </button>
            </div>

            {!isNewCustomer ? (
              <div className={styles.formGroup}>
                <label>Kayıtlı Müşteri Seçin</label>
                <select required value={customerId} onChange={e => setCustomerId(e.target.value)}>
                  <option value="">-- Müşteri Seç --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Müşteri Ad Soyad</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Örn: Ayşe Yılmaz"
                    value={newCustomerName} 
                    onChange={e => setNewCustomerName(e.target.value)} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Telefon Numarası</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="05XX XXX XX XX"
                    value={newCustomerPhone} 
                    onChange={e => setNewCustomerPhone(e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Hizmet Seçin</label>
                <select required value={serviceId} onChange={e => setServiceId(e.target.value)}>
                  <option value="">-- Hizmet Seç --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration_min} dk)</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Uzman / Personel</label>
                <select required value={staffId} onChange={e => setStaffId(e.target.value)}>
                  <option value="">-- Personel Seç --</option>
                  {staffs.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tarih Seçin</label>
                <input 
                  type="date" 
                  required 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Uygun Saatler</label>
                <select 
                  required 
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  disabled={!date || !staffId || !serviceId || isLoadingSlots || staffOffDay}
                >
                  <option value="">
                    {!date || !staffId || !serviceId 
                      ? 'Önce tarih ve uzman seçin' 
                      : staffOffDay 
                        ? 'Uzman bu gün çalışmıyor!' 
                        : isLoadingSlots 
                          ? 'Saatler hesaplanıyor...' 
                          : availableSlots.length === 0 
                            ? 'Uygun saat yok!' 
                            : '-- Saat Seçin --'}
                  </option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                İptal
              </button>
              <button type="submit" className={styles.submitButton} disabled={isSubmitting || staffOffDay}>
                {isSubmitting ? 'Kaydediliyor...' : 'Randevuyu Onayla'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}