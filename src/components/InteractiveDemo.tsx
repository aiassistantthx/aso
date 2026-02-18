import React, { useState, useEffect, useCallback } from 'react';

const accent = '#FF6B4A';
const accentBg = '#FFF5F2';
const border = '#e5e5ea';
const textPrimary = '#1A1A1A';
const textSecondary = '#6B6B6B';
const textMuted = '#9A9A9A';
const pageBg = '#FAFAF8';

const STEPS = [
  { num: 1, label: 'App Info' },
  { num: 2, label: 'Screenshots' },
  { num: 3, label: 'Generate' },
  { num: 4, label: 'Style & Layout' },
  { num: 5, label: 'Review' },
  { num: 6, label: 'Translate' },
];

const CYCLE_MS = 4500;
const FADE_MS = 250;

// --- Shared sub-elements ---

const FakeInput: React.FC<{ label: string; value: string; counter?: string; multiline?: boolean }> = ({ label, value, counter, multiline }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>{label}</span>
      {counter && <span style={{ fontSize: 11, color: textMuted }}>{counter}</span>}
    </div>
    <div style={{
      border: `1px solid ${border}`,
      borderRadius: 10,
      padding: multiline ? '8px 12px' : '8px 12px',
      fontSize: 13,
      color: textPrimary,
      backgroundColor: '#fff',
      minHeight: multiline ? 48 : 'auto',
      lineHeight: 1.4,
    }}>
      {value}
    </div>
  </div>
);

const Pill: React.FC<{ text: string; active?: boolean }> = ({ text, active }) => (
  <span style={{
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    backgroundColor: active ? accent : '#F0F0F0',
    color: active ? '#fff' : textSecondary,
    border: active ? 'none' : `1px solid ${border}`,
    marginRight: 6,
    marginBottom: 6,
  }}>
    {text}
  </span>
);

