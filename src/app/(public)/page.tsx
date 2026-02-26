import Link from 'next/link';
import styles from './Home.module.css';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';

export default function HomePage() {
  return (
    <main className={styles.main}>
      
      {/* 1. HERO BÖLÜMÜ (Büyük Görsel ve Çarpıcı Mesaj) */}
      <section className={styles.hero}>
        {/* Yüksek kaliteli bir Spa / Cilt Bakım görseli (Gerçekçi Vitrin) */}
        <img 
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=80" 
          alt="Premium Güzellik Merkezi" 
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={`${styles.heroContent} animate-fade-up`}>
          <div className={styles.badge}>Klinik Düzeyde Bakım</div>
          <h1 className={styles.title}>
            Kendinizi <span>Uzman Ellere</span> Bırakın
          </h1>
          <p className={styles.subtitle}>
            FDA onaylı son teknoloji cihazlar ve kişiye özel hazırlanan 
            protokollerle, cildinizin ve bedeninizin hak ettiği premium değeri keşfedin.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/book">
              <Button size="lg" variant="primary">Ücretsiz Konsültasyon & Randevu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. GÜVEN ÇUBUĞU (Trust Indicators - Sosyal Kanıt) */}
      <div className={styles.trustBar}>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className={styles.trustText}>
              <h4>Güvenilir Uzmanlar</h4>
              <p>Sertifikalı Estetisyen Kadrosu</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <div className={styles.trustText}>
              <h4>Premium Ürünler</h4>
              <p>Orijinal ve Medikal Kozmetik</p>
            </div>
          </div>
          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" />
            </svg>
            <div className={styles.trustText}>
              <h4>%100 Memnuniyet</h4>
              <p>Binlerce Mutlu Danışan</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GÖRSELLİ HİZMETLER BÖLÜMÜ (Vitrin) */}
      <section className={styles.section}>
        <div className={styles.container}>
           <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>İhtiyacınıza Özel Çözümler</h2>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-primary)', margin: 'var(--space-8) 0' }}></div>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: 0 }}>
              Sadece estetik değil, cilt ve vücut sağlığınızı da destekleyen, sonuç odaklı uygulamalarımızı inceleyin.
            </p>
          </div>
          
          <div className={styles.servicesGrid}>
             {/* Hizmet 1: Cilt Bakımı */}
             <Card interactive className={`animate-fade-up ${styles.serviceCard}`}>
                <div className={styles.serviceImageWrapper}>
                  <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80" alt="Medikal Cilt Bakımı" className={styles.serviceImage} />
                </div>
                <div className={styles.serviceContent}>
                  <h3 className={styles.serviceTitle}>Medikal Cilt Bakımı</h3>
                  <p className={styles.serviceDesc}>Hydrafacial ve dermapen sistemleri ile cildinizin alt katmanlarına inerek leke, akne ve yaşlanma belirtileriyle savaşır.</p>
                  <div className={styles.serviceFooter}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Süre: 60 Dk</span>
                    <Link href="/book" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Randevu Al →</Link>
                  </div>
                </div>
             </Card>

             {/* Hizmet 2: Lazer */}
             <Card interactive className={`animate-fade-up ${styles.serviceCard}`} style={{ animationDelay: '0.1s' }}>
                <div className={styles.serviceImageWrapper}>
                  <img src="https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80" alt="Buz Lazer Epilasyon" className={styles.serviceImage} />
                </div>
                <div className={styles.serviceContent}>
                  <h3 className={styles.serviceTitle}>Buz Lazer Epilasyon</h3>
                  <p className={styles.serviceDesc}>Yeni nesil soğuk başlık teknolojisi ile dört mevsim uygulanabilen, ağrısız ve kalıcı pürüzsüzlük garantisi.</p>
                  <div className={styles.serviceFooter}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Tüm Vücut / Bölgesel</span>
                    <Link href="/book" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Randevu Al →</Link>
                  </div>
                </div>
             </Card>

             {/* Hizmet 3: Vücut / Zayıflama */}
             <Card interactive className={`animate-fade-up ${styles.serviceCard}`} style={{ animationDelay: '0.2s' }}>
                <div className={styles.serviceImageWrapper}>
                  <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80" alt="Bölgesel Zayıflama" className={styles.serviceImage} />
                </div>
                <div className={styles.serviceContent}>
                  <h3 className={styles.serviceTitle}>Bölgesel İnceltme</h3>
                  <p className={styles.serviceDesc}>G5 Masajı ve Radyofrekans sistemleriyle selülit görünümünü azaltın, hedeflenen bölgelerde hızla sıkılaşın.</p>
                  <div className={styles.serviceFooter}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Süre: 45 Dk</span>
                    <Link href="/book" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Randevu Al →</Link>
                  </div>
                </div>
             </Card>
          </div>
        </div>
      </section>

      {/* 4. SOSYAL KANIT (Müşteri Yorumları) */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Danışanlarımız Ne Diyor?</h2>
        </div>
        <div className={styles.reviewGrid}>
          <div className={`${styles.reviewCard} animate-fade-up`}>
            <svg className={styles.quoteIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <div className={styles.reviewStars}>★★★★★</div>
            <p className={styles.reviewText}>"Lazer epilasyon için çok çekiniyordum ama hem hijyen hem de güler yüzleri beni çok rahatlattı. İlk seanstan itibaren dökülmeleri gördüm, kesinlikle tavsiye ediyorum."</p>
            <div className={styles.reviewAuthor}>— Aylin K.</div>
          </div>
          
          <div className={`${styles.reviewCard} animate-fade-up`} style={{ animationDelay: '0.1s' }}>
             <svg className={styles.quoteIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <div className={styles.reviewStars}>★★★★★</div>
            <p className={styles.reviewText}>"Randevu sistemi o kadar pratik ki, kimseyle telefonda dakikalarca konuşmadan kendi saatimi seçebiliyorum. Cilt bakımında kullandıkları ürünler gerçekten çok kaliteli."</p>
            <div className={styles.reviewAuthor}>— Merve Y.</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-48)' }}>
          <Link href="/book">
            <Button size="lg">Siz de Randevunuzu Oluşturun</Button>
          </Link>
        </div>
      </section>

    </main>
  );
}