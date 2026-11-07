import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import type { Campaign } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import styles from './CampaignBanner.module.css';

interface CampaignBannerProps {
  campaign: Campaign;
  size?: 'small' | 'medium' | 'large';
}

export function CampaignBanner({ campaign, size = 'medium' }: CampaignBannerProps) {
  const { locale } = useLocale();

  const translation =
    campaign.translations.find((tr) => tr.locale === locale) ||
    campaign.translations[0];

  const endDate = new Date(campaign.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }[size];

  return (
    <Link to={`/campaigns/${campaign.slug}`} className={`${styles.banner} ${sizeClass}`}>
      {campaign.bannerUrl ? (
        <img
          src={campaign.bannerUrl}
          alt={translation?.name || 'Campaign'}
          className={styles.image}
        />
      ) : (
        <div className={styles.imagePlaceholder} />
      )}

      <div className={styles.overlay}>
        <div className={styles.content}>
          <h3 className={styles.title}>{translation?.name}</h3>
          {translation?.description && (
            <p className={styles.description}>{translation.description}</p>
          )}

          {daysLeft > 0 && daysLeft <= 7 && (
            <div className={styles.urgency}>
              <Calendar className={styles.urgencyIcon} />
              <span>
                {locale === 'ru'
                  ? `Осталось ${daysLeft} дней`
                  : `${daysLeft} күн калды`}
              </span>
            </div>
          )}

          <div className={styles.cta}>
            <span>
              {locale === 'ru' ? 'Смотреть товары' : 'Товарларды көрүү'}
            </span>
            <ArrowRight className={styles.ctaIcon} />
          </div>
        </div>
      </div>
    </Link>
  );
}
