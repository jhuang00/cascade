'use client';
import styles from './page.module.css';

const LEVEL = {
  era: 'January 11, 2007',
  title: 'The Test',
  backstory:
    'China launches a direct-ascent missile at one of its own retired weather satellites, Fengyun-1C. The test succeeds. The orbital environment changes forever.',
  tutorial: {
    title: 'The cinematic event',
    body: 'Around the ten-second mark, a defunct weather satellite drifts in. A missile follows. If you act fast — hold SPACE and click the satellite — you can preserve it for the alternate timeline, +200 points.',
  },
  hudSample: 'L3 · 42s · 310 / 400 pts · missed 2 / 15',
  catalogLabel: '[ FENGYUN-1C · 2007 · CNSA ]',
};

const FONTS: {
  name: string;
  cssFamily: string;
  tag: string;
  note: string;
  linkHref?: string;
}[] = [
  {
    name: 'Current',
    cssFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    tag: 'monospace (baseline)',
    note: 'Every element uses this today. Shows the lack of typographic hierarchy.',
  },
  {
    name: 'General Sans',
    cssFamily: "'General Sans', sans-serif",
    tag: 'geometric humanist',
    note: 'Warm and grounded. Feels journalistic — suits the real-history angle.',
    linkHref:
      'https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap',
  },
  {
    name: 'Clash Grotesk',
    cssFamily: "'Clash Grotesk', sans-serif",
    tag: 'high-contrast grotesk',
    note: 'Assertive and editorial. Strong at large sizes — good for titles.',
    linkHref:
      'https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600&display=swap',
  },
  {
    name: 'Space Grotesk',
    cssFamily: "'Space Grotesk', sans-serif",
    tag: 'technical grotesk',
    note: 'Technical DNA with humanist warmth. Bridges the mono/display gap naturally.',
    linkHref:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&display=swap',
  },
  {
    name: 'Geist',
    cssFamily: "'Geist', sans-serif",
    tag: 'modern grotesk',
    note: 'Crisp and legible. Pairs extremely well with Geist Mono — same design family.',
    linkHref:
      'https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap',
  },
];

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export default function FontTestPage() {
  return (
    <>
      {/* Inject font stylesheets */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.fontshare.com" />
      {FONTS.filter((f) => f.linkHref).map((f) => (
        <link key={f.name} rel="stylesheet" href={f.linkHref} />
      ))}

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLabel}>Font evaluation · Cascade</div>
          <h1 className={styles.headerTitle}>Display font candidates</h1>
          <p className={styles.headerBody}>
            Each panel applies the candidate font to{' '}
            <strong>display text only</strong> — headings, era labels, backstory,
            buttons. The HUD, catalog labels, and telemetry always stay in{' '}
            <code className={styles.code}>ui-monospace</code>. This mirrors the
            planned two-font split.
          </p>
          <div className={styles.twoFontNote}>
            <div className={styles.twoFontRow}>
              <span className={styles.twoFontChip} data-role="display">Display role</span>
              <span className={styles.twoFontDesc}>game title · level title · era label · backstory · buttons</span>
            </div>
            <div className={styles.twoFontRow}>
              <span className={styles.twoFontChip} data-role="mono">Mono role (fixed)</span>
              <span className={styles.twoFontDesc}>HUD · score · timer · catalog labels · telemetry · tutorial bodies</span>
            </div>
          </div>
        </header>

        <div className={styles.grid}>
          {FONTS.map((font) => (
            <div key={font.name} className={styles.card} data-current={font.name === 'Current'}>
              {/* Card header */}
              <div className={styles.cardMeta}>
                <span className={styles.cardName}>{font.name}</span>
                <span className={styles.cardTag}>{font.tag}</span>
              </div>
              <p className={styles.cardNote}>{font.note}</p>

              {/* Intro screen mock */}
              <div className={styles.introMock}>
                {/* Era */}
                <div
                  className={styles.era}
                  style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                >
                  {LEVEL.era}
                </div>

                {/* Title */}
                <h2
                  className={styles.title}
                  style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                >
                  {LEVEL.title}
                </h2>

                {/* Backstory */}
                <p
                  className={styles.backstory}
                  style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                >
                  {LEVEL.backstory}
                </p>

                {/* Tutorial card — body stays mono, title uses display font */}
                <div className={styles.tutorialCard}>
                  <div
                    className={styles.tutorialTitle}
                    style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                  >
                    {LEVEL.tutorial.title}
                  </div>
                  <p className={styles.tutorialBody} style={{ fontFamily: MONO }}>
                    {LEVEL.tutorial.body}
                  </p>
                </div>

                {/* HUD sample — always mono */}
                <div className={styles.hudSample} style={{ fontFamily: MONO }}>
                  {LEVEL.hudSample}
                </div>

                {/* Catalog label — always mono */}
                <div className={styles.catalogLabel} style={{ fontFamily: MONO }}>
                  {LEVEL.catalogLabel}
                </div>

                {/* Button */}
                <button
                  className={styles.beginBtn}
                  style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                >
                  Begin
                </button>
              </div>

              {/* Alphabet + size ramp */}
              <div className={styles.specimenSection}>
                <div
                  className={styles.specimenLabel}
                  style={{ fontFamily: MONO }}
                >
                  specimen
                </div>
                <div
                  className={styles.specimenText}
                  style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                >
                  Cascade · LEO
                </div>
                <div
                  className={styles.specimenAlpha}
                  style={{ fontFamily: font.name === 'Current' ? MONO : font.cssFamily }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  <br />
                  abcdefghijklmnopqrstuvwxyz
                  <br />
                  0123456789 — · / × + %
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pairing summary */}
        <section className={styles.pairingSection}>
          <div className={styles.headerLabel}>Recommended pairings</div>
          <div className={styles.pairingGrid}>
            {FONTS.filter((f) => f.name !== 'Current').map((font) => (
              <div key={font.name} className={styles.pairingCard}>
                <div
                  className={styles.pairingHeading}
                  style={{ fontFamily: font.cssFamily }}
                >
                  {font.name}
                </div>
                <div className={styles.pairingStack}>
                  <div className={styles.pairingRow}>
                    <span className={styles.pairingRoleChip} data-role="display">Display</span>
                    <span
                      className={styles.pairingExample}
                      style={{ fontFamily: font.cssFamily }}
                    >
                      {font.name}
                    </span>
                  </div>
                  <div className={styles.pairingRow}>
                    <span className={styles.pairingRoleChip} data-role="mono">Mono</span>
                    <span
                      className={styles.pairingExample}
                      style={{ fontFamily: MONO }}
                    >
                      ui-monospace (SF Mono)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
