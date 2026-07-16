import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Trophy, Check, X, CheckCircle2 } from "lucide-react";
import { useDay } from "../contexts/DayContext";
import { formatShortDate, todayKey } from "../utils/date";
import { DAY_SUCCESS_RATIO } from "../userContext";
import CalendarMonth from "../components/CalendarMonth";

function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    peach: "bg-primary-soft text-primary",
    sage: "bg-secondary-soft text-secondary",
    honey: "bg-accent-soft text-accent",
    clay: "bg-danger-soft text-danger",
    lilac: "bg-lilac-soft text-lilac",
  };
  return (
    <div className="flex items-center gap-3.5 rounded-[1.75rem] border border-line bg-card p-4 md:p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tones[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="font-serif text-2xl font-medium leading-none text-ink">{value}</p>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function Progress() {
  const { progress, history, loading } = useDay();
  const [selectedKey, setSelectedKey] = useState(() => todayKey());

  const byDay = useMemo(() => {
    const map = {};
    history.forEach((d) => (map[d.dateKey] = d));
    return map;
  }, [history]);

  const selectedDay = selectedKey ? byDay[selectedKey] : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-44 rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-[1.75rem]" />
          ))}
        </div>
        <div className="skeleton h-44 rounded-[2rem]" />
      </div>
    );
  }

  const totalDays = (progress?.daysDone || 0) + (progress?.daysMissed || 0);
  const rate = totalDays ? Math.round(((progress?.daysDone || 0) / totalDays) * 100) : 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-serif text-3xl font-medium text-ink md:text-4xl">
          The <em className="italic text-primary">record</em>
        </h1>
        <p className="mt-1 text-sm text-muted">It doesn't lie.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Flame} tone="honey" label="Current streak" value={`${progress?.streak ?? 0}d`} />
        <Stat icon={Trophy} tone="lilac" label="Longest streak" value={`${progress?.longestStreak ?? 0}d`} />
        <Stat icon={Check} tone="sage" label="Days done" value={progress?.daysDone ?? 0} />
        <Stat icon={X} tone="clay" label="Days missed" value={progress?.daysMissed ?? 0} />
      </div>

      {/* Hit rate */}
      <section className="rounded-[2rem] border border-line bg-card p-5 md:p-6">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-muted">Hit rate</span>
          <span className="font-serif text-2xl font-medium text-ink">{rate}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-ink/8">
          <motion.div
            className="h-full rounded-full bg-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="mt-2.5 text-xs text-muted">
          A day counts when you finish at least {Math.round(DAY_SUCCESS_RATIO * 100)}% of
          that day's tasks.
        </p>
      </section>

      {/* Calendar */}
      <section className="rounded-[2rem] border border-line bg-card p-5 md:p-6">
        <CalendarMonth byDay={byDay} selected={selectedKey} onSelect={setSelectedKey} />
      </section>

      {/* Selected day's detail */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.section
            key={selectedDay.dateKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="rounded-[1.75rem] border border-line bg-card-2 p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-serif text-lg font-medium text-ink">
                  {formatShortDate(selectedDay.dateKey)}
                </p>
                <p className="text-xs capitalize text-muted">
                  {selectedDay.status} · {selectedDay.completedCount}/{selectedDay.totalCount} done
                </p>
              </div>
              <span
                className={`grid h-9 w-9 place-items-center rounded-full ${
                  selectedDay.status === "done"
                    ? "bg-secondary-soft text-secondary"
                    : selectedDay.status === "missed"
                      ? "bg-danger-soft text-danger"
                      : "bg-primary-soft text-primary"
                }`}
              >
                {selectedDay.status === "done" ? (
                  <CheckCircle2 size={16} />
                ) : selectedDay.status === "missed" ? (
                  <X size={16} />
                ) : (
                  <Flame size={16} />
                )}
              </span>
            </div>
            <div className="space-y-1.5">
              {(selectedDay.tasks || []).map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 rounded-full bg-card px-3.5 py-2">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      t.completed ? "bg-secondary text-bg" : "bg-ink/10 text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span
                    className={`truncate text-sm ${
                      t.completed ? "text-muted line-through decoration-muted/50" : "text-ink-2"
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Recent days */}
      <section>
        <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Recent days
        </p>
        {history.length === 0 ? (
          <p className="rounded-[1.75rem] border border-dashed border-line-strong p-7 text-center text-sm text-muted">
            No history yet. Today is day one.
          </p>
        ) : (
          <div className="space-y-2.5">
            {history.slice(0, 14).map((d) => (
              <button
                key={d.$id}
                onClick={() => setSelectedKey(d.dateKey)}
                className="flex w-full items-center gap-3.5 rounded-full border border-line bg-card py-2.5 pl-2.5 pr-5 text-left transition-colors active:bg-card-2"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                    d.status === "done"
                      ? "bg-secondary-soft text-secondary"
                      : d.status === "missed"
                        ? "bg-danger-soft text-danger"
                        : "bg-primary-soft text-primary"
                  }`}
                >
                  {d.status === "done" ? (
                    <CheckCircle2 size={17} />
                  ) : d.status === "missed" ? (
                    <X size={17} />
                  ) : (
                    <Flame size={17} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{formatShortDate(d.dateKey)}</p>
                  <p className="text-xs capitalize text-muted">{d.status}</p>
                </div>
                <p className="font-serif text-lg font-medium tabular-nums text-ink-2">
                  {d.completedCount}
                  <span className="text-sm text-muted">/{d.totalCount}</span>
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
