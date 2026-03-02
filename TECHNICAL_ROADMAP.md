<<<<<<< HEAD
# 🚀 Güzellik Merkezi CRM - Güncel Teknik Durum ve Yol Haritası

**Son Güncelleme:** 2 Mart 2026
**Statü:** Faz 1.1 Tamamlandı / Faz 1.2 (Randevu Motoru) Başlıyor

---

## 🛠 Teknik Mimari ve Standartlar

* **Framework:** Next.js 14+ (App Router)
* **Rendering Strategy:**
    * **Public Pages:** Server Components (SEO & Performans için).
    * **Admin Pages:** Client Components (`'use client'`) + Supabase Auth Listener (Güvenlik için).
* **Styling:** CSS Modules + Global Tokens (`tokens.css`). **(Tailwind Yok)**.
* **Database:** Supabase (PostgreSQL).
* **Logic:**
    * **Veri Okuma:** Client-side fetching (Admin), Server-side fetching (Public).
    * **İş Mantığı:** SQL RPC Fonksiyonları (İstatistikler, Müsaitlik Hesaplama).

---

## ✅ Bölüm 1: Tamamlanan Geliştirmeler (Faz 1.1 Log)

Aşağıdaki maddeler kodlanmış, test edilmiş ve canlıya alınmıştır.

### 1. Veritabanı ve Altyapı
- [x] **Fiyat Tutarlılığı:** `appointments` tablosuna `price_at_booking` sütunu eklendi. Randevu anındaki fiyat artık sabitleniyor.
- [x] **Personel Şeması:** `staff` tablosuna `availability` (JSONB) sütunu eklendi.
- [x] **Dashboard RPC:** `get_dashboard_stats` SQL fonksiyonu yazıldı. Timezone (Europe/Istanbul) sorunları çözüldü.
- [x] **Session Fix:** Admin paneli için RLS politikaları ve Client-Side auth yapısı kuruldu.

### 2. Yönetim Paneli (Dashboard)
- [x] **Canlı İstatistikler:** Ciro, Randevu Sayısı ve Müşteri Sayısı veritabanından anlık çekiliyor.
- [x] **Randevu Listesi:** İlişkisel veri (Join) kullanılarak Müşteri ve Hizmet isimleri tabloya getirildi.
- [x] **Durum Rozetleri:** Randevu durumları renk kodlarıyla (Onaylı, İptal vb.) görselleştirildi.

### 3. Uzman Kadrosu Yönetimi
- [x] **CRUD İşlemleri:** Personel Listeleme, Ekleme, Düzenleme ve Silme sayfaları tamamlandı.
- [x] **Vardiya Yönetimi (Availability):** Haftalık çalışma saatlerini ayarlayan, "Çalışıyor/İzinli" mantığıyla çalışan JSON tabanlı arayüz geliştirildi.
- [x] **Navigasyon:** Sidebar'a "Uzman Kadrosu" eklendi, Ayarlar sayfasından personel yönetimi ayrıştırıldı (Refactoring).
- [x] **Ayarlar Sayfası:** Sadeleştirildi, sadece işletme ve vitrin hizmetlerini yönetiyor.

---

## 🚧 Bölüm 2: Faz 1.2 - Akıllı Randevu Motoru (Şu Anki Odak)

Yönetim paneli hazır. Şimdi müşterinin gördüğü randevu sayfasını (`/book`) yeni kurallara bağlayacağız.

### 🎯 Hedef: Public Randevu Sayfasını "Akıllandırmak"

1.  **Hizmet Bazlı Personel Filtreleme:**
    * Müşteri bir hizmet seçtiğinde, arka planda o hizmeti verebilen uzmanlar filtrelenecek.
    * *Teknik:* Şimdilik tüm uzmanlar tüm hizmetleri veriyor varsayımıyla ilerlenecek.

2.  **Dinamik Saat Slotları (En Kritik Madde):**
    * Müşteri tarih seçtiğinde;
        * Seçilen uzmanın o günkü `availability` saati (Örn: 09:00 - 18:00) çekilecek.
        * O günkü **dolu randevular** bu saatlerden çıkarılacak.
        * Geriye kalan boşluklar, seçilen hizmetin süresine (Örn: 30 dk) bölünerek slotlar halinde gösterilecek.
    * *Teknik:* Supabase tarafında `get_available_slots(date, staff_id, service_duration)` RPC fonksiyonu yazılacak.

