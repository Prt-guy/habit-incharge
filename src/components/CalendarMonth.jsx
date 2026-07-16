import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateKey, todayKey } from "../utils/date";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Build a 7-wide grid of Dates for the given month, padded with nulls. */
function buildWeeks(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = new Date(year, month, 1).getDay();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * A real month calendar: weekday header, navigable months, each date colored
 * by that day's status. Tapping a tracked day selects it — the caller renders
 * the detail. Future dates and days with no record are inert.
 */
export default function CalendarMonth({ byDay, selected, onSelect }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth();
  const weeks = useMemo(() => buildWeeks(cursor.year, cursor.month), [cursor]);
  const label = useMemo(
    () =>
      new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [cursor]
  );

  const goPrev = () =>
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  const goNext = () => {
    if (isCurrentMonth) return;
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  };

  const today = todayKey();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink active:scale-90"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-serif text-lg font-medium text-ink">{label}</p>
        <button
          onClick={goNext}
          disabled={isCurrentMonth}
          className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink active:scale-90 disabled:pointer-events-none disabled:opacity-25"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-faint">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="space-y-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((date, di) => {
              if (!date) return <span key={di} />;

              const key = dateKey(date);
              const d = byDay[key];
              const isToday = key === today;
              const isFuture = key > today;
              const isSelected = key === selected;
              const tappable = Boolean(d) && !isFuture;

              let cls = "bg-accent-soft text-muted";
              if (d?.status === "done") cls = "bg-secondary text-on-lime";
              else if (d?.status === "missed") cls = "bg-danger text-white";
              else if (d?.status === "pending") cls = "bg-primary text-white";
              if (isFuture) cls = "bg-transparent text-faint/50";

              return (
                <button
                  key={key}
                  onClick={() => tappable && onSelect(key)}
                  disabled={!tappable}
                  className={`relative grid aspect-square place-items-center rounded-full text-[13px] font-medium transition-transform ${cls} ${
                    tappable ? "active:scale-90" : "cursor-default"
                  }`}
                  style={
                    isSelected
                      ? { outline: "2px solid var(--color-ink)", outlineOffset: "2px" }
                      : isToday
                        ? { outline: "1.5px solid var(--color-primary)", outlineOffset: "2px" }
                        : undefined
                  }
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" /> Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Missed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> In progress
        </span>
      </div>
    </div>
  );
}
