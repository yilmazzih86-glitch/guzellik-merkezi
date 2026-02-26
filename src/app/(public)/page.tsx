import Link from 'next/link';
import layoutStyles from '../../styles/layout.module.css';
import styles from './Home.module.css';
import { Button } from '../../components/ui/Button/Button';

export default function HomePage() {
  return (
    <div className={styles.hero}>
      <div className={`${layoutStyles.container} ${layoutStyles.stackLg}`}>
        <div>
          <h1 className={styles.title}>Güzelliğinize Profesyonel Dokunuş</h1>
          <p className={styles.subtitle}>
            Luxe Beauty Center'da uzman kadromuzla yenilenin. Kendinize zaman ayırın ve 
            size özel hazırladığımız premium hizmetlerin tadını çıkarın.
          </p>
          <Link href="/book">
            <Button size="lg" variant="primary">Hemen Randevu Alın</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}