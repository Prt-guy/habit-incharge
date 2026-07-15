import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { rewardService } from "../services/rewardService";
import { formatShortDate } from "../utils/date";

const TIERS = {
  small: { label: "Small", emoji: "🎁", color: "var(--color-lilac)" },
  solid: { label: "Solid", emoji: "🎉", color: "var(--color-primary)" },
  big: { label: "Big", emoji: "🔥", color: "var(--color-secondary)" },
  epic: { label: "Epic", emoji: "⚡", color: "var(--color-accent)" },
};

export default function Rewards() {
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    rewardService.list(80).then(setRewards);
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-serif text-3xl font-medium text-ink md:text-4xl">
          Things you've <em className="italic text-primary">earned</em>
        </h1>
        <p className="mt-1 text-sm text-muted">Every payout, on record.</p>
      </header>

      {!rewards ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-[1.75rem]" />
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <div className="flex flex-col items-center rounded-[2rem] border border-dashed border-line-strong px-6 py-16 text-center">
          <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
            <Gift size={26} />
          </span>
          <p className="font-serif text-xl font-medium text-ink">Nothing yet</p>
          <p className="mt-1.5 max-w-xs text-sm text-muted">
            Finish a task and you'll get something worth having.
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {rewards.map((r, i) => {
            const tier = TIERS[r.tier] || TIERS.solid;
            return (
              <motion.article
                key={r.$id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="rounded-[1.75rem] border border-line bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl"
                    style={{ backgroundColor: `color-mix(in srgb, ${tier.color} 14%, transparent)` }}
                  >
                    {tier.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{r.title}</p>
                    <p className="text-xs text-muted">
                      {formatShortDate(r.dateKey)} ·{" "}
                      <span
                        className="font-semibold uppercase tracking-wide"
                        style={{ color: tier.color }}
                      >
                        {tier.label}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{r.body}</p>
                <p className="mt-3 truncate text-xs text-faint">for: {r.taskTitle}</p>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
