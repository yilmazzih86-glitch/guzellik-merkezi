🚀 Luxe Güzellik Merkezi CRM - Teknik Yönetim ve Takip Belgesi
Bu belge, projenin mevcut durumunu, tamamlanan modülleri ve "Yapacaklarımız" listesinde belirtilen yeni nesil otomasyon hedeflerini içerir.

🛠 Teknik Mimari (Güncel)
Framework: Next.js 14+ (App Router)

Veritabanı & Auth: Supabase (PostgreSQL)

Stil Yönetimi: CSS Modules (*.module.css) + Global Tokens. Tailwind KESİNLİKLE YOK.

İş Mantığı: SQL RPC Fonksiyonları & n8n Otomasyonu

E-Posta Servisi: Resend (n8n üzerinden kurumsal e-posta ile)

✅ Tamamlanan Özellikler (Mevcut Durum)
1. Altyapı ve Veritabanı
Fiyat Koruma: Randevu anındaki fiyatı sabitleyen price_at_booking yapısı kuruldu.

Personel Yönetimi: Uzman ekleme, düzenleme ve haftalık vardiya (availability) tanımlama modülleri tamamlandı.

Müsaitlik Motoru: Çakışmaları önleyen get_available_slots SQL fonksiyonu aktif.

2. Kullanıcı Arayüzü (Public & Admin)
Public Sayfalar: SEO uyumlu /hizmetler, /uzmanlar ve /online-randevu yapıları oluşturuldu.

Admin Dashboard: Temel istatistiklerin ve randevu listesinin görüntülendiği panel hazırlandı.

🚧 Yakın Vadeli İş Planı (Yapacaklarımız)
📌 Faz 1.2: Admin Panel Revizyonu
[ ] Bugünün Akışı: Genel bakış sayfasında sadece o günün randevuları, saat sırasına göre (09:00 -> 21:00) listelenecek.

[ ] Randevu Ajandası: Tüm geçmişi içeren "Liste Görünümü" ve CSS Grid ile hazırlanmış "Takvim Görünümü" seçenekleri eklenecek.

📌 Faz 1.3: Akıllı CRM ve Müşteri Kartı
[ ] CRM Altyapısı: customers tablosu genişletilerek toplam harcama, ziyaret sıklığı ve özel notlar modülü eklenecek.

[ ] Müşteri Profili: Her danışan için geçmiş randevuların ve tercihlerin izlenebileceği detay sayfası yapılacak.

📌 Faz 1.4: Gelişmiş Randevu Akışı ve n8n Entegrasyonu
[ ] Tarih Kısıtlaması: Randevu alımında geçmiş tarihler seçime kapatılacak (Step 3).

[ ] 15 Dakika Onay Penceresi:

Randevu pending olarak kaydedilecek, direkt panele düşmeyecek.

n8n üzerinden Resend ile onay maili tetiklenecek.

15 dakika içinde onaylanmayan randevular otomatik silinecek/iptal edilecek.

[ ] Otomasyon Zinciri:

24 Saat & 2 Saat: Randevu hatırlatma ve iptal linki gönderimi.

30 Dakika Sonra (Post-Service): Memnuniyet sorgusu ve Google Maps değerlendirme butonu gönderimi.

⚠️ Kritik Teknik Notlar ve Riskler
Zaman Dilimi Senkronizasyonu: Tüm randevu işlemleri Europe/Istanbul baz alınarak yapılmalıdır.

Pending Slot Kilitleme: Mail onayı bekleyen pending randevular, başkasının o saati almaması için get_available_slots fonksiyonu tarafından "dolu" kabul edilmelidir.

Mail İletişimi: randevu@firmaadi.com üzerinden gönderilecek maillerin spam'e düşmemesi için Resend DNS ayarları (SPF, DKIM) eksiksiz yapılmalıdır.
