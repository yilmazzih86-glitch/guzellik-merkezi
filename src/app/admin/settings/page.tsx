// src/app/admin/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/server/db/supabaseClient'; // Yolunuzu kontrol edin ../../../ olabilir
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import layoutStyles from '@/styles/layout.module.css'; // Yolunuzu kontrol edin

// 1. Arayüze 'opening_hours' eklendi
interface AppSettings {
  id: string;
  business_name: string;
  phone: string;
  address: string;
  email: string;
  opening_hours: string; // YENİ: Çalışma Saatleri
  booking_rules: {
    slot_minutes: number;
    buffer_minutes: number;
    min_notice_minutes: number;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string;
  duration_min: number;
  price_min: number;
  active: boolean;
}

interface Staff {
  id: string;
  name: string;
  title: string;
  image_url: string;
  active: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Verileri çek (Select * dediğimiz için opening_hours otomatik gelir)
    const { data: settingsData } = await supabaseClient.from('settings').select('*').limit(1).single();
    if (settingsData) {
      setSettings(settingsData as AppSettings);
    }

    const { data: servicesData } = await supabaseClient.from('services').select('*').order('created_at', { ascending: false });
    if (servicesData) setServices(servicesData as Service[]);

    const { data: staffData } = await supabaseClient.from('staff').select('*').order('created_at', { ascending: false });
    if (staffData) setStaffList(staffData as Staff[]);
    
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    
    // 2. Güncelleme sorgusuna 'opening_hours' eklendi
    const { error } = await supabaseClient
      .from('settings')
      .update({
        business_name: settings.business_name,
        phone: settings.phone,
        address: settings.address,
        email: settings.email,
        opening_hours: settings.opening_hours, // YENİ: Kaydediliyor
        booking_rules: settings.booking_rules,
      })
      .eq('id', settings.id);

    setSaving(false);
    if (error) alert('Hata: ' + error.message);
    else alert('Ayarlar başarıyla güncellendi.');
  };

  if (loading) return <div style={{padding: '2rem'}}>Yükleniyor...</div>;

  return (
    <div className={`animate-fade-up ${layoutStyles.stackLg}`}>
      
      {/* ÜST BAŞLIK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        <h1 style={{ margin: 0, color: 'var(--color-text-main)' }}>Kontrol Merkezi</h1>
        <Button variant="primary" onClick={handleSaveSettings} isLoading={saving}>Kaydet</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 'var(--space-32)' }}>
        
        {/* SOL KOLON */}
        <div className={layoutStyles.stackLg}>
          
          {/* İŞLETME PROFİLİ */}
          <Card style={{ padding: 'var(--space-32)', borderTop: '4px solid var(--color-primary)' }}>
            <h3 style={{ marginBottom: 'var(--space-24)', color: 'var(--color-text-main)' }}>İşletme Profili</h3>
            
            <div className={layoutStyles.stack}>
              <Input 
                label="Marka / İşletme Adı" 
                value={settings?.business_name || ''} 
                onChange={e => setSettings({...settings!, business_name: e.target.value})} 
              />
              <Input 
                label="Resmi İletişim Numarası" 
                value={settings?.phone || ''} 
                onChange={e => setSettings({...settings!, phone: e.target.value})} 
              />
               <Input 
                label="Resmi E-Posta" 
                value={settings?.email || ''} 
                onChange={e => setSettings({...settings!, email: e.target.value})} 
              />
              
              {/* 3. YENİ: Çalışma Saatleri Inputu */}
              <Input 
                label="Çalışma Saatleri Bilgisi" 
                value={settings?.opening_hours || ''} 
                onChange={e => setSettings({...settings!, opening_hours: e.target.value})} 
                placeholder="Örn: Hafta içi 09:00 - 18:00"
              />
              
              {/* Harita */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-main)' }}>
                  Google Harita (Embed HTML)
                </label>
                <textarea 
                  rows={4}
                  value={settings?.address || ''} 
                  onChange={e => setSettings({...settings!, address: e.target.value})}
                  className={layoutStyles.textarea} // Veya inline style
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          </Card>

          {/* 2. UZMAN KADROSU (Sadece Görüntüleme) */}
          <Card style={{ padding: 'var(--space-32)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: 'var(--text-lg)' }}>Uzman Kadrosu</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>{staffList.length} personel kayıtlı</p>
                </div>
               </div>
               
               <Link href="/admin/staff" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', border: '1px solid var(--color-primary)', padding: '6px 12px', borderRadius: '20px' }}>
                 Yönet →
               </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {staffList.slice(0, 3).map(staff => (
                <div key={staff.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', padding: 'var(--space-12)', borderBottom: '1px solid var(--color-border)', opacity: staff.active ? 1 : 0.6 }}>
                   {staff.image_url ? (
                      <img src={staff.image_url} alt={staff.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold' }}>{staff.name.charAt(0)}</div>
                    )}
                    <div>
                      <strong style={{ color: 'var(--color-text-main)', display: 'block', fontSize: 'var(--text-sm)' }}>{staff.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{staff.title}</span>
                    </div>
                </div>
              ))}
              {staffList.length > 3 && (
                <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-8)' }}>
                  + {staffList.length - 3} kişi daha
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* SAĞ KOLON: Hizmetler */}
        <div className={layoutStyles.stackLg}>
          <Card style={{ padding: 'var(--space-32)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: 'var(--text-lg)' }}>Vitrin Hizmetleri</h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>{services.length} hizmet aktif</p>
                </div>
              </div>

              <Link href="/admin/services" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', border: '1px solid var(--color-primary)', padding: '6px 12px', borderRadius: '20px' }}>
                 Yönet →
               </Link>
            </div>

            <div style={{ backgroundColor: 'var(--color-background)', padding: 'var(--space-16)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-24)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Yeni hizmet eklemek, fiyatları güncellemek veya hizmetleri kaldırmak için <Link href="/admin/services" style={{ color: 'var(--color-primary)', fontWeight: '500' }}>Hizmet Yönetimi</Link> sayfasını kullanın.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {services.map((service, index) => (
                <div key={service.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s`, display: 'flex', gap: 'var(--space-16)', padding: 'var(--space-16)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', opacity: service.active ? 1 : 0.6 }}>
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--color-text-main)', fontSize: '14px' }}>{service.name}</strong>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: service.active ? 'rgba(46, 204, 113, 0.1)' : 'rgba(149, 165, 166, 0.1)', color: service.active ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        {service.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '500', margin: '4px 0' }}>
                      {service.duration_min} Dk. {service.price_min ? `• ${service.price_min} ₺` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}