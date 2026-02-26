'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../server/db/supabaseClient';
import { Card } from '../../../components/ui/Card/Card';
import { Input } from '../../../components/ui/Input/Input';
import { Button } from '../../../components/ui/Button/Button';
import layoutStyles from '../../../styles/layout.module.css';

// TypeScript Tipleri
interface AppSettings {
  id: string;
  business_name: string;
  phone: string;
  address: string;
  booking_rules: {
    slot_minutes: number;
    buffer_minutes: number;
    min_notice_minutes: number;
  };
}

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_min: number;
  active: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Yeni Servis Ekleme Formu State'leri
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. Ayarları çek (Tabloda sadece 1 satır olmalı)
    const { data: settingsData } = await supabaseClient
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsData) {
      setSettings(settingsData as AppSettings);
    } else {
      // Eğer veritabanı boşsa (ilk kurulum), varsayılan bir ayar satırı oluşturalım
      const defaultSettings = {
        business_name: 'Luxe Beauty Center',
        phone: '',
        address: '',
        timezone: 'Europe/Istanbul',
        opening_hours: { "mon": [{"start":"10:00","end":"20:00"}], "tue": [{"start":"10:00","end":"20:00"}] },
        booking_rules: { slot_minutes: 30, buffer_minutes: 0, min_notice_minutes: 60 }
      };
      const { data: newSettings } = await supabaseClient
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();
      setSettings(newSettings as AppSettings);
    }

    // 2. Servisleri çek
    const { data: servicesData } = await supabaseClient
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (servicesData) setServices(servicesData as Service[]);
    
    setLoading(false);
  };

  // Ayarları Kaydet
  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabaseClient
      .from('settings')
      .update({
        business_name: settings.business_name,
        phone: settings.phone,
        address: settings.address,
        booking_rules: settings.booking_rules,
      })
      .eq('id', settings.id);

    setSaving(false);
    if (error) alert('Ayarlar kaydedilirken hata oluştu!');
    else alert('Ayarlar başarıyla güncellendi.');
  };

  // Yeni Servis Ekle
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;

    const { data, error } = await supabaseClient
      .from('services')
      .insert([{
        name: newServiceName,
        duration_min: parseInt(newServiceDuration),
        price_min: newServicePrice ? parseInt(newServicePrice) : null,
        active: true
      }])
      .select()
      .single();

    if (data && !error) {
      setServices([data as Service, ...services]);
      setNewServiceName('');
      setNewServicePrice('');
      alert('Hizmet eklendi!');
    } else {
      alert('Hizmet eklenemedi.');
    }
  };

  // Servis Sil / Pasife Al (Basit silme simülasyonu)
  const handleDeleteService = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    
    const { error } = await supabaseClient.from('services').delete().eq('id', id);
    if (!error) {
      setServices(services.filter(s => s.id !== id));
    } else {
      alert('Silme işlemi başarısız. (Bu hizmete ait geçmiş randevu olabilir)');
    }
  };

  if (loading) return <div>Ayarlar yükleniyor...</div>;

  return (
    <div className={layoutStyles.stackLg}>
      <h1 style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        Sistem Ayarları
      </h1>

      <div className={layoutStyles.grid}>
        {/* SOL KOLON: İşletme Ayarları */}
        <div className={layoutStyles.stack}>
          <Card className={layoutStyles.stack}>
            <h3>İşletme Bilgileri</h3>
            <Input 
              label="İşletme Adı" 
              value={settings?.business_name || ''} 
              onChange={e => setSettings({...settings!, business_name: e.target.value})} 
            />
            <Input 
              label="Telefon Numarası" 
              value={settings?.phone || ''} 
              onChange={e => setSettings({...settings!, phone: e.target.value})} 
            />
            <Input 
              label="Adres" 
              value={settings?.address || ''} 
              onChange={e => setSettings({...settings!, address: e.target.value})} 
            />
          </Card>

          <Card className={layoutStyles.stack}>
            <h3>Randevu Kuralları</h3>
            <Input 
              label="Randevu Periyodu (Dakika - Örn: 30 dakikada bir)" 
              type="number"
              value={settings?.booking_rules.slot_minutes || 30} 
              onChange={e => setSettings({
                ...settings!, 
                booking_rules: {...settings!.booking_rules, slot_minutes: parseInt(e.target.value)}
              })} 
            />
            <Input 
              label="Minimum Bildirim Süresi (Dakika - Örn: 60 dk öncesine kadar randevu alınabilir)" 
              type="number"
              value={settings?.booking_rules.min_notice_minutes || 60} 
              onChange={e => setSettings({
                ...settings!, 
                booking_rules: {...settings!.booking_rules, min_notice_minutes: parseInt(e.target.value)}
              })} 
            />
            <Button variant="primary" onClick={handleSaveSettings} isLoading={saving} style={{ marginTop: 'var(--space-16)' }}>
              Ayarları Kaydet
            </Button>
          </Card>
        </div>

        {/* SAĞ KOLON: Hizmet Yönetimi */}
        <div className={layoutStyles.stack}>
          <Card className={layoutStyles.stack}>
            <h3>Yeni Hizmet Ekle</h3>
            <form onSubmit={handleAddService} className={layoutStyles.stack}>
              <Input 
                label="Hizmet Adı (Örn: Cilt Bakımı)" 
                value={newServiceName} 
                onChange={e => setNewServiceName(e.target.value)} 
                required 
              />
              <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
                <Input 
                  label="Süre (Dk)" 
                  type="number" 
                  value={newServiceDuration} 
                  onChange={e => setNewServiceDuration(e.target.value)} 
                  required 
                />
                <Input 
                  label="Fiyat (₺)" 
                  type="number" 
                  value={newServicePrice} 
                  onChange={e => setNewServicePrice(e.target.value)} 
                />
              </div>
              <Button type="submit" variant="secondary">Hizmet Ekle</Button>
            </form>
          </Card>

          <Card className={layoutStyles.stack}>
            <h3>Mevcut Hizmetler</h3>
            {services.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Henüz hizmet eklenmedi.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {services.map(service => (
                  <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-12)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <strong>{service.name}</strong>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {service.duration_min} dk | {service.price_min ? `${service.price_min} ₺` : 'Fiyat Belirtilmemiş'}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}