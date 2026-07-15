import { generateText, generateJson, geminiAvailable } from "./client";
import { prompts } from "./prompts";
import { ME, TASKS_PER_DAY, DAY_SUCCESS_THRESHOLD } from "../userContext";

/** Tier a reward lands in, given the task's weight. Weight is the contract. */
export function tierForWeight(weight) {
  if (weight >= 5) return "epic";
  if (weight >= 4) return "big";
  if (weight >= 3) return "solid";
  return "small";
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Fallbacks so the app is still usable with no Gemini key — it just stops being
 * personal. Each mirrors the shape the real call returns.
 */
const fallback = {
  dailyTasks() {
    const goals = ME.goals.length ? ME.goals : ["Make progress on something that matters"];
    return {
      greeting: "No AI today, so here's a plain list. Do them anyway.",
      tasks: Array.from({ length: TASKS_PER_DAY }, (_, i) => ({
        title: `Work on: ${goals[i % goals.length]}`,
        detail: "Set a 25-minute timer and start. That's the whole task.",
        weight: (i % 5) + 1,
      })),
    };
  },
  reward(task) {
    // No AI: still grant an actual activity, pulled straight from their list.
    const like = ME.iLike.length ? pick(ME.iLike) : "something you enjoy";
    return {
      tier: tierForWeight(task.weight),
      title: "Earned",
      body: `You've earned it — go do this: ${like}. That's ${task.weight}/5 of work banked.`,
      line: `"${task.title}" — done.`,
    };
  },
  verdict(day) {
    const hit = day.completedCount >= DAY_SUCCESS_THRESHOLD;
    return hit
      ? `You hit ${day.completedCount}/${day.totalCount} yesterday. That's the bar. Do it again.`
      : `${day.completedCount}/${day.totalCount} yesterday. That's a miss. You know it. Start with the first task today and don't negotiate.`;
  },
};

/** Normalize whatever the model returns into exactly TASKS_PER_DAY sane tasks. */
function normalizeTasks(raw) {
  const list = Array.isArray(raw?.tasks) ? raw.tasks : [];
  const tasks = list
    .filter((t) => t && typeof t.title === "string" && t.title.trim())
    .slice(0, TASKS_PER_DAY)
    .map((t, i) => ({
      id: `t${i}`,
      title: String(t.title).trim(),
      detail: String(t.detail || "").trim(),
      weight: Math.min(5, Math.max(1, Number(t.weight) || 3)),
      completed: false,
      completedAt: "",
      reward: null,
    }));
  return tasks.length ? tasks : null;
}

export const aiService = {
  available: geminiAvailable,

  /** Today's five tasks + a greeting. Always returns a usable day. */
  async dailyTasks(args) {
    const json = await generateJson(prompts.dailyTasks(args), null);
    const tasks = normalizeTasks(json);
    if (!tasks) {
      const fb = fallback.dailyTasks();
      return { greeting: fb.greeting, tasks: normalizeTasks(fb) };
    }
    return {
      greeting: String(json.greeting || "").trim() || "Today's list. Go.",
      tasks,
    };
  },

  /** Reward for a finished task, sized to its weight. */
  async reward(args) {
    const json = await generateJson(prompts.reward(args), null);
    if (!json || !json.body) return fallback.reward(args.task);

    return {
      // The tier is ALWAYS derived from the task's weight, never taken from the
      // model. It drifts — it will happily label a weight-5 task "small", which
      // would pay out the smallest reward for the hardest task. Weight is the
      // contract; the model only writes the prose.
      tier: tierForWeight(args.task.weight),
      title: String(json.title || "Earned").trim(),
      body: String(json.body).trim(),
      line: String(json.line || "").trim(),
    };
  },

  /** The morning verdict on yesterday. */
  async verdict(args) {
    const text = await generateText(prompts.verdict(args));
    return text || fallback.verdict(args.day);
  },
};
