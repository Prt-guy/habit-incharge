import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Quote, Sparkles, AlertTriangle } from "lucide-react";
import { useDay } from "../contexts/DayContext";
import { ME } from "../userContext";
import { greeting, formatLongDate } from "../utils/date";
import TaskItem from "../components/TaskItem";

/** Circular day progress with a small dot marking the threshold to clear. */
function Ring({ completed, total, threshold, hit }) {
  const size = 116;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = total ? completed / total : 0;
  const color = hit ? "var(--color-secondary)" : "var(--color-primary)";

  // where the "day counts" threshold sits on the circle
  const tFrac = total ? threshold / total : 0;
  const tAngle = -Math.PI / 2 + tFrac * 2 * Math.PI;
  const tx = size / 2 + r * Math.cos(tAngle);
  const ty = size / 2 + r * Math.sin(tAngle);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(245,239,230,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - frac * c }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      {/* threshold dot sits on the un-rotated plane */}
      <span
        className="absolute h-2 w-2 rounded-full bg-ink/60"
        style={{ left: tx - 4, top: ty - 4 }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-serif text-3xl font-medium text-ink">
            {completed}
            <span className="text-lg text-muted">/{total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-5 w-36 rounded-full" />
      <div className="skeleton h-10 w-56 rounded-full" />
      <div className="skeleton h-36 rounded-[2rem]" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-24 rounded-[1.75rem]" />
      ))}
    </div>
  );
}

export default function Today() {
  const {
    day,
    progress,
    loading,
    error,
    completeTask,
    completed,
    total,
    threshold,
    hitToday,
    toThreshold,
  } = useDay();
  const [busyId, setBusyId] = useState(null);

  if (loading) return <TodaySkeleton />;

  if (error) {
    return (
      <div className="rounded-[1.75rem] border border-danger/40 bg-danger-soft p-5">
        <div className="mb-2 flex items-center gap-2 text-danger">
          <AlertTriangle size={18} />
          <p className="font-semibold">Couldn't load today</p>
        </div>
        <p className="text-sm text-ink-2">{error}</p>
      </div>
    );
  }

  const onComplete = async (id) => {
    setBusyId(id);
    try {
      await completeTask(id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {formatLongDate()}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-medium leading-tight text-ink md:text-4xl">
          {greeting()},{" "}
          <em className="italic text-primary">{ME.name.split(" ")[0]}</em>
        </h1>
      </header>

      {/* Hero: ring + streak */}
      <section className="flex items-center gap-5 rounded-[2rem] border border-line bg-card p-5 shadow-soft md:gap-7 md:p-6">
        <Ring completed={completed} total={total} threshold={threshold} hit={hitToday} />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft">
              <Flame size={18} className="text-accent" />
            </span>
            <p className="font-serif text-2xl font-medium text-ink">
              {progress?.streak ?? 0}
              <span className="ml-1.5 text-sm font-sans font-medium text-muted">
                day streak
              </span>
            </p>
          </div>
          <p className="mt-3 text-sm leading-snug text-muted">
            {hitToday ? (
              <span className="font-semibold text-secondary">
                Today counts. Keep going anyway.
              </span>
            ) : (
              <>
                <span className="font-semibold text-primary">{toThreshold} more</span>{" "}
                {toThreshold === 1 ? "task" : "tasks"} and today counts — the dot on
                the ring is the bar.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Yesterday's verdict */}
      {day?.verdict && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.75rem] border border-line bg-card-2 p-5"
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-soft">
              <Quote size={13} className="text-accent" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              On yesterday
            </span>
          </div>
          <p className="font-serif text-[15px] italic leading-relaxed text-ink-2">
            {day.verdict}
          </p>
        </motion.section>
      )}

      {/* The AI's line for today */}
      {day?.greeting && (
        <section className="flex items-start gap-3 rounded-[1.75rem] border border-primary/20 bg-primary-soft px-5 py-4">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20">
            <Sparkles size={14} className="text-primary" />
          </span>
          <p className="text-sm leading-relaxed text-ink-2">{day.greeting}</p>
        </section>
      )}

      {/* Today's tasks */}
      <section className="space-y-3">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Today's {total || ""} {total === 1 ? "task" : "tasks"}
        </p>
        {(day?.tasks || []).map((task, i) => (
          <TaskItem
            key={task.id}
            task={task}
            index={i}
            busy={busyId === task.id}
            onComplete={onComplete}
          />
        ))}
      </section>

      {completed === total && total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2rem] border border-secondary/30 bg-secondary-soft p-6 text-center"
        >
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary/20 text-2xl">
            🏆
          </span>
          <p className="mt-3 font-serif text-xl font-medium text-ink">
            A clean sweep.
          </p>
          <p className="mt-1 text-sm text-ink-2">Come back tomorrow and do it again.</p>
        </motion.div>
      )}
    </div>
  );
}
