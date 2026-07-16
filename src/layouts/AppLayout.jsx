import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Flame, Gift } from "lucide-react";
import { cn } from "../utils/cn";

const TABS = [
  { to: "/", label: "Today", icon: Sun },
  { to: "/progress", label: "Progress", icon: Flame },
  { to: "/rewards", label: "Rewards", icon: Gift },
];

/**
 * One floating pill of a nav — a solid near-black bar, the way the reference
 * does it. It hugs the thumb at the bottom on phones and floats top-center on
 * desktop. The active tab is a filled blue circle-pill; inactive tabs collapse
 * to bare icons on small screens.
 */
function PillNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-5 z-40 flex justify-center md:bottom-auto md:top-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center gap-1 rounded-full bg-accent p-1.5 shadow-float">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}>
            {({ isActive }) => (
              <div
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-4 py-2.5 transition-colors md:px-5",
                  isActive ? "text-white" : "text-white/50 hover:text-white/80"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <tab.icon size={19} className="relative z-10" strokeWidth={2.2} />
                <span
                  className={cn(
                    "relative z-10 text-sm font-semibold",
                    // inactive labels hide on phones so the pill stays compact
                    isActive ? "inline" : "hidden md:inline"
                  )}
                >
                  {tab.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-[100dvh]">
      <main className="mx-auto w-full max-w-xl px-5 pb-32 pt-7 md:pb-16 md:pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <PillNav />
    </div>
  );
}
