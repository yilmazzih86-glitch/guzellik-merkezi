'use client';

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../server/db/supabaseClient';
import { Card } from '../../../components/ui/Card/Card';
import { Input } from '../../../components/ui/Input/Input';
import layoutStyles from '../../../styles/layout.module.css';

// TypeScript Tipleri
interface CustomerAppointment {
  id: string;
  start_at: string;
  status: string;
  service: {
    name: string;
  };
}

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  created_at: string;
  appointments: CustomerAppointment[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Arama yapıldığında listeyi filtrele
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = customers.filter(c => 
        c.full_name.toLowerCase().includes(lowercasedTerm) || 
        (c.phone && c.phone.includes(lowercasedTerm)) ||
        (c.email && c.email.toLowerCase().includes(lowercasedTerm))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    
    // Müşterileri ve onlara ait randevuları (servis adıyla birlikte) çek
    const { data, error } = await supabaseClient
      .from('customers')
      .select(`
        *,
        appointments (
          id,
          start_at,
          status,
          service:services(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setCustomers(data as unknown as Customer[]);
      setFilteredCustomers(data as unknown as Customer[]);
    } else if (error) {
      console.error('Müşteriler çekilirken hata:', error);
    }
    
    setLoading(false);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'confirmed': return 'Onaylandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal';
      case 'no_show': return 'Gelmedi';
      default: return status;
    }
  };

  return (
    <div className={layoutStyles.stackLg}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-16)', flexWrap: 'wrap', gap: 'var(--space-16)' }}>
        <h1>Müşteriler</h1>
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Input 
            label="" 
            placeholder="İsim, telefon veya e-posta ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Müşteriler yükleniyor...</p>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-24)' }}>
            {searchTerm ? 'Aramanıza uygun müşteri bulunamadı.' : 'Sistemde henüz kayıtlı müşteri bulunmuyor.'}
          </p>
        </Card>
      ) : (
        <div className={layoutStyles.grid}>
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className={layoutStyles.stack}>
              {/* Müşteri Üst Bilgi */}
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-8)' }}>
                <h3 style={{ margin: '0 0 var(--space-4) 0', color: 'var(--color-primary)' }}>{customer.full_name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  <span>📧 {customer.email}</span>
                  <span>📱 {customer.phone || 'Belirtilmedi'}</span>
                  <span style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)' }}>
                    Kayıt: {formatDate(customer.created_at)}
                  </span>
                </div>
              </div>

              {/* Randevu Geçmişi Özeti */}
              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
                  Randevu Geçmişi ({customer.appointments?.length || 0})
                </h4>
                
                {customer.appointments && customer.appointments.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Sadece son 3 randevuyu gösterelim ki kart çok uzamasın */}
                    {customer.appointments.slice(0, 3).map(app => (
                      <li key={app.id} style={{ fontSize: 'var(--text-xs)', display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--color-background)', padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-sm)' }}>
                        <span>{app.service?.name}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(app.start_at)} - {getStatusLabel(app.status)}
                        </span>
                      </li>
                    ))}
                    {customer.appointments.length > 3 && (
                      <li style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
                        + {customer.appointments.length - 3} randevu daha
                      </li>
                    )}
                  </ul>
                ) : (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Henüz randevusu yok.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}