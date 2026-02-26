import layoutStyles from '../../../styles/layout.module.css';
import { getAdminClient } from '../../../server/db/supabase';
import { BookingWizard } from '../../../components/public/BookingWizard';

export default async function BookPage() {
  const supabase = getAdminClient();
  
  // Müşterinin seçebileceği verileri paralel olarak çek
  const [servicesRes, staffRes] = await Promise.all([
    supabase.from('services').select('*').eq('active', true),
    supabase.from('staff').select('*').eq('active', true)
  ]);

  const services = servicesRes.data || [];
  const staff = staffRes.data || [];

  return (
    <div className={layoutStyles.container} style={{ padding: 'var(--space-48) var(--space-16)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-32)' }}>Randevu Al</h1>
      <BookingWizard initialServices={services} initialStaff={staff} />
    </div>
  );
}