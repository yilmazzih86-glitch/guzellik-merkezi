# 🚀 Güzellik Merkezi CRM - Teknik Analiz ve Geliştirme Rotası

Bu belge, **Faz 1.1 (Gelişmiş Admin Paneli)** ve **Faz 2 (Entegrasyonlar)** süreçlerini teknik detaylarıyla ele alır.

## 🛠 Teknik Mimari ve Standartlar

* **Framework:** Next.js 14+ (App Router)
* **Styling:** CSS Modules (`*.module.css`) + Global Tokens (`tokens.css`). **Tailwind KESİNLİKLE YOK.**
* **Database:** Supabase (PostgreSQL).
* **Logic:** Kritik işlemler (Randevu oluşturma, çakışma kontrolü) veritabanı seviyesinde (RPC) çözülür.

---

## 📊 Bölüm 1: Mevcut Durum Analizi (Gap Analysis)

**Güçlü Yönler:**
1.  **Transactional Integrity:** `book_appointment` fonksiyonu sayesinde "Race Condition" riski sıfıra indirilmiş.
2.  **Güvenlik:** RLS politikaları, anonim erişimi tamamen kapatıp sadece authenticated adminlere izin verecek şekilde doğru yapılandırılmış.

**Tespit Edilen Eksikler & Riskler:**
1.  **Fiyat Tutarlılığı:** `appointments` tablosu `service_id` referansı tutuyor. Ancak hizmet fiyatı zamlandığında, geçmiş randevuların cirosu hatalı hesaplanır.
    * *Çözüm:* `appointments` tablosuna `price_at_booking` (numeric) sütunu eklenmeli.
2.  **Personel Müsaitliği:** Şu an `staff` tablosu çok basit. Personelin "Salı izinli" veya "09:00 - 14:00 çalışıyor" bilgisini tutacak bir yapı yok.
3.  **Dashboard Performansı:** Admin dashboard yüklendiğinde front-end tarafında `.length` ile sayım yapmak yerine, Supabase üzerinde `count()` döndüren hafif SQL View veya RPC'lere ihtiyaç var.

---

## 🗺 Bölüm 2: Faz 1.1 - Admin Paneli & CRM (Detaylı Rota)

Bu faz, operasyonel süreçlerin dijitalleşmesini hedefler.

### 📌 Adım 1: Veritabanı İyileştirmeleri (Migration)
Admin paneli arayüzüne girmeden önce altyapıyı hazırlamalıyız.

* [ ] **Appointment Table Update:** Randevu anındaki fiyatı sabitlemek için sütun ekle.
* [ ] **Staff Availability:** Personel çalışma saatleri ve izinleri için JSONB veya ilişkisel tablo yapısı kur.
    * *Öneri:* `staff` tablosuna `availability` (JSONB) sütunu ekle. Örn: `{"monday": ["09:00", "18:00"], "tuesday": null}`
* [ ] **Dashboard RPCs:**
    * `get_dashboard_stats()`: Tek sorguda bugünkü randevu sayısı, tahmini ciro ve bekleyen onayları döndüren SQL fonksiyonu.

### 📌 Adım 2: Dashboard (Yönetici Özeti)
* **UI Bileşenleri:** `StatCard` (ikonlu, artış/azalış göstergeli), `RevenueChart` (CSS ile basit bar chart).
* **Veri Akışı:**
    * Sayfa yüklendiğinde `get_dashboard_stats` RPC çağrılır.
    * "Bugün", "Bu Hafta", "Bu Ay" filtreleri ile veriler re-fetch edilir.

### 📌 Adım 3: Randevu Yönetimi (Operasyon)
Takvim görünümü ve durum yönetimi.

* **Görünüm Modları:**
    1.  **Liste Görünümü:** Filtrelenebilir tablo (Tarih, Personel, Durum).
    2.  **Günlük Akış (Timeline):** CSS Grid kullanılarak dikey zaman çizelgesi.
