# 🌿 Luxe Güzellik Merkezi CRM & Randevu Yönetim Sistemi

Modern güzellik merkezleri, kuaförler ve kliniklerin randevu süreçlerini dijitalleştiren, uçtan uca (**End-to-End**) CRM ve rezervasyon yönetim platformu. Müşteriler için hızlı randevu alma deneyimi sunarken, işletmeler için personel, hizmet ve gelişmiş takvim yönetimini tek bir panelde toplar.

🔗 **Canlı Demo:** [guzellik-merkezi-demo.vercel.app](https://guzellik-merkezi-demo.vercel.app)

---

## 🎯 Projenin Amacı
Geleneksel randevu defterlerini ve manuel takibi ortadan kaldırarak operasyonel verimliliği artırmayı hedefler:

* **Hatalı Randevuları Önlemek:** Müsaitlik durumuna göre dinamik saat yönetimi.
* **"Gelmedi" (No-Show) Oranını Düşürmek:** E-posta doğrulama ve otomatik hatırlatma sistemi.
* **Operasyonel Yükü Azaltmak:** Sekreterya işlemlerini (Hatırlatma, İptal, Onay) otonom hale getirmek.

---

## 🗺️ Geliştirme Yol Haritası (Roadmap)
Proje şu anda **Faz 2** geliştirme aşamasındadır.

### 1️⃣ Backend & Veritabanı Altyapısı (Öncelikli)
- [ ] **Statü Genişletmesi:** `appointments` tablosundaki status enum yapısına `completed` (Tamamlandı) ve `no_show` (Gelmedi) değerlerinin eklenmesi.
- [ ] **İptal API'si:** Müşterinin randevuyu tek tıkla iptal edebilmesi için güvenli API endpoint (`/api/appointments/cancel`).
- [ ] **Hatırlatma API'si:** Cron tetikleyicisi için saat farklarını (UTC/Local) gözeterek filtreleme yapan sorgu servisi (`/api/cron/reminders`).

### 2️⃣ Müşteri Deneyimi & Otomasyon
- [ ] **İptal Sayfası:** Müşteriye giden maillerdeki "İptal Et" butonunun yönleneceği arayüz (`/randevu-iptal/[id]`).
- [ ] **Otomatik Hatırlatma (n8n):**
    - Randevudan 24 saat önce hatırlatma maili.
    - Randevudan 2 saat önce son hatırlatma maili.

### 3️⃣ Admin UI - Gelişmiş Takvim (Timeline View)
- [ ] **Haftalık Görünüm:**
    - Pazartesi'den Pazar'a 7 sütunlu yapı.
    - **Dinamik Yükseklik:** Hizmet süresine (`duration`) göre uzayan (CSS Grid/Flex) randevu blokları.
- [ ] **Aylık Görünüm:**
    - Kuş bakışı doluluk takvimi ve gün detayları için Popup (Modal) penceresi.
- [ ] **Statü Yönetimi:**
    - ✅ **Tamamlandı:** Ciroya işler.
    - ❌ **Gelmedi (No-Show):** Müşteri siciline işler.
    - 🚫 **İptal:** Randevuyu sistemden düşer.

---

## ✨ Mevcut Özellikler

### 👤 Müşteri Arayüzü (Public)
* **Adım Adım Randevu Sihirbazı:** Hizmet > Uzman > Tarih/Saat > Kişisel Bilgiler akışı.
* **Akıllı Müsaitlik Kontrolü:** Hizmet süresine ve uzmanın çalışma saatlerine göre gerçek zamanlı slot kontrolü.
* **Güvenli Doğrulama:** Randevular `Pending` statüsünde oluşur; 15 dakika içinde onaylanmayan slotlar otomatik boşa çıkarılır.

### ⚙️ Yönetim Paneli (Admin)
* **Dashboard:** Günlük randevu özetleri ve hızlı istatistikler.
* **Personel Yönetimi:** Uzman tanımlama, çalışma saatleri ve hizmet eşleştirme.
* **Hizmet Kataloğu:** Süre, fiyat ve açıklama yönetimi.
* **Müşteri Listesi:** Detaylı geçmiş randevu kayıtları ve müşteri kartları.

### 🤖 Otomasyon (n8n & Cron)
* **Garbage Collector:** 15 dk süresi dolan onaysız randevuların otomatik temizlenmesi.
* **Bildirimler:** Webhook entegrasyonu ile yeni randevu ve onay bildirimleri.

---

## 🛠️ Teknoloji Yığını

| Alan | Teknoloji | Notlar |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 | App Router, Server Components |
| **Dil** | TypeScript | Strict Mode |
| **Veritabanı** | Supabase | PostgreSQL, Realtime |
| **Stil** | SCSS Modules | Custom Design Tokens (No Tailwind) |
| **Otomasyon** | n8n | Webhook & Cron Workflows |
| **Deploy** | Vercel | CI/CD |

---

## 📄 Lisans
Bu proje **MIT** lisansı ile lisanslanmıştır.