const Btn: React.FC<{ text: string; primary?: boolean; small?: boolean }> = ({ text, primary, small }) => (
  <span style={{
    display: 'inline-block',
    padding: small ? '6px 16px' : '8px 24px',
    borderRadius: 10,
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    backgroundColor: primary ? accent : '#fff',
    color: primary ? '#fff' : textPrimary,
    border: primary ? 'none' : `1px solid ${border}`,
    cursor: 'default',
  }}>
    {text}
  </span>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <rect width="20" height="20" rx="4" fill={accent} />
    <path d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhoneMockup: React.FC<{ gradient: string; headline?: string; small?: boolean }> = ({ gradient, headline, small }) => (
  <div style={{
    width: small ? 70 : 90,
    aspectRatio: '9/19.5',
    borderRadius: small ? 8 : 10,
    background: gradient,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  }}>
    {headline && (
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '6px 4px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
        color: '#fff',
        fontSize: small ? 7 : 8,
        fontWeight: 600,
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {headline}
      </div>
    )}
  </div>
);

// --- Step renderers ---

function renderStep1() {
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>App Information</div>
      <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>Tell us about your app to generate perfect content.</div>

      {/* Platform selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['iOS', 'Android'].map(p => (
          <span key={p} style={{
            padding: '6px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: p === 'iOS' ? accent : '#fff',
            color: p === 'iOS' ? '#fff' : textSecondary,
            border: p === 'iOS' ? 'none' : `1px solid ${border}`,
          }}>
            {p === 'iOS' ? '\uF8FF iOS' : '\u{1F4F1} Android'}
          </span>
        ))}
      </div>

      <FakeInput label="App Name" value="PhotoMaster Pro" counter="15/30" />
      <FakeInput label="Short Description" value="Professional photo editing and AI enhancement tool" counter="52/170" multiline />
      <FakeInput label="Keywords" value="photo editor, AI enhance, filters, portrait, retouch" counter="51/100" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <Btn text="Next \u2192" primary />
      </div>
    </div>
  );
}

function renderStep2() {
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
  ];
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>Upload Screenshots</div>
      <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>Upload your app screenshots (3-8 recommended).</div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {gradients.map((g, i) => (
          <PhoneMockup key={i} gradient={g} />
        ))}
        {/* Add button */}
        <div style={{
          width: 90,
          aspectRatio: '9/19.5',
          borderRadius: 10,
          border: `2px dashed ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
        }}>
          <span style={{ fontSize: 24, color: textMuted }}>+</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: textMuted, marginTop: 12 }}>4 / 8 uploaded</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <Btn text="\u2190 Back" />
        <Btn text="Next \u2192" primary />
      </div>
    </div>
  );
}

function renderStep3() {
  const options = [
    { title: 'Screenshots with Headlines', desc: 'AI-generated marketing headlines on device mockups' },
    { title: 'ASO Metadata', desc: 'App name, subtitle, keywords, and description' },
  ];
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>What to Generate</div>
      <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>Choose the assets you want to create.</div>

      {options.map((o, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 14,
          border: `2px solid ${accent}`,
          backgroundColor: accentBg,
          marginBottom: 10,
          cursor: 'default',
        }}>
          <CheckIcon />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{o.title}</div>
            <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{o.desc}</div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <Btn text="\u2190 Back" />
        <Btn text="Next \u2192" primary />
      </div>
    </div>
  );
}

function renderStep4() {
  const tones = ['Bright', 'Elegant', 'Playful', 'Minimal'];
  const layouts = ['Classic', 'Out of Box', 'Side by Side', 'Panoramic', 'Duo', 'Text Focus'];
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>Visual Style & Layout</div>
      <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>Pick a tone and layout for your screenshots.</div>

      <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>Tone</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tones.map(t => (
          <span key={t} style={{
            padding: '7px 16px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: t === 'Bright' ? 600 : 400,
            backgroundColor: t === 'Bright' ? accent : '#fff',
            color: t === 'Bright' ? '#fff' : textSecondary,
            border: t === 'Bright' ? 'none' : `1px solid ${border}`,
          }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>Layout</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {layouts.map(l => (
          <div key={l} style={{
            padding: '10px 8px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: l === 'Out of Box' ? 600 : 400,
            textAlign: 'center',
            backgroundColor: l === 'Out of Box' ? accentBg : '#fff',
            color: l === 'Out of Box' ? accent : textSecondary,
            border: l === 'Out of Box' ? `2px solid ${accent}` : `1px solid ${border}`,
          }}>
            {l}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <Btn text="\u2190 Back" />
        <Btn text="Generate \u2728" primary />
      </div>
    </div>
  );
}

function renderStep5() {
  const swatches = [
    { label: 'Primary', colors: ['#FF6B4A', '#FF8A65', '#FFAB91'] },
    { label: 'Accent', colors: ['#667eea', '#764ba2', '#9c27b0'] },
  ];
  const previews = [
    { gradient: 'linear-gradient(135deg, #667eea, #764ba2)', headline: 'Edit Photos\nLike a Pro' },
    { gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', headline: 'AI-Powered\nEnhancements' },
    { gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', headline: 'Stunning\nFilters' },
    { gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', headline: 'One-Tap\nRetouch' },
  ];
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>Review & Edit</div>
      <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>Check your generated screenshots and color palette.</div>

      {/* Color swatches */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {swatches.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 11, fontWeight: 600, color: textSecondary, marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {s.colors.map(c => (
                <div key={c} style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: c }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview screenshots */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
        {previews.map((p, i) => (
          <PhoneMockup key={i} gradient={p.gradient} headline={p.headline} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <Btn text="\u2190 Back" />
        <Btn text="Next \u2192" primary />
      </div>
    </div>
  );
}

function renderStep6() {
  const languages = ['English', 'Korean', 'Japanese', 'Spanish', 'French', 'German', 'Chinese'];
  const headlines = [
    '\uD504\uB85C\uCC98\uB7FC \uC0AC\uC9C4\uC744 \uD3B8\uC9D1\uD558\uC138\uC694',
    'AI \uAE30\uBC18 \uD5A5\uC0C1',
    '\uBA4B\uC9C4 \uD544\uD130',
    '\uC6D0\uD130\uCE58 \uB9AC\uD130\uCE58',
  ];
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>Translate</span>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#22C55E',
          backgroundColor: '#F0FDF4',
          padding: '2px 10px',
          borderRadius: 10,
        }}>
          Translation complete!
        </span>
      </div>
      <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>Localized screenshots for 7 languages.</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 14 }}>
        {languages.map(l => (
          <Pill key={l} text={l} active={l === 'Korean'} />
        ))}
      </div>

      {/* Korean headlines */}
      <div style={{ fontSize: 12, fontWeight: 600, color: textSecondary, marginBottom: 6 }}>Korean Headlines</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
        {headlines.map((h, i) => (
          <div key={i} style={{
            fontSize: 12,
            color: textPrimary,
            padding: '6px 10px',
            backgroundColor: '#F9F9F7',
            borderRadius: 6,
            border: `1px solid ${border}`,
          }}>
            {i + 1}. {h}
          </div>
        ))}
      </div>

      {/* Preview */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          'linear-gradient(135deg, #667eea, #764ba2)',
          'linear-gradient(135deg, #f093fb, #f5576c)',
          'linear-gradient(135deg, #4facfe, #00f2fe)',
          'linear-gradient(135deg, #43e97b, #38f9d7)',
        ].map((g, i) => (
          <PhoneMockup key={i} gradient={g} headline={headlines[i]} small />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <Btn text="\u2190 Back" />
        <Btn text="Export \uD83D\uDCE6" primary />
      </div>
    </div>
  );
}

const STEP_RENDERERS = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

// --- Main Component ---

export const InteractiveDemo: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (idx === current) return;
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
    }, FADE_MS);
  }, [current]);

  // Auto-cycle
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % STEPS.length);
        setVisible(true);
      }, FADE_MS);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Step indicator bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        padding: '10px 12px',
        backgroundColor: '#F9F9F7',
        borderBottom: `1px solid #F0F0F0`,
        flexWrap: 'wrap',
      }}>
        {STEPS.map((step, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              border: 'none',
              background: i === current ? accentBg : 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <span style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              backgroundColor: i === current ? accent : '#E8E8E8',
              color: i === current ? '#fff' : textMuted,
              transition: 'all 0.2s',
            }}>
              {step.num}
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: i === current ? 600 : 400,
              color: i === current ? textPrimary : textMuted,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div style={{
        height: 500,
        overflow: 'hidden',
        backgroundColor: pageBg,
        position: 'relative',
      }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
        }}>
          {STEP_RENDERERS[current]()}
        </div>
      </div>
    </div>
  );
};
