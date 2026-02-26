import layoutStyles from '../../../styles/layout.module.css';
import { Card } from '../../../components/ui/Card/Card';
import { getAdminClient } from '../../../server/db/supabase';

// Bu sayfa sunucuda render edilir.
export const revalidate = 60; 

export default async function ServicesPage() {
  const supabase = getAdminClient();
  
  // Aktif servisleri çek
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: true });

  if (error || !services) {
    return <div className={layoutStyles.container}>Hizmetler yüklenirken bir hata oluştu.</div>;
  }

  return (
    <div className={layoutStyles.container} style={{ padding: 'var(--space-48) var(--space-16)' }}>
      <h1 style={{ marginBottom: 'var(--space-32)' }}>Hizmetlerimiz</h1>
      
      <div className={layoutStyles.grid}>
        {services.map((service: any) => (
          <Card key={service.id}>
            <h3 style={{ marginBottom: 'var(--space-8)' }}>{service.name}</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-16)' }}>
              Süre: {service.duration_min} Dakika
            </p>
            <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {service.price_min && service.price_max 
                ? `${service.price_min} ₺ - ${service.price_max} ₺` 
                : service.price_min ? `${service.price_min} ₺` : 'Fiyat bilgisi için ulaşın'}
            </div>
          </Card>
        ))}
        {services.length === 0 && <p>Henüz bir hizmet eklenmemiş.</p>}
      </div>
    </div>
  );
}