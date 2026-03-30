import { useState } from "react";
import { startOfDay, endOfDay, format } from "date-fns";
import { DateRangePicker } from "../components/DateRangePicker";
import type { DateRange } from "../components/DateRangePicker";

const now = new Date();
const presets = [
  { label: "This month", from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) },
  { label: "Last 7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
sixMonthsAgo.setDate(1);

const codeInstall = `npm install @your-org/date-range-picker`;

const codeBasic = `import { DateRangePicker } from '@your-org/date-range-picker'
import type { DateRange } from '@your-org/date-range-picker'

function App() {
  const [range, setRange] = useState<DateRange>({
    start: new Date(2026, 2, 1),
    end: new Date(2026, 2, 31),
  })

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
    />
  )
}`;

const codePresets = `const presets = [
  { label: "This month", from: monthStart, to: monthEnd },
  { label: "Last 7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
]

<DateRangePicker
  value={range}
  onChange={setRange}
  presets={presets}
  minDate={new Date(2025, 0, 1)}
  maxDate={new Date()}
/>`;

const codeTheme = `:root {
  --drp-bg: #1a1a2e;
  --drp-range-color: rgba(255, 255, 255, 0.12);
  --drp-range-blur: 6px;
  --drp-handle-color: #e94560;
  --drp-text-primary: #eee;
  --drp-text-secondary: #666;
  --drp-tick-color: #333;
  --drp-preset-bg: #16213e;
  --drp-preset-active-bg: #0f3460;
  --drp-shadow: none;
}`;

const props = [
  { name: "value", type: "DateRange", desc: "Controlled range value", required: false },
  { name: "onChange", type: "(range: DateRange) => void", desc: "Called when range changes", required: true },
  { name: "minDate", type: "Date", desc: "Earliest selectable date", required: false },
  { name: "maxDate", type: "Date", desc: "Latest selectable date (default: today)", required: false },
  { name: "presets", type: "DateRangePreset[]", desc: "Quick-select preset buttons", required: false },
  { name: "monthsToShow", type: "number", desc: "Months visible in viewport (default: 4)", required: false },
  { name: "locale", type: "string", desc: 'Locale for formatting (e.g. "uk-UA")', required: false },
  { name: "className", type: "string", desc: "Additional CSS class", required: false },
  { name: "style", type: "CSSProperties", desc: "Inline styles", required: false },
];

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div style={{ position: "relative", margin: "0 0 2px" }}>
      {label && (
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 500,
          color: "#8a8f98",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}>
          {label}
        </div>
      )}
      <pre style={{
        background: "#17181c",
        color: "#c8ccd4",
        padding: "20px 24px",
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 1.7,
        overflow: "auto",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        border: "1px solid #26282e",
      }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function SectionTitle({ children, id }: { children: string; id: string }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 32,
        fontWeight: 400,
        color: "#111",
        marginBottom: 12,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </h2>
  );
}

