import { db, Query, parseJson, toJson } from "../appwrite/db";
import { OWNER_ID } from "../appwrite/config";
import { DAY_SUCCESS_THRESHOLD } from "../userContext";

function decorate(doc) {
  if (!doc) return null;
  return { ...doc, tasks: parseJson(doc.tasks_json, []) };
}

export const dayService = {
  decorate,

  async getDay(dateKey) {
    const rows = await db.list("days", [
      Query.equal("ownerId", OWNER_ID),
      Query.equal("dateKey", dateKey),
      Query.limit(1),
    ]);
    return rows.length ? decorate(rows[0]) : null;
  },

  /** Most recent days, newest first. */
  async recent(limit = 30) {
    const rows = await db.list("days", [
      Query.equal("ownerId", OWNER_ID),
      Query.orderDesc("dateKey"),
      Query.limit(limit),
    ]);
    return rows.map(decorate);
  },

  /** Create the day document once the AI has produced its tasks. */
  async create(dateKey, { tasks, greeting, verdict = "" }) {
    return decorate(
      await db.create("days", {
        ownerId: OWNER_ID,
        dateKey,
        tasks_json: toJson(tasks),
        completedCount: 0,
        totalCount: tasks.length,
        status: "pending",
        greeting,
        verdict,
        createdAt: new Date().toISOString(),
      })
    );
  },

  /** Persist the task list after a completion, keeping completedCount in sync. */
  async saveTasks(day, tasks) {
    const completedCount = tasks.filter((t) => t.completed).length;
    return decorate(
      await db.update("days", day.$id, {
        tasks_json: toJson(tasks),
        completedCount,
      })
    );
  },

  async setVerdict(day, verdict) {
    return decorate(await db.update("days", day.$id, { verdict }));
  },

  /**
   * Close out a past day: it either cleared the threshold or it didn't.
   * Idempotent — a day already marked done/missed is left alone.
   */
  async evaluate(day) {
    if (day.status !== "pending") return { day, hit: day.status === "done" };

    const hit = day.completedCount >= DAY_SUCCESS_THRESHOLD;
    const updated = await db.update("days", day.$id, {
      status: hit ? "done" : "missed",
    });
    return { day: decorate(updated), hit };
  },
};
