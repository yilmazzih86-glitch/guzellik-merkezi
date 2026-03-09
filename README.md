🚀 Proje Durumu ve Yol Haritası
✅ TAMAMLANANLAR (Faz 1 & 2)
1. Altyapı ve Veritabanı
[x] Next.js 14 (App Router) & TypeScript kurulumu.
[x] Supabase veritabanı şeması (Randevular, Müşteriler, Personel, Hizmetler).
[x] İlişkisel veri yapısı (Randevu -> Müşteri & Personel & Hizmet).
2. Müşteri Arayüzü (Frontend)
[x] Randevu Sihirbazı: Adım adım randevu oluşturma (Hizmet -> Personel -> Saat -> Onay).
[x] Çakışma Kontrolü: Dolu saatlerin seçilmesi engellendi.
[x] İptal Sayfası: Müşterilerin randevularını yönetebileceği /randevu-iptal/[id] sayfası.
3. Otomasyon Sistemi (Backend & n8n)
[x] Temizlikçi (Auto-Cleanup): 15 dakika içinde tamamlanmayan "çöp" randevuları siler.
4. Yönetim Paneli (Admin UI - Temel)
[x] Kart Görünümü: Randevuların listelenmesi.
[x] Hızlı Aksiyonlar:
✅ Tamamlandı: Randevuyu başarılı kapatır.
❌ Gelmedi (No-Show): Müşteri siciline işler.
🚫 İptal: Randevuyu iptal eder.
[x] Güvenlik Kilidi: Geçmiş randevularda butonlar pasife alınır.

⏳ YAPILACAKLAR (Faz 3: Gelişmiş Özellikler)
1. ⭐ Otomasyonlar.
Hatırlatıcı (Reminders) Otomasyonu:
24 Saat Kala: İlk hatırlatma maili.
2 Saat Kala: Son hatırlatma maili.
Akıllı Kontrol: Mükerrer gönderimi engeller.
[x] Güvenlik: API endpointleri Bearer Token ile korunmaktadır.
Değerlendirme Otomasyonu (Review)
[ ] Seans Bitimi Tetikleyicisi: Randevu bitiş saatinden 30 dakika sonra çalışacak.
[ ] Google Maps Entegrasyonu: Müşteriye "Hizmetten memnun kaldınız mı? Bizi değerlendirin" maili ve harita linki gönderilecek.

2.  📅 Gelişmiş Takvim Görünümü (Timeline View)
Yönetim panelinin kalbi olacak bu özellik için çalışmalar başlıyor:
[ ] Haftalık Görünüm: Pazartesi'den Pazar'a 7 sütunlu ızgara yapısı.
[ ] Dinamik Yükseklik (CSS Grid): 30 dk'lık randevu kısa, 90 dk'lık randevu uzun kutu olarak görünecek.
[ ] Aylık Görünüm: Kuş bakışı doluluk takvimi.
[ ] Detay Popup: Takvimdeki kutuya tıklayınca detay modalı açılması.

3. 📱 Mobil Uyumluluk
[ ] Responsive Admin: Tabloların ve Takvim görünümünün mobilde (telefonda) bozulmadan, yatay kaydırma veya kart görünümüne dönüşerek çalışması.