* **Aksiyonlar:**
    * *Onayla/İptal Et:* Supabase `UPDATE appointments SET status = ...`
    * *Tamamlandı:* Randevu tamamlandığında `audit_logs`'a "Hizmet Tamamlandı" kaydı atılır.

### 📌 Adım 4: Müşteri Kartı (CRM)
Müşteriyi sadece isim olarak değil, değer olarak görmek.

* **Profil Sayfası:**
    * Sol Panel: Müşteri bilgileri (Düzenlenebilir).
    * Sağ Panel: Randevu Geçmişi (Tablo).
    * *Metrikler:* Toplam Harcama (LTV), Randevu Sayısı, No-Show Oranı.
    * *Notlar:* Özel müşteri notları (TextArea).

### 📌 Adım 5: Ayarlar & Personel
* **Hizmet Yönetimi:** Yeni hizmet ekleme, süre ve fiyat güncelleme.
* **Personel Yönetimi:**
    * Çalışma saatlerini görsel bir "Haftalık Planlayıcı" (Weekly Scheduler) komponenti ile yönetme.
    * Bu ayarların `availability` sütununa JSON olarak kaydedilmesi.

---

## 🔗 Bölüm 3: Faz 2 - Dış Entegrasyonlar ve İletişim

Sistemin dış dünya ile konuşması.

### 1. Google Takvim Entegrasyonu (2-Yönlü)
* **Mimari:** Supabase Auth ile Google OAuth provider'ı bağlanacak.
* **Flow:**
    * Admin "Google ile Bağlan" der.
    * Access & Refresh Token `settings` veya `admin_profiles` tablosunda şifreli saklanır.
    * **Senaryo A (Sistemden Google'a):** Yeni randevu oluştuğunda Google Calendar API'ye `insert` isteği atılır.
    * **Senaryo B (Google'dan Sisteme):** (İleri seviye) Google'daki "Meşgul" blokları, sistemde randevu alınamaz alan olarak işaretlenir.

### 2. Otomasyon & Bildirimler (Cron Jobs)
Next.js API Route + Vercel Cron (veya harici trigger) kullanılır.

* **Endpoint:** `/api/cron/reminders`
* **Mantık:**
    1.  `reminders` tablosunu sorgula: `sent_at IS NULL` VE `scheduled_for < NOW()`.
    2.  Bulunan kayıtlar için e-posta gönder (Resend veya Nodemailer).
    3.  Gönderim başarılıysa `sent_at` timestamp güncelle, başarısızsa `last_error` yaz.

---

## 🎨 UI/UX Tasarım Prensipleri (CSS Modules)

Bu projede "No Tailwind" kuralına sadık kalarak şu yapı izlenecek:

1.  **Token First:** Renkler, boşluklar ve fontlar sadece `var(--color-primary)` şeklinde `tokens.css`'ten çekilecek.
2.  **Semantic Class Names:** `.flex`, `.p-4` gibi utility isimleri yerine; `.appointmentCard`, `.statusBadge--confirmed` gibi anlamsal isimler kullanılacak.
3.  **Layout:** Grid ve Flexbox modern CSS standartlarında kullanılacak.

## 📅 Kısa Vadeli İş Planı (Sprint Backlog)

| Öncelik | Görev | Tahmini Süre |
| :--- | :--- | :--- |
| 🔥 **Yüksek** | **Migration:** `appointments` tablosuna fiyat sütunu ekle | 1 Saat |
| 🔥 **Yüksek** | **Backend:** Dashboard istatistikleri için RPC yazımı | 2-3 Saat |
| ⚡ **Orta** | **Frontend:** Admin Dashboard ana ekran tasarımı (CSS Modules) | 1 Gün |
| ⚡ **Orta** | **Frontend:** Randevu Listesi ve Durum Güncelleme UI | 1-2 Gün |
| 🧊 **Düşük** | **Backend:** Google OAuth altyapı araştırması | Yarım Gün |