3.  **Randevu Tamamlama:**
    * Seçilen slotun veritabanına `price_at_booking` ile birlikte kaydedilmesi.

---

## 🗺 Bölüm 3: Faz 2 - CRM ve Entegrasyonlar (Gelecek)

Operasyonel akış oturduktan sonra devreye alınacak özellikler.

### 1. Medya Yönetimi (Storage)
* **Hedef:** Supabase Storage bucket oluşturulacak. Admin panelinde "Dosya Yükle" butonu ile personellerin ve hizmetlerin fotoğrafları yüklenecek.

### 2. Müşteri Kartı (CRM)
* **Hedef:** `/admin/customers/[id]` sayfası yapılacak.
* Müşterinin geçmiş randevuları, toplam harcaması (LTV) ve notlar burada tutulacak.

### 3. Google Takvim Entegrasyonu
* Akıllı randevu motoru bittikten sonra, oluşan randevuları Google Takvim'e `insert` eden API yazılacak.

---

## 📅 Güncel İş Planı (Sprint Backlog)

| Öncelik | Görev | Durum |
| :--- | :--- | :--- |
| ✅ **Tamam** | **DB Migration:** Fiyat ve Availability sütunları | **DONE** |
| ✅ **Tamam** | **Backend:** Dashboard RPC ve Timezone fix | **DONE** |
| ✅ **Tamam** | **Frontend:** Admin Dashboard & Staff CRUD | **DONE** |
| ✅ **Tamam** | **Frontend:** Availability (Vardiya) UI | **DONE** |
| 🔥 **Yüksek** | **Backend:** `get_available_slots` RPC Fonksiyonu (Slot Hesaplama) | **TODO** |
| 🔥 **Yüksek** | **Frontend:** Public `/book` sayfasını yeni mantığa bağlama | **TODO** |
| ⚡ **Orta** | **Storage:** Resim Yükleme (Supabase Storage) | **TODO** |
| ⚡ **Orta** | **Frontend:** Müşteri Detay Sayfası | **TODO** |
=======
# 🚀 Güzellik Merkezi CRM - Güncel Teknik Durum ve Yol Haritası

**Son Güncelleme:** 2 Mart 2026
**Statü:** Faz 1.1 Tamamlandı / Faz 1.2 (Randevu Motoru) Başlıyor

---

## 🛠 Teknik Mimari ve Standartlar

* **Framework:** Next.js 14+ (App Router)
* **Rendering Strategy:**
    * **Public Pages:** Server Components (SEO & Performans için).
    * **Admin Pages:** Client Components (`'use client'`) + Supabase Auth Listener (Güvenlik için).
* **Styling:** CSS Modules + Global Tokens (`tokens.css`). **(Tailwind Yok)**.
* **Database:** Supabase (PostgreSQL).
* **Logic:**
    * **Veri Okuma:** Client-side fetching (Admin), Server-side fetching (Public).
    * **İş Mantığı:** SQL RPC Fonksiyonları (İstatistikler, Müsaitlik Hesaplama).

---

## ✅ Bölüm 1: Tamamlanan Geliştirmeler (Faz 1.1 Log)

Aşağıdaki maddeler kodlanmış, test edilmiş ve canlıya alınmıştır.

### 1. Veritabanı ve Altyapı
- [x] **Fiyat Tutarlılığı:** `appointments` tablosuna `price_at_booking` sütunu eklendi. Randevu anındaki fiyat artık sabitleniyor.
- [x] **Personel Şeması:** `staff` tablosuna `availability` (JSONB) sütunu eklendi.
- [x] **Dashboard RPC:** `get_dashboard_stats` SQL fonksiyonu yazıldı. Timezone (Europe/Istanbul) sorunları çözüldü.
- [x] **Session Fix:** Admin paneli için RLS politikaları ve Client-Side auth yapısı kuruldu.

### 2. Yönetim Paneli (Dashboard)
- [x] **Canlı İstatistikler:** Ciro, Randevu Sayısı ve Müşteri Sayısı veritabanından anlık çekiliyor.
- [x] **Randevu Listesi:** İlişkisel veri (Join) kullanılarak Müşteri ve Hizmet isimleri tabloya getirildi.
- [x] **Durum Rozetleri:** Randevu durumları renk kodlarıyla (Onaylı, İptal vb.) görselleştirildi.

