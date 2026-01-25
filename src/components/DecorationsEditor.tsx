import React from 'react';
import { Screenshot, Decoration, StarRatingDecoration, LaurelDecoration, LaurelTextBlock, DEVICE_SIZES, DeviceSize } from '../types';

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  deviceSize: DeviceSize;
}

const styles: Record<string, React.CSSProperties> = {
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
  hint: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '12px'
  },
  section: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f7',
    borderRadius: '8px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fieldLabel: {
    fontSize: '11px',
    color: '#86868b'
  },
  input: {
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #d2d2d7',
    borderRadius: '6px',
    outline: 'none'
  },
  colorInput: {
    width: '100%',
    height: '32px',
    padding: '2px',
    border: '1px solid #d2d2d7',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  rangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  range: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    appearance: 'none',
    backgroundColor: '#d2d2d7',
    cursor: 'pointer'
  },
  rangeValue: {
    fontSize: '11px',
    color: '#86868b',
    minWidth: '30px',
    textAlign: 'right'
  },
  addButton: {
    padding: '8px 16px',
    fontSize: '13px',
    border: '1px solid #0071e3',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#0071e3',
    cursor: 'pointer',
    marginRight: '8px',
    transition: 'all 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '16px',
    color: '#86868b',
    fontSize: '13px'
  }
};

const createDefaultStars = (deviceSize: DeviceSize): StarRatingDecoration => {
  const dimensions = DEVICE_SIZES[deviceSize];
  return {
    type: 'stars',
    enabled: true,
    count: 5,
    size: 120,
    color: '#FFD700',
    position: { x: dimensions.width / 2, y: dimensions.height * 0.15 }
  };
};

const createDefaultLaurel = (deviceSize: DeviceSize): LaurelDecoration => {
  const dimensions = DEVICE_SIZES[deviceSize];
  return {
    type: 'laurel',
    enabled: true,
    size: 1.5,
    color: '#E91E8B',
    position: { x: dimensions.width / 2, y: dimensions.height * 0.5 },
    textBlocks: [
      { text: 'You need only', size: 60 },
      { text: '1', size: 200 },
      { text: 'App to create|Viral Video', size: 50 }
    ],
    textColor: '#000000'
  };
};

