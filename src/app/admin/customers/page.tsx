// src/app/admin/customers/page.tsx

import React from 'react';
import { createClient } from '@/server/db/supabase';
import layoutStyles from '@/styles/layout.module.css';
import CustomerTable from '@/components/admin/CustomerList/CustomerTable'; // Yeni bileşenimiz
import { Customer } from '@/types/custom';

export default async function CustomersPage() {
  const supabase = await createClient();

  // Müşterileri en son oluşturulma tarihine göre çek
  const { data: customersData } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  // Tip dönüşümü
  const customers = (customersData || []) as unknown as Customer[];

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.stackLg} style={{ marginTop: '2rem' }}>
        
        {/* Sayfa Başlığı */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Müşteri Havuzu</h1>
                <p style={{ color: 'var(--color-text-light)' }}>Kayıtlı danışanlarınızı yönetin</p>
            </div>
            {/* İleride 'Yeni Ekle' butonu buraya gelebilir */}
        </div>

        {/* Akıllı Tabloyu Yükle */}
        <CustomerTable initialCustomers={customers} />

      </div>
    </div>
  );
}