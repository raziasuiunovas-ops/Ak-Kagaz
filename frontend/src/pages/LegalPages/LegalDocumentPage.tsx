import { useEffect } from 'react';
import { BookOpenCheck, Scale } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Container } from '@/components/Container';
import { BackButton } from '@/components/BackButton';
import styles from './LegalDocumentPage.module.css';

type LegalDocument = 'terms' | 'privacy';

const sectionCounts: Record<LegalDocument, number> = { terms: 14, privacy: 12 };
const paragraphCounts: Record<LegalDocument, number[]> = {
  terms: [2, 2, 2, 1, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1],
  privacy: [2, 3, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1],
};

interface LegalDocumentPageProps {
  document: LegalDocument;
}

export function LegalDocumentPage({ document }: LegalDocumentPageProps) {
  const { t } = useLocale();
  const title = t(`legal.${document}.title`);
  const description = t(`legal.${document}.summary`);

  useEffect(() => {
    const previousTitle = window.document.title;
    let descriptionMeta = window.document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const createdMeta = !descriptionMeta;

    if (!descriptionMeta) {
      descriptionMeta = window.document.createElement('meta');
      descriptionMeta.name = 'description';
      window.document.head.appendChild(descriptionMeta);
    }

    const previousDescription = descriptionMeta.content;
    window.document.title = `${title} | AK KAGAZ`;
    descriptionMeta.content = description;

    return () => {
      window.document.title = previousTitle;
      if (createdMeta) descriptionMeta?.remove();
      else if (descriptionMeta) descriptionMeta.content = previousDescription;
    };
  }, [description, title]);

  const sectionIds = Array.from({ length: sectionCounts[document] }, (_, index) => index + 1);

  const renderContents = () => (
    <nav aria-label={t('legal.contents')} className={styles.contentsNav}>
      <p className={styles.contentsTitle}>{t('legal.contents')}</p>
      <ol>
        {sectionIds.map((number) => (
          <li key={number}>
            <a href={`#${document}-${number}`}>
              <span>{String(number).padStart(2, '0')}</span>
              {t(`legal.${document}.s${number}.title`)}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.inner}>
          <BackButton fallback="/" label={t('legal.back')} />

          <header className={styles.hero}>
            <div className={styles.heroMark} aria-hidden="true">
              {document === 'terms' ? <Scale size={24} /> : <BookOpenCheck size={24} />}
            </div>
            <div>
              <p className={styles.eyebrow}>AK KAGAZ · {t('legal.updated')}</p>
              <h1>{title}</h1>
              <p className={styles.summary}>{description}</p>
            </div>
          </header>

          <aside className={styles.ownerNotice} aria-label={t('legal.ownerNoticeTitle')}>
            <strong>{t('legal.ownerNoticeTitle')}</strong>
            <p>{t('legal.ownerNotice')}</p>
            <p className={styles.reviewNote}>{t('legal.reviewNote')}</p>
          </aside>

          <details className={styles.mobileContents}>
            <summary>{t('legal.contents')}</summary>
            {renderContents()}
          </details>

          <div className={styles.documentLayout}>
            <aside className={styles.desktopContents}>{renderContents()}</aside>
            <article className={styles.article}>
              {sectionIds.map((number) => (
                <section
                  className={styles.section}
                  id={`${document}-${number}`}
                  key={number}
                  aria-labelledby={`${document}-heading-${number}`}
                >
                  <div className={styles.sectionNumber}>{String(number).padStart(2, '0')}</div>
                  <div className={styles.sectionBody}>
                    <h2 id={`${document}-heading-${number}`}>
                      {t(`legal.${document}.s${number}.title`)}
                    </h2>
                    {Array.from({ length: paragraphCounts[document][number - 1] ?? 0 }, (_, index) => (
                      <p key={index}>{t(`legal.${document}.s${number}.p${index + 1}`)}</p>
                    ))}
                  </div>
                </section>
              ))}
              <section className={styles.references} aria-labelledby="legal-references-heading">
                <h2 id="legal-references-heading">{t('legal.references')}</h2>
                <ul>
                  <li>
                    <a href="https://cbd.minjust.gov.kg/3-48/edition/35412/ru" target="_blank" rel="noreferrer">
                      {t('legal.reference.digital')}
                    </a>
                  </li>
                  <li>
                    <a href="https://cbd.minjust.gov.kg/4-556/edition/1262700/ru" target="_blank" rel="noreferrer">
                      {t('legal.reference.consumer')}
                    </a>
                  </li>
                  <li>
                    <a href="https://cbd.minjust.gov.kg/112333/edition/1263145/ru" target="_blank" rel="noreferrer">
                      {t('legal.reference.ecommerce')}
                    </a>
                  </li>
                </ul>
              </section>
            </article>
          </div>
        </div>
      </Container>
    </div>
  );
}
