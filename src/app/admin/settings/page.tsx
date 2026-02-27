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

  // Yeni Form State'leri
  const [newService, setNewService] = useState({ name: '', description: '', image_url: '', duration: '30', price: '' });
  const [newStaff, setNewStaff] = useState({ name: '', title: '', image_url: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Verileri Çek
    const { data: settingsData } = await supabaseClient.from('settings').select('*').limit(1).single();
    if (settingsData) setSettings(settingsData as AppSettings);

    const { data: servicesData } = await supabaseClient.from('services').select('*').order('created_at', { ascending: false });
    if (servicesData) setServices(servicesData as Service[]);

    const { data: staffData } = await supabaseClient.from('staff').select('*').order('created_at', { ascending: false });
    if (staffData) setStaffList(staffData as Staff[]);
    
    setLoading(false);
  };

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
    else alert('İşletme ayarları başarıyla güncellendi.');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name) return;

    const { data, error } = await supabaseClient
      .from('services')
      .insert([{
        name: newService.name,
        description: newService.description,
        image_url: newService.image_url,
        duration_min: parseInt(newService.duration),
        price_min: newService.price ? parseInt(newService.price) : null,
        active: true
      }])
      .select()
      .single();

    if (data && !error) {
      setServices([data as Service, ...services]);
      setNewService({ name: '', description: '', image_url: '', duration: '30', price: '' });
    }
  };

  const handleDeleteService = async (id: string) => {
  if (!confirm('Bu hizmeti vitrinden kaldırmak istediğinize emin misiniz?')) return;

  try {
    const { error } = await supabaseClient
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      // Supabase bir hata döndürdüyse yakala ve göster
      console.error('Silme hatası detayları:', error);
      
      if (error.code === '23503') { // Foreign Key Violation kodu
        alert('Bu hizmeti silemezsiniz çünkü geçmiş randevularla ilişkili! Bunun yerine hizmeti pasife almayı deneyin (Faz 2 özelliği).');
      } else if (error.code === '42501') { // RLS Policy kodu
        alert('Yetki Hatası: Bu işlemi yapmaya izniniz yok. Lütfen RLS politikalarını kontrol edin.');
      } else {
        alert(`Silme başarısız: ${error.message}`);
      }
      return;
    }

    // Hata yoksa state'i güncelle
    setServices(services.filter(s => s.id !== id));
    alert('Hizmet başarıyla silindi.');

  } catch (err) {
    console.error('Beklenmeyen hata:', err);
    alert('Beklenmeyen bir hata oluştu.');
  }
};

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name) return;

    const { data, error } = await supabaseClient
      .from('staff')
      .insert([{
        name: newStaff.name,
        title: newStaff.title,
        image_url: newStaff.image_url,
        active: true
      }])
      .select()
      .single();

    if (data && !error) {
      setStaffList([data as Staff, ...staffList]);
      setNewStaff({ name: '', title: '', image_url: '' });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Bu uzmanı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabaseClient.from('staff').delete().eq('id', id);
    if (!error) setStaffList(staffList.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', color: 'var(--color-primary)', padding: 'var(--space-24)' }}>
        <svg className="spinner" style={{ animation: 'spin 1s linear infinite', width: '1.5em', height: '1.5em' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span style={{ fontSize: 'var(--text-lg)', fontWeight: '500' }}>Sistem Yapılandırması Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up ${layoutStyles.stackLg}`}>
      
      {/* BAŞLIK */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)' }}>
        <div>
          <h1 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-text-main)', fontWeight: '300' }}>Kontrol Merkezi</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Sitenizin anasayfasını, iletişim bilgilerini ve vitrinini buradan yönetin.</p>
        </div>
        <Button variant="primary" onClick={handleSaveSettings} isLoading={saving} style={{ padding: '8px 24px', borderRadius: '50px' }}>
          Tüm Değişiklikleri Kaydet
        </Button>
      </div>

      {/* Sola sıkışmayı çözen, iki kolonu ortalayıp genişleten 
        özel Grid yapısı (auto-fit ve minmax ile ekranı tam kaplar)
      */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: 'var(--space-32)',
        alignItems: 'start' /* Kartların birbirine bağlı olarak uzamasını engeller */
      }}>
        
        {/* SOL KOLON: İşletme & Uzmanlar */}
        <div className={layoutStyles.stackLg}>
          
          {/* 1. İŞLETME BİLGİLERİ */}
          <Card style={{ padding: 'var(--space-32)', borderTop: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-24)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: 'var(--text-lg)' }}>İşletme Profili</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Vitrin ve iletişim bilgileri</p>
              </div>
            </div>
            
            <div className={layoutStyles.stack}>
              <Input label="Marka / İşletme Adı" value={settings?.business_name || ''} onChange={e => setSettings({...settings!, business_name: e.target.value})} />
              <Input label="Resmi İletişim Numarası" value={settings?.phone || ''} onChange={e => setSettings({...settings!, phone: e.target.value})} placeholder="05XX XXX XX XX" />
              <Input label="Açık Adres (Harita için)" value={settings?.address || ''} onChange={e => setSettings({...settings!, address: e.target.value})} />
            </div>
          </Card>

          {/* 2. UZMAN YÖNETİMİ */}
          <Card style={{ padding: 'var(--space-32)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-24)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: 'var(--text-lg)' }}>Uzman Kadrosu</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Randevu alınabilen personeller</p>
              </div>
            </div>
            
            <form onSubmit={handleAddStaff} style={{ backgroundColor: 'var(--color-background)', padding: 'var(--space-24)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-24)', border: '1px dashed var(--color-border)' }}>
              <div className={layoutStyles.stack}>
                <Input label="Uzman Adı Soyadı" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required placeholder="Örn: Dr. Ayşe Yılmaz" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                  <Input label="Ünvan (Kıdemli Estetisyen)" value={newStaff.title} onChange={e => setNewStaff({...newStaff, title: e.target.value})} />
                  <Input label="Profil Fotoğrafı (URL)" value={newStaff.image_url} onChange={e => setNewStaff({...newStaff, image_url: e.target.value})} placeholder="https://..." />
                </div>
                <Button type="submit" variant="secondary" style={{ marginTop: 'var(--space-8)' }}>Kadroya Ekle</Button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {staffList.map(staff => (
                <div key={staff.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-12) var(--space-16)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
                    {staff.image_url ? (
                      <img src={staff.image_url} alt={staff.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold' }}>{staff.name.charAt(0)}</div>
                    )}
                    <div>
                      <strong style={{ color: 'var(--color-text-main)', display: 'block' }}>{staff.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{staff.title || 'Belirtilmedi'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteStaff(staff.id)} title="Uzmanı Sil" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* SAĞ KOLON: Hizmetler */}
        <div className={layoutStyles.stackLg}>
          <Card style={{ padding: 'var(--space-32)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginBottom: 'var(--space-24)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(46, 204, 113, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: 'var(--text-lg)' }}>Vitrin Hizmetleri</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Anasayfa paketleri ve fiyatlandırma</p>
              </div>
            </div>

            <form onSubmit={handleAddService} style={{ backgroundColor: 'var(--color-background)', padding: 'var(--space-24)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-24)', border: '1px dashed var(--color-border)' }}>
              <div className={layoutStyles.stack}>
                <Input label="Hizmet Başlığı" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required placeholder="Örn: Medikal Cilt Bakımı" />
                <Input label="Vitrin Açıklaması" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} placeholder="Kısa ve çekici bir açıklama..." />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                  <Input label="Süre (Dakika)" type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} required />
                  <Input label="Fiyat (₺)" type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                </div>
                
                <Input label="Kapak Fotoğrafı (URL)" value={newService.image_url} onChange={e => setNewService({...newService, image_url: e.target.value})} placeholder="https://images.unsplash.com/..." />
                <Button type="submit" variant="secondary" style={{ marginTop: 'var(--space-8)' }}>Yeni Kart Oluştur</Button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
              {services.map((service, index) => (
                <div key={service.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s`, display: 'flex', gap: 'var(--space-16)', padding: 'var(--space-16)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)' }}>
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--color-text-main)', fontSize: '15px' }}>{service.name}</strong>
                      <button onClick={() => handleDeleteService(service.id)} title="Hizmeti Kaldır" style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 0 }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '500', margin: '4px 0' }}>
                      {service.duration_min} Dk. {service.price_min ? `• ${service.price_min} ₺` : ''}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {service.description || 'Açıklama girilmemiş.'}
                    </p>
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