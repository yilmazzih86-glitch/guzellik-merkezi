// src/components/admin/CustomerList/CustomerTable.tsx
'use client'; // Arama özelliği için Client Component olmak zorunda

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './CustomerList.module.css';
import { Customer } from '@/types/custom';

interface Props {
  initialCustomers: Customer[];
}

export default function CustomerTable({ initialCustomers }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  // Arama Fonksiyonu
  const filteredCustomers = initialCustomers.filter(customer => {
    const term = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.includes(term))
    );
  });

  // İsimden Baş Harf Çıkarma (Avatar için)
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Para Formatı
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      {/* Üst Bar: Arama */}
      <div className={styles.toolbar}>
        <input 
          type="text" 
          placeholder="İsim veya telefon ile ara..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Toplam <strong>{filteredCustomers.length}</strong> kayıt
        </div>
      </div>

      {/* Tablo */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Müşteri Bilgisi</th>
              <th>Toplam Harcama</th>
              <th>Ziyaret</th>
              <th>Son Görülme</th>
              <th style={{ textAlign: 'right' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust) => {
                const isVip = (cust.total_spend || 0) > 5000;
                const isNew = (cust.visit_count || 0) <= 1;

                return (
                  <tr key={cust.id} className={styles.row}>
                    {/* İsim & Avatar */}
                    <td>
                      <div className={styles.customerInfo}>
                        <div className={styles.avatar} style={{ backgroundColor: isVip ? '#d97706' : undefined }}>
                          {getInitials(cust.full_name)}
                        </div>
                        <div>
                          <span className={styles.name}>
                            {cust.full_name}
                            {isVip && <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#d97706' }}>★</span>}
                          </span>
                          <span className={styles.phone}>{cust.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Harcama & Rozet */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(cust.total_spend || 0)}</span>
                        {isVip && <span className={`${styles.badge} ${styles.vip}`}>VIP Müşteri</span>}
                      </div>
                    </td>

                    {/* Ziyaret */}
                    <td>
                      {isNew ? (
                         <span className={`${styles.badge} ${styles.new}`}>Yeni</span>
                      ) : (
                         <span className={`${styles.badge} ${styles.regular}`}>{cust.visit_count}. Ziyaret</span>
                      )}
                    </td>

                    {/* Son Tarih */}
                    <td>
                      {cust.last_visit_at 
                        ? new Date(cust.last_visit_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                        : <span style={{ color: '#ccc' }}>-</span>}
                    </td>

                    {/* Buton */}
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/customers/${cust.id}`} className={styles.detailLink}>
                        Detay →
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                  Aradığınız kriterlere uygun müşteri bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}