### 3. Uzman Kadrosu Yönetimi
- [x] **CRUD İşlemleri:** Personel Listeleme, Ekleme, Düzenleme ve Silme sayfaları tamamlandı.
- [x] **Vardiya Yönetimi (Availability):** Haftalık çalışma saatlerini ayarlayan, "Çalışıyor/İzinli" mantığıyla çalışan JSON tabanlı arayüz geliştirildi.
- [x] **Navigasyon:** Sidebar'a "Uzman Kadrosu" eklendi, Ayarlar sayfasından personel yönetimi ayrıştırıldı (Refactoring).
- [x] **Ayarlar Sayfası:** Sadeleştirildi, sadece işletme ve vitrin hizmetlerini yönetiyor.

---

## 🚧 Bölüm 2: Faz 1.2 - Akıllı Randevu Motoru (Şu Anki Odak)

Yönetim paneli hazır. Şimdi müşterinin gördüğü randevu sayfasını (`/book`) yeni kurallara bağlayacağız.

### 🎯 Hedef: Public Randevu Sayfasını "Akıllandırmak"

1.  **Hizmet Bazlı Personel Filtreleme:**
    * Müşteri bir hizmet seçtiğinde, arka planda o hizmeti verebilen uzmanlar filtrelenecek.
    * *Teknik:* Şimdilik tüm uzmanlar tüm hizmetleri veriyor varsayımıyla ilerlenecek.

2.  **Dinamik Saat Slotları (En Kritik Madde):**
    * Müşteri tarih seçtiğinde;
        * Seçilen uzmanın o günkü `availability` saati (Örn: 09:00 - 18:00) çekilecek.
        * O günkü **dolu randevular** bu saatlerden çıkarılacak.
        * Geriye kalan boşluklar, seçilen hizmetin süresine (Örn: 30 dk) bölünerek slotlar halinde gösterilecek.
    * *Teknik:* Supabase tarafında `get_available_slots(date, staff_id, service_duration)` RPC fonksiyonu yazılacak.

3.  **Randevu Tamamlama:**
    * Seçilen slotun veritabanına `price_at_booking` ile birlikte kaydedilmesi.

---

## 🗺 Bölüm 3: Faz 2 - CRM ve Entegrasyonlar (Gelecek)

Operasyonel akış oturduktan sonra devreye alınacak özellikler.

### 1. Medya Yönetimi (Storage)
* **Hedef:** Supabase Storage bucket oluşturulacak. Admin panelinde "Dosya Yükle" butonu ile personellerin ve hizmetlerin fotoğrafları yüklenecek.

### 2. Müşteri Kartı (CRM)
* **Hedef:** `/admin/customers/[id]` sayfası yapılacak.
* Müşterinin geçmiş randevuları, toplam harcaması (LTV) ve notlar burada tutulacak.

### 3. Google Takvim Entegrasyonu
* Akıllı randevu motoru bittikten sonra, oluşan randevuları Google Takvim'e `insert` eden API yazılacak.

---

## 📅 Güncel İş Planı (Sprint Backlog)

| Öncelik | Görev | Durum |
| :--- | :--- | :--- |
| ✅ **Tamam** | **DB Migration:** Fiyat ve Availability sütunları | **DONE** |
| ✅ **Tamam** | **Backend:** Dashboard RPC ve Timezone fix | **DONE** |
| ✅ **Tamam** | **Frontend:** Admin Dashboard & Staff CRUD | **DONE** |
| ✅ **Tamam** | **Frontend:** Availability (Vardiya) UI | **DONE** |
| 🔥 **Yüksek** | **Backend:** `get_available_slots` RPC Fonksiyonu (Slot Hesaplama) | **TODO** |
| 🔥 **Yüksek** | **Frontend:** Public `/book` sayfasını yeni mantığa bağlama | **TODO** |
| ⚡ **Orta** | **Storage:** Resim Yükleme (Supabase Storage) | **TODO** |
| ⚡ **Orta** | **Frontend:** Müşteri Detay Sayfası | **TODO** |
>>>>>>> ec8fa64 (Dashboard layout updated)
