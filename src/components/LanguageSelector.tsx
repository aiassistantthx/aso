import React from 'react';
import { APP_STORE_LANGUAGES } from '../constants/languages';

interface Props {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  sourceLanguage: string;
  onSourceLanguageChange: (language: string) => void;
}

const cssStyles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px'
  },
  sourceSection: {
    marginBottom: '16px'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  hint: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '4px'
  },
  controls: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  },
  controlButton: {
    padding: '6px 12px',
    fontSize: '12px',
    border: '1px solid #d2d2d7',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  languageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '4px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    backgroundColor: '#fff'
  },
  languageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  languageLabel: {
    fontSize: '13px',
    color: '#1d1d1f',
    cursor: 'pointer'
  },
  languageCode: {
    fontSize: '11px',
    color: '#86868b',
    marginLeft: 'auto'
  },
  selectedCount: {
    fontSize: '12px',
    color: '#FF6B4A',
    marginLeft: 'auto'
  }
};

export const LanguageSelector: React.FC<Props> = ({
  selectedLanguages,
  onLanguagesChange,
  sourceLanguage,
  onSourceLanguageChange
}) => {
  const handleToggle = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onLanguagesChange(selectedLanguages.filter(l => l !== code));
    } else {
      onLanguagesChange([...selectedLanguages, code]);
    }
  };

  const handleSelectAll = () => {
    onLanguagesChange(APP_STORE_LANGUAGES.map(l => l.code));
  };

  const handleDeselectAll = () => {
    // Keep at least the source language
    onLanguagesChange([sourceLanguage]);
  };

  const handleSelectPopular = () => {
    const popularLangs = [
      'en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT',
      'pt-BR', 'ja-JP', 'ko-KR', 'zh-Hans', 'ru-RU'
    ];
    onLanguagesChange(popularLangs);
  };

  return (
    <div style={cssStyles.container}>
      {/* Source Language */}
      <div style={cssStyles.sourceSection}>
        <label style={cssStyles.label}>Source Language</label>
        <select
          value={sourceLanguage}
          onChange={(e) => {
            const newSource = e.target.value;
            onSourceLanguageChange(newSource);
            if (!selectedLanguages.includes(newSource)) {
              onLanguagesChange([...selectedLanguages, newSource]);
            }
          }}
          style={cssStyles.select}
        >
          {APP_STORE_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.nativeName})
            </option>
          ))}
        </select>
        <p style={cssStyles.hint}>
          The language of your headline texts
        </p>
      </div>

      {/* Target Languages */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ ...cssStyles.label, marginBottom: 0 }}>Target Languages</label>
          <span style={cssStyles.selectedCount}>
            {selectedLanguages.length} selected
          </span>
        </div>

        <div style={cssStyles.controls}>
          <button
            style={cssStyles.controlButton}
            onClick={handleSelectAll}
          >
            Select All
          </button>
          <button
            style={cssStyles.controlButton}
            onClick={handleDeselectAll}
          >
            Deselect All
          </button>
          <button
            style={cssStyles.controlButton}
            onClick={handleSelectPopular}
          >
            Top 10 Languages
          </button>
        </div>

        <div style={cssStyles.languageGrid}>
          {APP_STORE_LANGUAGES.map((lang) => (
            <label
              key={lang.code}
              style={{
                ...cssStyles.languageItem,
                backgroundColor: selectedLanguages.includes(lang.code)
                  ? '#f0f7ff'
                  : 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang.code)}
                onChange={() => handleToggle(lang.code)}
                style={cssStyles.checkbox}
              />
              <span style={cssStyles.languageLabel}>{lang.name}</span>
              <span style={cssStyles.languageCode}>{lang.code}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