export default function App() {
  const [range, setRange] = useState<DateRange>({
    start: (() => { const d = new Date(); d.setDate(d.getDate() - 6); return startOfDay(d); })(),
    end: startOfDay(new Date()),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

        html { scroll-behavior: smooth; }
        ::selection { background: #d1d5db; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#fafafa",
        fontFamily: "'DM Sans', sans-serif",
        color: "#333",
      }}>

        {/* ── Nav ── */}
        <nav style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(250, 250, 250, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #eee",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 500,
              color: "#111",
              letterSpacing: "-0.02em",
            }}>
              DateRangePicker
            </span>
          </div>
          <div style={{ display: "flex", gap: 32, fontSize: 13, color: "#666" }}>
            {["Playground", "Install", "API", "Presets", "Theming"].map((s) => (
              <a
                key={s}
                href={`#${s.toLowerCase()}`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                {s}
              </a>
            ))}
          </div>
        </nav>

        {/* ── Hero ── */}
        <header style={{
          padding: "80px 48px 60px",
          maxWidth: 820,
          margin: "0 auto",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 16,
          }}>
            React Component
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 56,
            fontWeight: 400,
            color: "#111",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}>
            Date Range Picker
          </h1>
          <p style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "#666",
            maxWidth: 520,
          }}>
            A timeline-based range selector with spring animations,
            backdrop-blur highlights, preset buttons, and per-digit
            odometer transitions. Zero dependencies beyond React
            and Framer Motion.
          </p>
        </header>

        {/* ── Playground ── */}
        <section id="playground" style={{ padding: "0 48px 80px", maxWidth: 820, margin: "0 auto" }}>
          <SectionTitle id="playground">Playground</SectionTitle>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
            Drag handles, click the track, select months, or use presets.
          </p>

          <div style={{
            background: "#f0f0f0",
            borderRadius: 16,
            padding: "40px 32px 32px",
            border: "1px solid #e5e5e5",
          }}>
            <DateRangePicker
              value={range}
              onChange={setRange}
              minDate={sixMonthsAgo}
              presets={presets}
            />
          </div>

          <div style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "center",
            gap: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            color: "#555",
          }}>
            <span style={{ color: "#aaa" }}>start</span>
            <span>{format(range.start, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}</span>
            <span style={{ color: "#ddd" }}>/</span>
            <span style={{ color: "#aaa" }}>end</span>
            <span>{format(endOfDay(range.end), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}</span>
          </div>
        </section>

        {/* ── Install ── */}
        <section id="install" style={{ padding: "0 48px 80px", maxWidth: 820, margin: "0 auto" }}>
          <SectionTitle id="install-heading">Install</SectionTitle>
          <div style={{ marginTop: 20 }}>
            <CodeBlock>{codeInstall}</CodeBlock>
          </div>
        </section>

        {/* ── Basic Usage ── */}
        <section style={{ padding: "0 48px 80px", maxWidth: 820, margin: "0 auto" }}>
          <SectionTitle id="usage">Usage</SectionTitle>
          <div style={{ marginTop: 20 }}>
            <CodeBlock label="Basic">{codeBasic}</CodeBlock>
          </div>
        </section>

        {/* ── API ── */}
        <section id="api" style={{ padding: "0 48px 80px", maxWidth: 820, margin: "0 auto" }}>
          <SectionTitle id="api-heading">API Reference</SectionTitle>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
            All props for <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              background: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: 4,
            }}>&lt;DateRangePicker /&gt;</code>
          </p>

          <div style={{
            border: "1px solid #e8e8e8",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <thead>
                <tr style={{ background: "#f8f8f8", textAlign: "left" }}>
                  {["Prop", "Type", "Description", ""].map((h) => (
                    <th key={h} style={{
                      padding: "10px 16px",
                      fontWeight: 500,
                      color: "#888",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #e8e8e8",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {props.map((p, i) => (
                  <tr key={p.name} style={{
                    borderBottom: i < props.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}>
                    <td style={{
                      padding: "12px 16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                      color: "#111",
                    }}>
                      {p.name}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: "#8b5cf6",
                    }}>
                      {p.type}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>
                      {p.desc}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.required && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#e94560",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          required
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Presets ── */}
        <section id="presets" style={{ padding: "0 48px 80px", maxWidth: 820, margin: "0 auto" }}>
          <SectionTitle id="presets-heading">Presets</SectionTitle>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 8 }}>
            Presets with <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              background: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: 4,
            }}>days</code> expand symmetrically from the current range center.
            Presets with <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              background: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: 4,
            }}>from/to</code> jump to an absolute range.
          </p>
          <div style={{ marginTop: 20 }}>
            <CodeBlock label="With presets">{codePresets}</CodeBlock>
          </div>
        </section>

        {/* ── Theming ── */}
        <section id="theming" style={{ padding: "0 48px 80px", maxWidth: 820, margin: "0 auto" }}>
          <SectionTitle id="theming-heading">Theming</SectionTitle>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 8 }}>
            Override CSS custom properties to match your design system.
          </p>
          <div style={{ marginTop: 20 }}>
            <CodeBlock label="Dark theme example">{codeTheme}</CodeBlock>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          padding: "40px 48px",
          borderTop: "1px solid #eee",
          maxWidth: 820,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "#bbb",
        }}>
          <span>MIT License</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>v1.0.0</span>
        </footer>

      </div>
    </>
  );
}
