import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { DayProvider, useDay } from "../contexts/DayContext";
import AppLayout from "../layouts/AppLayout";
import RewardOverlay from "../components/RewardOverlay";
import { PageLoader } from "../components/ui";

const Today = lazy(() => import("../pages/Today"));
const Progress = lazy(() => import("../pages/Progress"));
const Rewards = lazy(() => import("../pages/Rewards"));

/** The reward overlay is global — it fires from wherever a task is completed. */
function Reward() {
  const { reward, closeReward } = useDay();
  return <RewardOverlay reward={reward} onClose={closeReward} />;
}

export default function AppRoutes() {
  return (
    <DayProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Today />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/rewards" element={<Rewards />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Reward />
    </DayProvider>
  );
}
