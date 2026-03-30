import { useState } from "react";
import { startOfDay, endOfDay, format } from "date-fns";
import { DateRangePicker } from "../components/DateRangePicker";
import type { DateRange } from "../components/DateRangePicker";

const presets = [
  { label: "This month", days: new Date().getDate() },
  { label: "Last 7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
sixMonthsAgo.setDate(1);

export default function App() {
  const [range, setRange] = useState<DateRange>({
    start: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return startOfDay(d);
    })(),
    end: startOfDay(new Date()),
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 32,
        boxSizing: "border-box",
        margin: 0,
      }}
    >
      <DateRangePicker
        value={range}
        onChange={setRange}
        minDate={sixMonthsAgo}
        presets={presets}
      />

      <div
        style={{
          marginTop: 24,
          padding: "12px 20px",
          background: "#fff",
          borderRadius: 10,
          fontFamily: "monospace",
          fontSize: 14,
          color: "#374151",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, fontFamily: "sans-serif" }}>
          Selected Range (ISO 8601)
        </div>
        <div>
          {format(range.start, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}
        </div>
        <div style={{ color: "#9ca3af" }}>/</div>
        <div>
          {format(endOfDay(range.end), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}
        </div>
      </div>
    </div>
  );
}
