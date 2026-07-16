import { motion } from "framer-motion";

export function Spinner({ size = 20 }) {
  return (
    <motion.span
      className="inline-block rounded-full border-2 border-ink/15 border-t-primary"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  );
}

export function PageLoader({ label = "Getting your day…" }) {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-bg">
      <div className="flex flex-col items-center gap-5">
        {/* three breathing circles — the app's shape, doing its thing */}
        <div className="flex items-center gap-2">
          {["#2563eb", "#a3e635", "#111827"].map((c, i) => (
            <motion.span
              key={c}
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: c }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                repeat: Infinity,
                duration: 1.3,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="font-serif text-sm italic text-muted">{label}</p>
      </div>
    </div>
  );
}
