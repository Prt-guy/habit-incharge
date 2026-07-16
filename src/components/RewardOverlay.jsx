import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Gift, X } from "lucide-react";
import { burstConfetti, levelUpConfetti } from "../utils/confetti";

/**
 * How loud the payout looks scales with what the task was worth.
 *   hex — the solid fill (orb, button)
 *   on  — text/icon that sits on that fill
 *   ink — a readable version of the color for text on a white card
 */
const TIERS = {
  small: { label: "Small win", emoji: "🎁", hex: "#64748b", on: "#ffffff", ink: "#475569" },
  solid: { label: "Solid", emoji: "🎉", hex: "#2563eb", on: "#ffffff", ink: "#1d4ed8" },
  big: { label: "Big one", emoji: "🔥", hex: "#a3e635", on: "#1a2e05", ink: "#4d7c0f" },
  epic: { label: "Epic", emoji: "⚡", hex: "#111827", on: "#ffffff", ink: "#111827" },
};

function Panel({ reward, onClose }) {
  const [opened, setOpened] = useState(false);
  const tier = TIERS[reward.tier] || TIERS.solid;

  const open = () => {
    setOpened(true);
    if (reward.tier === "epic" || reward.tier === "big") levelUpConfetti();
    else burstConfetti();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] grid place-items-center p-5"
    >
      <div
        className="absolute inset-0 bg-ink/60"
        onClick={opened ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="gift"
              initial={{ scale: 0.6, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex flex-col items-center rounded-[2rem] bg-card px-8 py-10 text-center shadow-float"
            >
              {/* a full circle — tap to open */}
              <motion.button
                onClick={open}
                whileTap={{ scale: 0.92 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                className="grid h-44 w-44 place-items-center rounded-full shadow-float"
                style={{ backgroundColor: tier.hex }}
              >
                <Gift size={64} strokeWidth={1.8} style={{ color: tier.on }} />
              </motion.button>
              <p
                className="mt-8 text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: tier.ink }}
              >
                {tier.label}
              </p>
              <h2 className="mt-2 font-serif text-3xl italic text-ink">
                You earned it
              </h2>
              <p className="mt-2 text-sm text-muted">Tap to open</p>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative overflow-hidden rounded-[2rem] border border-line bg-card p-6 shadow-float"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors active:bg-ink/5"
                aria-label="Close"
              >
                <X size={17} />
              </button>

              <div className="flex flex-col items-center text-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="grid h-16 w-16 place-items-center rounded-full text-3xl"
                  style={{ backgroundColor: `${tier.hex}22` }}
                >
                  {tier.emoji}
                </motion.span>
                <p
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: tier.ink }}
                >
                  {tier.label} · weight {reward.task?.weight}/5
                </p>
              </div>

              {reward.line && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 text-center font-serif text-[15px] italic leading-relaxed text-ink-2"
                >
                  {reward.line}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mt-5 rounded-[1.5rem] border border-line bg-card-2 p-5 text-center"
              >
                <p className="font-serif text-lg font-medium text-ink">{reward.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{reward.body}</p>
              </motion.div>

              <button
                onClick={onClose}
                className="mt-5 w-full rounded-full py-3.5 font-semibold transition-transform active:scale-[0.98]"
                style={{ backgroundColor: tier.hex, color: tier.on }}
              >
                Back to it
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function RewardOverlay({ reward, onClose }) {
  return (
    <AnimatePresence>
      {reward && <Panel key={reward._key} reward={reward} onClose={onClose} />}
    </AnimatePresence>
  );
}