export const DecorationsEditor: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onScreenshotsChange,
  deviceSize
}) => {
  const selectedScreenshot = screenshots[selectedIndex];
  const decorations = selectedScreenshot?.decorations || [];

  const updateDecorations = (newDecorations: Decoration[]) => {
    const newScreenshots = screenshots.map((s, i) =>
      i === selectedIndex ? { ...s, decorations: newDecorations } : s
    );
    onScreenshotsChange(newScreenshots);
  };

  const addStars = () => {
    const newDecoration = createDefaultStars(deviceSize);
    updateDecorations([...decorations, newDecoration]);
  };

  const addLaurel = () => {
    const newDecoration = createDefaultLaurel(deviceSize);
    updateDecorations([...decorations, newDecoration]);
  };

  const updateDecoration = (index: number, updates: Partial<Decoration>) => {
    const newDecorations = decorations.map((d, i) =>
      i === index ? { ...d, ...updates } as Decoration : d
    );
    updateDecorations(newDecorations);
  };

  const removeDecoration = (index: number) => {
    const newDecorations = decorations.filter((_, i) => i !== index);
    updateDecorations(newDecorations);
  };

  if (!selectedScreenshot) {
    return (
      <div style={styles.container}>
        <label style={styles.label}>Decorations</label>
        <div style={styles.emptyState as React.CSSProperties}>
          Upload a screenshot first
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>Decorations</label>
      <p style={styles.hint}>
        Add stars or laurel wreaths to screenshot {selectedIndex + 1}. Drag in preview to position.
      </p>

      <div style={{ marginBottom: '12px' }}>
        <button style={styles.addButton} onClick={addStars}>
          + Add Stars
        </button>
        <button style={styles.addButton} onClick={addLaurel}>
          + Add Laurel
        </button>
      </div>

      {decorations.length === 0 && (
        <div style={styles.emptyState as React.CSSProperties}>
          No decorations added yet
        </div>
      )}

      {decorations.map((decoration, index) => (
        <div key={index} style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>
              {decoration.type === 'stars' ? 'Star Rating' : 'Laurel Wreath'}
            </span>
            <div style={styles.toggle}>
              <input
                type="checkbox"
                checked={decoration.enabled}
                onChange={(e) => updateDecoration(index, { enabled: e.target.checked })}
                style={styles.checkbox}
              />
              <button
                onClick={() => removeDecoration(index)}
                style={{
                  ...styles.addButton,
                  color: '#ff3b30',
                  borderColor: '#ff3b30',
                  padding: '4px 8px',
                  fontSize: '11px',
                  marginRight: 0
                }}
              >
                Remove
              </button>
            </div>
          </div>

          {decoration.type === 'stars' && (
            <div style={styles.grid}>
              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Stars Count</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={decoration.count}
                    onChange={(e) => updateDecoration(index, { count: Number(e.target.value) })}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue as React.CSSProperties}>{decoration.count}</span>
                </div>
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Star Size</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={decoration.size}
                    onChange={(e) => updateDecoration(index, { size: Number(e.target.value) })}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue as React.CSSProperties}>{decoration.size}px</span>
                </div>
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Star Color</span>
                <input
                  type="color"
                  value={decoration.color}
                  onChange={(e) => updateDecoration(index, { color: e.target.value })}
                  style={styles.colorInput}
                />
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Position X</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="0"
                    max={DEVICE_SIZES[deviceSize].width}
                    value={decoration.position.x}
                    onChange={(e) => updateDecoration(index, { position: { ...decoration.position, x: Number(e.target.value) } })}
                    style={styles.range}
                  />
                </div>
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Position Y</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="0"
                    max={DEVICE_SIZES[deviceSize].height}
                    value={decoration.position.y}
                    onChange={(e) => updateDecoration(index, { position: { ...decoration.position, y: Number(e.target.value) } })}
                    style={styles.range}
                  />
                </div>
              </div>
            </div>
          )}

          {decoration.type === 'laurel' && (
            <div style={styles.grid}>
              {/* Laurel wreath settings */}
              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Wreath Size</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={decoration.size}
                    onChange={(e) => updateDecoration(index, { size: Number(e.target.value) })}
                    style={styles.range}
                  />
                  <span style={styles.rangeValue as React.CSSProperties}>{decoration.size.toFixed(1)}x</span>
                </div>
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Laurel Color</span>
                <input
                  type="color"
                  value={decoration.color}
                  onChange={(e) => updateDecoration(index, { color: e.target.value })}
                  style={styles.colorInput}
                />
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Text Color</span>
                <input
                  type="color"
                  value={decoration.textColor}
                  onChange={(e) => updateDecoration(index, { textColor: e.target.value })}
                  style={styles.colorInput}
                />
              </div>

              {/* Text blocks section */}
              <div style={{ ...styles.field as React.CSSProperties, gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={styles.fieldLabel}>Text Blocks (use | for line breaks)</span>
                  <button
                    onClick={() => {
                      const newBlocks = [...(decoration.textBlocks || []), { text: 'New text', size: 60 }];
                      updateDecoration(index, { textBlocks: newBlocks });
                    }}
                    style={{
                      ...styles.addButton,
                      padding: '2px 8px',
                      fontSize: '11px',
                      marginRight: 0
                    }}
                  >
                    + Add Block
                  </button>
                </div>

                {(decoration.textBlocks || []).map((block: LaurelTextBlock, blockIndex: number) => (
                  <div key={blockIndex} style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #e8e8ed'
                  }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={block.text}
                        onChange={(e) => {
                          const newBlocks = decoration.textBlocks.map((b: LaurelTextBlock, i: number) =>
                            i === blockIndex ? { ...b, text: e.target.value } : b
                          );
                          updateDecoration(index, { textBlocks: newBlocks });
                        }}
                        placeholder="Text..."
                        style={{ ...styles.input, width: '100%', marginBottom: '4px' }}
                      />
                      <div style={styles.rangeContainer}>
                        <span style={{ ...styles.fieldLabel, minWidth: '30px' }}>Size:</span>
                        <input
                          type="range"
                          min="20"
                          max="400"
                          value={block.size}
                          onChange={(e) => {
                            const newBlocks = decoration.textBlocks.map((b: LaurelTextBlock, i: number) =>
                              i === blockIndex ? { ...b, size: Number(e.target.value) } : b
                            );
                            updateDecoration(index, { textBlocks: newBlocks });
                          }}
                          style={styles.range}
                        />
                        <span style={styles.rangeValue as React.CSSProperties}>{block.size}px</span>
                      </div>
                    </div>
                    {decoration.textBlocks.length > 1 && (
                      <button
                        onClick={() => {
                          const newBlocks = decoration.textBlocks.filter((_: LaurelTextBlock, i: number) => i !== blockIndex);
                          updateDecoration(index, { textBlocks: newBlocks });
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '14px',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: '#ff3b30',
                          color: '#fff',
                          cursor: 'pointer',
                          alignSelf: 'flex-start'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Position X</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="0"
                    max={DEVICE_SIZES[deviceSize].width}
                    value={decoration.position.x}
                    onChange={(e) => updateDecoration(index, { position: { ...decoration.position, x: Number(e.target.value) } })}
                    style={styles.range}
                  />
                </div>
              </div>

              <div style={styles.field as React.CSSProperties}>
                <span style={styles.fieldLabel}>Position Y</span>
                <div style={styles.rangeContainer}>
                  <input
                    type="range"
                    min="0"
                    max={DEVICE_SIZES[deviceSize].height}
                    value={decoration.position.y}
                    onChange={(e) => updateDecoration(index, { position: { ...decoration.position, y: Number(e.target.value) } })}
                    style={styles.range}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
