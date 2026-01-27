import React from 'react';
import { TranslationData } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';

interface Props {
  translationData: TranslationData | null;
  selectedLanguage: string; // 'all' or language code
  onSelectLanguage: (lang: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '200px',
    backgroundColor: '#fff',
    borderRight: '1px solid #d2d2d7',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #e8e8ed'
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '11px',
    color: '#86868b'
  },
  list: {
    flex: 1,
    overflow: 'auto',
    padding: '8px'
  },
  item: {
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.15s',
    backgroundColor: '#f5f5f7'
  },
  itemActive: {
    backgroundColor: '#0071e3',
    color: '#fff'
  },
  itemAll: {
    backgroundColor: '#f0f7ff',
    borderBottom: '1px solid #e8e8ed',
    marginBottom: '8px'
  },
  itemAllActive: {
    backgroundColor: '#0071e3',
    color: '#fff'
  },
  name: {
    fontSize: '13px',
    fontWeight: 500
  },
  code: {
    fontSize: '10px',
    opacity: 0.7
  },
  editedBadge: {
    fontSize: '9px',
    opacity: 0.7,
    marginLeft: '4px'
  },
  emptyState: {
    padding: '20px 16px',
    textAlign: 'center',
    color: '#86868b',
    fontSize: '12px',
    lineHeight: '1.5'
  }
};

const getLanguageName = (code: string): string => {
  const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

export const LanguageSidebar: React.FC<Props> = ({
  translationData,
  selectedLanguage,
  onSelectLanguage
}) => {
  if (!translationData) {
    return (
      <div style={styles.container as React.CSSProperties}>
        <div style={styles.header}>
          <div style={styles.title}>Languages</div>
        </div>
        <div style={styles.emptyState as React.CSSProperties}>
          Click "Translate" in the Export section to generate translations
        </div>
      </div>
    );
  }

  const languages = Object.keys(translationData.headlines);

  return (
    <div style={styles.container as React.CSSProperties}>
      <div style={styles.header}>
        <div style={styles.title}>Languages</div>
        <div style={styles.subtitle}>{languages.length} translations</div>
      </div>
      <div style={styles.list as React.CSSProperties}>
        {/* "All" option */}
        <div
          style={{
            ...styles.item,
            ...(selectedLanguage === 'all' ? styles.itemAllActive : styles.itemAll)
          }}
          onClick={() => onSelectLanguage('all')}
        >
          <div>
            <div style={styles.name}>All Languages</div>
            <div style={styles.code}>Global settings</div>
          </div>
        </div>

        {/* Language list */}
        {languages.map(lang => {
          const hasEdits = !!translationData.perLanguageStyles?.[lang];
          return (
            <div
              key={lang}
              style={{
                ...styles.item,
                ...(lang === selectedLanguage ? styles.itemActive : {})
              }}
              onClick={() => onSelectLanguage(lang)}
            >
              <div>
                <div style={styles.name}>{getLanguageName(lang)}</div>
                <div style={styles.code}>{lang}</div>
              </div>
              {hasEdits && (
                <span style={styles.editedBadge}>edited</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
