/* eslint-disable react-refresh/only-export-components -- hook is co-located with its provider by design */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { dayService } from "../services/dayService";
import { progressService } from "../services/progressService";
import { rewardService } from "../services/rewardService";
import { aiService } from "../gemini/aiService";
import { todayKey, yesterdayKey } from "../utils/date";
import { dayThreshold } from "../userContext";

const DayContext = createContext(null);

export function DayProvider({ children }) {
  const [day, setDay] = useState(null);
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reward, setReward] = useState(null); // the reward overlay's payload
  const booted = useRef(false);

  /**
   * The whole app boot, in order:
   *   1. load progress + recent days
   *   2. close out yesterday if it's still open (this is what creates a MISS)
   *   3. make sure today exists — generating its tasks if it doesn't
   *   4. write the verdict on yesterday onto today, so it greets you with it
   */
  const boot = useCallback(async () => {
    const today = todayKey();

    const prog = await progressService.getOrCreate();
    const recent = await dayService.recent(60);

    let workingProgress = prog;
    let verdict = "";

    // --- 2. settle any past day still marked pending -------------------------
    const stale = recent.filter((d) => d.dateKey !== today && d.status === "pending");
    // oldest first, so the streak advances in the right order
    for (const d of [...stale].reverse()) {
      const { day: closed, hit } = await dayService.evaluate(d);
      workingProgress = await progressService.recordDay(workingProgress, {
        dateKey: closed.dateKey,
        hit,
      });

      // Only yesterday earns a verdict — older misses are water under the bridge.
      if (closed.dateKey === yesterdayKey()) {
        verdict = await aiService.verdict({
          day: closed,
          progress: workingProgress,
          today,
        });
      }
    }

    // --- 3. today ------------------------------------------------------------
    let todayDoc = recent.find((d) => d.dateKey === today) || null;

    if (!todayDoc) {
      const fresh = await dayService.recent(60);
      const historyForAi = fresh
        .filter((d) => d.dateKey !== today)
        .slice(0, 5)
        .map((d) => ({
          dateKey: d.dateKey,
          status: d.status,
          completedCount: d.completedCount,
          totalCount: d.totalCount,
          titles: (d.tasks || []).map((t) => t.title),
        }));

      const { greeting, tasks } = await aiService.dailyTasks({
        progress: workingProgress,
        history: historyForAi,
        today,
      });

      todayDoc = await dayService.create(today, { tasks, greeting, verdict });
    } else if (verdict && !todayDoc.verdict) {
      // Today existed already but yesterday was only just settled.
      todayDoc = await dayService.setVerdict(todayDoc, verdict);
    }

    setProgress(workingProgress);
    setDay(todayDoc);
    setHistory(await dayService.recent(60));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    boot().catch((err) => {
      console.error("[boot]", err);
      setError(err?.message || "Something went wrong loading today.");
      setLoading(false);
    });
  }, [boot]);

  /** Finish a task: persist it, ask the AI for a reward, show it. */
  const completeTask = useCallback(
    async (taskId) => {
      if (!day || !progress) return;
      const task = day.tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;

      const completedToday = day.tasks.filter((t) => t.completed).length + 1;

      // Optimistic: tick the box immediately, reward lands after.
      const optimistic = day.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      );
      setDay((d) => ({ ...d, tasks: optimistic, completedCount: completedToday }));

      const recentRewards = await rewardService.recentTitles(20);
      const earned = await aiService.reward({
        task,
        progress,
        recentRewards,
        completedToday,
        totalToday: day.totalCount,
      });

      const withReward = optimistic.map((t) =>
        t.id === taskId ? { ...t, reward: earned } : t
      );

      const [savedDay, savedProgress] = await Promise.all([
        dayService.saveTasks(day, withReward),
        progressService.bumpTask(progress),
        rewardService.create({
          dateKey: day.dateKey,
          taskTitle: task.title,
          weight: task.weight,
          tier: earned.tier,
          title: earned.title,
          body: earned.body,
        }),
      ]);

      setDay(savedDay);
      setProgress(savedProgress);
      setReward({ ...earned, task, _key: Date.now() });
    },
    [day, progress]
  );

  const closeReward = useCallback(() => setReward(null), []);

  const derived = useMemo(() => {
    const completed = day?.completedCount ?? 0;
    const total = day?.totalCount ?? 0;
    const threshold = dayThreshold(total);
    return {
      completed,
      total,
      threshold,
      remaining: Math.max(0, total - completed),
      hitToday: completed >= threshold,
      toThreshold: Math.max(0, threshold - completed),
      pct: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [day]);

  const value = useMemo(
    () => ({
      day,
      progress,
      history,
      loading,
      error,
      reward,
      completeTask,
      closeReward,
      ...derived,
    }),
    [day, progress, history, loading, error, reward, completeTask, closeReward, derived]
  );

  return <DayContext.Provider value={value}>{children}</DayContext.Provider>;
}

export function useDay() {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error("useDay must be used within DayProvider");
  return ctx;
}
