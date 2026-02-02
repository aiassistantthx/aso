import React, { useState, useEffect, useCallback } from 'react';
import {
  metadataProjects as api,
  MetadataProjectListItem,
  MetadataProjectFull,
  ApiError,
} from '../services/api';
import { getFieldsForPlatform, getCharColor, FieldDef } from '../constants/metadataLimits';
import { useAuth } from '../services/authContext';
import { AppHeader } from './AppHeader';

interface Props {
  projectId?: string;
  onBack: () => void;
  onOpenProject: (id: string) => void;
  onNavigate: (page: string, id?: string) => void;
}

type Step = 'input' | 'review' | 'translations';

const LANGUAGES = [
  { code: 'de-DE', label: 'German' },
  { code: 'fr-FR', label: 'French' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'it-IT', label: 'Italian' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh-Hans', label: 'Chinese (Simplified)' },
  { code: 'zh-Hant', label: 'Chinese (Traditional)' },
  { code: 'ru-RU', label: 'Russian' },
  { code: 'ar-SA', label: 'Arabic' },
  { code: 'nl-NL', label: 'Dutch' },
  { code: 'sv-SE', label: 'Swedish' },
  { code: 'tr-TR', label: 'Turkish' },
  { code: 'pl-PL', label: 'Polish' },
  { code: 'th-TH', label: 'Thai' },
  { code: 'vi-VN', label: 'Vietnamese' },
  { code: 'id-ID', label: 'Indonesian' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'uk-UA', label: 'Ukrainian' },
];

export const MetadataPage: React.FC<Props> = ({ projectId, onBack, onOpenProject, onNavigate }) => {
  const { user } = useAuth();
  const plan = user?.plan ?? 'FREE';

  // List view state
  const [projectList, setProjectList] = useState<MetadataProjectListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // Editor state
  const [project, setProject] = useState<MetadataProjectFull | null>(null);
  const [step, setStep] = useState<Step>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input fields
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [inputMode, setInputMode] = useState<'description' | 'keywords'>('description');
  const [appName, setAppName] = useState('');
  const [briefDescription, setBriefDescription] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');

  // Edit fields
  const [editedMetadata, setEditedMetadata] = useState<Record<string, string>>({});

  // Translation state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [activeTranslationTab, setActiveTranslationTab] = useState<string>('');
  const [translating, setTranslating] = useState(false);

  // Load project list
  const loadList = useCallback(async () => {
    try {
      const list = await api.list();
      setProjectList(list);
    } catch {
      console.error('Failed to load metadata projects');
    } finally {
      setListLoading(false);
    }
  }, []);

  // Load single project
  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const p = await api.get(id);
      setProject(p);
      setPlatform(p.platform as 'ios' | 'android');
      setInputMode(p.inputMode as 'description' | 'keywords');
      setAppName(p.appName);
      setBriefDescription(p.briefDescription);
      setTargetKeywords(p.targetKeywords);
      if (p.editedMetadata) {
        setEditedMetadata(p.editedMetadata);
        setStep('review');
      }
      if (p.translations) {
        setTranslations(p.translations);
      }
      if (p.targetLanguages?.length) {
        setSelectedLanguages(p.targetLanguages);
        setActiveTranslationTab(p.targetLanguages[0]);
      }
    } catch {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    } else {
      loadList();
    }
  }, [projectId, loadProject, loadList]);

  const handleCreate = async () => {
    const name = window.prompt('Metadata project name', `ASO ${new Date().toLocaleDateString()}`);
    if (!name?.trim()) return;

    try {
      const p = await api.create(name.trim(), 'ios');
      onOpenProject(p.id);
    } catch (err) {
      if (err instanceof ApiError && err.limit === 'metadataProjects') {
        setError(err.message);
      } else {
        setError('Failed to create project');
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this metadata project?')) return;
    try {
      await api.delete(id);
      setProjectList((prev) => prev.filter((p) => p.id !== id));
    } catch {
      console.error('Failed to delete');
    }
  };

  const handleSaveInput = async () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      await api.update(project.id, {
        platform,
        inputMode,
        appName,
        briefDescription,
        targetKeywords,
      });
      setProject({ ...project, platform, inputMode, appName, briefDescription, targetKeywords });
    } catch {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!project) return;
    await handleSaveInput();
    setLoading(true);
    setError(null);
    try {
      const updated = await api.generate(project.id);
      setProject(updated);
      if (updated.editedMetadata) {
        setEditedMetadata(updated.editedMetadata);
      }
      setStep('review');
    } catch {
      setError('Failed to generate metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveEdited = async () => {
    if (!project) return;
    try {
      await api.update(project.id, { editedMetadata });
    } catch {
      setError('Failed to save');
    }
  };

  const handleTranslate = async () => {
    if (!project || selectedLanguages.length === 0) return;
    setTranslating(true);
    setError(null);
    await handleSaveEdited();
    try {
      const updated = await api.translate(project.id, selectedLanguages);
      setProject(updated);
      if (updated.translations) {
        setTranslations(updated.translations);
      }
      if (!activeTranslationTab && selectedLanguages.length > 0) {
        setActiveTranslationTab(selectedLanguages[0]);
      }
      setStep('translations');
    } catch (err) {
      if (err instanceof ApiError && err.limit === 'targetLanguages') {
        setError(err.message);
      } else {
        setError('Failed to translate');
      }
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslationFieldChange = (lang: string, key: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value },
    }));
  };

  const handleCopyAll = () => {
    const data: Record<string, Record<string, string>> = {
      [project?.sourceLanguage || 'en-US']: editedMetadata,
      ...translations,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const handleExportJSON = () => {
    const data: Record<string, Record<string, string>> = {
      [project?.sourceLanguage || 'en-US']: editedMetadata,
      ...translations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'metadata'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const fields = getFieldsForPlatform(platform);

  // --- LIST VIEW ---
  if (!projectId) {
    return (
      <div style={s.container}>
        <AppHeader currentPage="metadata" onNavigate={onNavigate} />
        <div style={s.content}>
          <h1 style={s.pageTitle}>Metadata Projects</h1>
          <p style={s.pageSubtitle}>Generate and localize App Store & Google Play metadata with AI</p>

          {error && <div style={s.errorBanner}>{error}</div>}

          <div style={s.toolbar}>
            <span style={{ fontSize: '14px', color: '#86868b' }}>
              {projectList.length} project{projectList.length !== 1 ? 's' : ''}
              {plan === 'FREE' && ' / 1 max'}
            </span>
            <button style={s.primaryBtn} onClick={handleCreate}>+ New Metadata Project</button>
          </div>

          {listLoading ? (
            <p style={{ textAlign: 'center', color: '#86868b', padding: '40px' }}>Loading...</p>
          ) : projectList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: '48px', color: '#d1d1d6', marginBottom: '16px' }}>Aa</div>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>No metadata projects yet</h2>
              <p style={{ fontSize: '15px', color: '#86868b', marginBottom: '24px' }}>Create a project to generate optimized app metadata</p>
              <button style={s.primaryBtn} onClick={handleCreate}>+ Create First Project</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {projectList.map((p) => (
                <div
                  key={p.id}
                  style={s.card}
                  onClick={() => onOpenProject(p.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>{p.name}</h3>
                        <span style={{
                          fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
                          padding: '2px 8px', borderRadius: '4px',
                          backgroundColor: p.platform === 'ios' ? '#f0f7ff' : '#e8f9ed',
                          color: p.platform === 'ios' ? '#0071e3' : '#248a3d',
                        }}>
                          {p.platform === 'ios' ? 'iOS' : 'Android'}
                        </span>
                      </div>
                      <button
                        style={{ ...s.dangerBtn, fontSize: '12px', padding: '4px 10px' }}
                        onClick={(e) => handleDelete(p.id, e)}
                      >
                        Delete
                      </button>
                    </div>
                    {p.appName && <p style={{ fontSize: '13px', color: '#86868b', marginTop: '8px' }}>{p.appName}</p>}
                    <p style={{ fontSize: '12px', color: '#aeaeb2', marginTop: '6px' }}>
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW ---
  if (loading && !project) {
    return (
      <div style={s.container}>
        <div style={{ textAlign: 'center', padding: '80px', color: '#86868b' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <AppHeader
        currentPage="metadata"
        onNavigate={onNavigate}
        rightContent={
          <>
            <button style={s.backBtn} onClick={onBack}>&larr;</button>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>{project?.name || 'Metadata Editor'}</span>
            {step === 'review' && (
              <>
                <button style={s.secondaryBtn} onClick={() => setStep('input')}>Back to Input</button>
                <button style={s.secondaryBtn} onClick={handleSaveEdited}>Save</button>
              </>
            )}
            {step === 'translations' && (
              <>
                <button style={s.secondaryBtn} onClick={() => setStep('review')}>Back to Review</button>
                <button style={s.secondaryBtn} onClick={handleCopyAll}>Copy All</button>
                <button style={s.primaryBtn} onClick={handleExportJSON}>Export JSON</button>
              </>
            )}
          </>
        }
      />

      <div style={s.content}>
        {error && <div style={s.errorBanner}>{error}<button style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontWeight: 600 }} onClick={() => setError(null)}>x</button></div>}

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {(['input', 'review', 'translations'] as Step[]).map((s2, i) => (
            <div key={s2} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {i > 0 && <div style={{ width: '24px', height: '2px', backgroundColor: step === s2 || (i === 1 && step === 'translations') ? '#0071e3' : '#d1d1d6' }} />}
              <div style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                backgroundColor: step === s2 ? '#0071e3' : '#f5f5f7',
                color: step === s2 ? '#fff' : '#86868b',
                cursor: 'pointer',
              }}
                onClick={() => {
                  if (s2 === 'input') setStep('input');
                  if (s2 === 'review' && Object.keys(editedMetadata).length > 0) setStep('review');
                  if (s2 === 'translations' && Object.keys(translations).length > 0) setStep('translations');
                }}
              >
                {i + 1}. {s2 === 'input' ? 'Input' : s2 === 'review' ? 'Review' : 'Translate'}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div style={{ maxWidth: '640px' }}>
            <h2 style={s.sectionTitle}>App Information</h2>

            {/* Platform toggle */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Platform</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['ios', 'android'] as const).map((p) => (
                  <button
                    key={p}
                    style={{
                      ...s.toggleBtn,
                      backgroundColor: platform === p ? '#0071e3' : '#f5f5f7',
                      color: platform === p ? '#fff' : '#1d1d1f',
                    }}
                    onClick={() => setPlatform(p)}
                  >
                    {p === 'ios' ? 'iOS (App Store)' : 'Android (Google Play)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Input mode toggle */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Generation Mode</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    ...s.toggleBtn,
                    backgroundColor: inputMode === 'description' ? '#0071e3' : '#f5f5f7',
                    color: inputMode === 'description' ? '#fff' : '#1d1d1f',
                  }}
                  onClick={() => setInputMode('description')}
                >
                  Description Only
                </button>
                <button
                  style={{
                    ...s.toggleBtn,
                    backgroundColor: inputMode === 'keywords' ? '#0071e3' : '#f5f5f7',
                    color: inputMode === 'keywords' ? '#fff' : '#1d1d1f',
                  }}
                  onClick={() => setInputMode('keywords')}
                >
                  With Keywords
                </button>
              </div>
            </div>

            {/* App name */}
            <div style={s.fieldGroup}>
              <label style={s.label}>App Name</label>
              <input
                style={s.input}
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. PhotoEditor Pro"
                maxLength={100}
              />
            </div>

            {/* Brief description */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Brief Description of Your App</label>
              <textarea
                style={{ ...s.input, minHeight: '100px', resize: 'vertical' }}
                value={briefDescription}
                onChange={(e) => setBriefDescription(e.target.value)}
                placeholder="Describe what your app does, its key features, and target audience..."
              />
            </div>

            {/* Keywords (if mode B) */}
            {inputMode === 'keywords' && (
              <div style={s.fieldGroup}>
                <label style={s.label}>Target Keywords</label>
                <textarea
                  style={{ ...s.input, minHeight: '60px', resize: 'vertical' }}
                  value={targetKeywords}
                  onChange={(e) => setTargetKeywords(e.target.value)}
                  placeholder="photo editor, filters, collage, image editing..."
                />
                <p style={{ fontSize: '12px', color: '#86868b', marginTop: '4px' }}>
                  Comma-separated keywords you want to rank for
                </p>
              </div>
            )}

            <button
              style={{ ...s.primaryBtn, width: '100%', marginTop: '16px' }}
              onClick={handleGenerate}
              disabled={loading || !appName.trim() || !briefDescription.trim()}
            >
              {loading ? 'Generating...' : 'Generate Metadata with AI'}
            </button>
          </div>
        )}

        {/* STEP 2: REVIEW */}
        {step === 'review' && (
          <div style={{ maxWidth: '720px' }}>
            <h2 style={s.sectionTitle}>Review & Edit Metadata</h2>
            <p style={{ fontSize: '14px', color: '#86868b', marginBottom: '24px' }}>
              Review the generated metadata. Edit any field as needed — character counters update in real time.
            </p>

            {fields.map((field) => (
              <MetadataField
                key={field.key}
                field={field}
                value={editedMetadata[field.key] || ''}
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={s.secondaryBtn} onClick={handleGenerate} disabled={loading}>
                {loading ? 'Regenerating...' : 'Regenerate'}
              </button>
              <button
                style={s.primaryBtn}
                onClick={() => {
                  handleSaveEdited();
                  setStep('translations');
                }}
              >
                Continue to Translate
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSLATIONS */}
        {step === 'translations' && (
          <div>
            <h2 style={s.sectionTitle}>Translate Metadata</h2>

            {/* Language selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={s.label}>Select Target Languages {plan === 'FREE' && '(max 2 on Free plan)'}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {LANGUAGES.map((lang) => {
                  const selected = selectedLanguages.includes(lang.code);
                  const disabled = !selected && plan === 'FREE' && selectedLanguages.length >= 2;
                  return (
                    <button
                      key={lang.code}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                        border: selected ? '2px solid #0071e3' : '1px solid #d1d1d6',
                        backgroundColor: selected ? '#f0f7ff' : '#fff',
                        color: disabled ? '#d1d1d6' : selected ? '#0071e3' : '#1d1d1f',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => !disabled && toggleLanguage(lang.code)}
                      disabled={disabled}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              style={{ ...s.primaryBtn, marginBottom: '24px' }}
              onClick={handleTranslate}
              disabled={translating || selectedLanguages.length === 0}
            >
              {translating ? 'Translating...' : `Translate to ${selectedLanguages.length} language${selectedLanguages.length !== 1 ? 's' : ''}`}
            </button>

            {/* Translation tabs & fields */}
            {Object.keys(translations).length > 0 && (
              <div>
                <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e0e0e5', marginBottom: '20px' }}>
                  {selectedLanguages.filter((l) => translations[l]).map((lang) => (
                    <button
                      key={lang}
                      style={{
                        padding: '10px 18px', fontSize: '14px', fontWeight: 500,
                        border: 'none', borderBottom: activeTranslationTab === lang ? '3px solid #0071e3' : '3px solid transparent',
                        backgroundColor: 'transparent',
                        color: activeTranslationTab === lang ? '#0071e3' : '#86868b',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setActiveTranslationTab(lang)}
                    >
                      {LANGUAGES.find((l) => l.code === lang)?.label || lang}
                    </button>
                  ))}
                </div>

                {activeTranslationTab && translations[activeTranslationTab] && (
                  <div style={{ maxWidth: '720px' }}>
                    {fields.map((field) => (
                      <MetadataField
                        key={field.key}
                        field={field}
                        value={translations[activeTranslationTab]?.[field.key] || ''}
                        onChange={(v) => handleTranslationFieldChange(activeTranslationTab, field.key, v)}
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button style={s.secondaryBtn} onClick={handleCopyAll}>Copy All to Clipboard</button>
                  <button style={s.primaryBtn} onClick={handleExportJSON}>Export JSON</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- MetadataField subcomponent ---
function MetadataField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const len = value.length;
  const color = getCharColor(len, field.limit);
  const over = len > field.limit;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>{field.label}</label>
        <span style={{ fontSize: '13px', fontWeight: 600, color: over ? '#ff3b30' : color }}>
          {len}/{field.limit}
        </span>
      </div>
      {field.multiline ? (
        <textarea
          style={{
            ...s.input,
            minHeight: '120px',
            resize: 'vertical',
            borderColor: over ? '#ff3b30' : undefined,
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          style={{
            ...s.input,
            borderColor: over ? '#ff3b30' : undefined,
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// --- Styles ---
const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.4px',
  },
  backBtn: {
    padding: '6px 12px',
    fontSize: '16px',
    border: '1px solid #d1d1d6',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  pageTitle: {
    fontSize: '34px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#86868b',
    marginBottom: '32px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },
  primaryBtn: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    border: '1px solid #d1d1d6',
    borderRadius: '10px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dangerBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff3b30',
    color: '#fff',
    cursor: 'pointer',
  },
  toggleBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '16px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #d1d1d6',
    borderRadius: '10px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  },
  errorBanner: {
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#fff0f0',
    color: '#ff3b30',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};
