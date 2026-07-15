import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

/** Weight as honey-colored pips — what the task is worth, at a glance. */
function Weight({ value }) {
  return (
    <span className="flex items-center gap-1" title={`Worth ${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < value ? "bg-accent" : "bg-ink/10"
          )}
        />
      ))}
    </span>
  );
}

export default function TaskItem({ task, onComplete, busy, index }) {
  const done = task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
      className={cn(
        "flex items-start gap-4 rounded-[1.75rem] border border-line p-4 pl-5 transition-colors md:p-5",
        done ? "bg-card/40" : "bg-card"
      )}
    >
      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={cn(
            "font-semibold leading-snug",
            done ? "text-muted line-through decoration-muted/60" : "text-ink"
          )}
        >
          {task.title}
        </p>
        {task.detail && (
          <p className={cn("mt-1 text-sm leading-snug", done ? "text-faint" : "text-muted")}>
            {task.detail}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2.5">
          <Weight value={task.weight} />
          {done && task.reward && (
            <span className="truncate text-xs font-medium text-secondary">
              🎁 {task.reward.title}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => !done && !busy && onComplete(task.id)}
        disabled={done || busy}
        aria-label={done ? "Completed" : `Complete: ${task.title}`}
        className={cn(
          // a full circle, thumb-sized
          "grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-all active:scale-90",
          done
            ? "border-secondary bg-secondary text-bg"
            : "border-line-strong text-transparent hover:border-secondary/60 active:border-secondary"
        )}
      >
        {busy ? (
          <Loader2 size={20} className="animate-spin text-primary" />
        ) : (
          <motion.span
            initial={false}
            animate={{ scale: done ? 1 : 0.5, opacity: done ? 1 : 0 }}
          >
            <Check size={22} strokeWidth={3} />
          </motion.span>
        )}
      </button>
    </motion.div>
  );
}
