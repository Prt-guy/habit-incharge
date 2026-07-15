import { db, Query, parseJson, toJson } from "../appwrite/db";
import { OWNER_ID } from "../appwrite/config";
import { dayThreshold } from "../userContext";

function decorate(doc) {
  if (!doc) return null;
  return { ...doc, tasks: parseJson(doc.tasks_json, []) };
}

/**
 * Deterministic document id for a day. This is what makes `create` race-safe:
 * "check if today exists, then create" is not atomic across two boot() calls
 * (two tabs, or a reload firing while the first request is still in flight),
 * so both can see nothing and both create. Appwrite enforces `$id` uniqueness
 * atomically, so giving every day a fixed id turns that race into a 409 for
 * whoever loses it, instead of a silent duplicate.
 */
function docId(dateKey) {
  return `day_${dateKey.replace(/-/g, "")}`;
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

  /**
   * Create the day document once the AI has produced its tasks.
   *
   * Idempotent: if another boot() already created today (see docId above),
   * this catches the 409 and hands back their document instead of creating a
   * second one.
   */
  async create(dateKey, { tasks, greeting, verdict = "" }) {
    try {
      return decorate(
        await db.create(
          "days",
          {
            ownerId: OWNER_ID,
            dateKey,
            tasks_json: toJson(tasks),
            completedCount: 0,
            totalCount: tasks.length,
            status: "pending",
            greeting,
            verdict,
            createdAt: new Date().toISOString(),
          },
          docId(dateKey)
        )
      );
    } catch (err) {
      if (err?.code === 409) {
        const existing = await this.getDay(dateKey);
        if (existing) return existing;
      }
      throw err;
    }
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

    const hit = day.completedCount >= dayThreshold(day.totalCount);
    const updated = await db.update("days", day.$id, {
      status: hit ? "done" : "missed",
    });
    return { day: decorate(updated), hit };
  },
};
