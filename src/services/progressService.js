import { db, Query } from "../appwrite/db";
import { OWNER_ID } from "../appwrite/config";

const EMPTY = {
  streak: 0,
  longestStreak: 0,
  daysDone: 0,
  daysMissed: 0,
  tasksCompleted: 0,
  lastEvaluatedKey: "",
};

export const progressService = {
  /** The single running progress document, created on first run. */
  async getOrCreate() {
    const rows = await db.list("progress", [
      Query.equal("ownerId", OWNER_ID),
      Query.limit(1),
    ]);
    if (rows.length) return rows[0];

    return db.create("progress", {
      ownerId: OWNER_ID,
      ...EMPTY,
      createdAt: new Date().toISOString(),
    });
  },

  async update(id, patch) {
    return db.update("progress", id, patch);
  },

  /**
   * Fold a finished day into the running totals.
   *
   * `hit` is whether the day cleared DAY_SUCCESS_THRESHOLD. A hit extends the
   * streak; a miss resets it to zero — that reset is the whole point of the
   * streak, so it is deliberately unforgiving.
   *
   * Note this does NOT touch `tasksCompleted`: that is incremented by
   * `bumpTask` as each task is finished, so adding it again here would
   * double-count.
   */
  async recordDay(progress, { dateKey, hit }) {
    const streak = hit ? (progress.streak || 0) + 1 : 0;

    return this.update(progress.$id, {
      streak,
      longestStreak: Math.max(progress.longestStreak || 0, streak),
      daysDone: (progress.daysDone || 0) + (hit ? 1 : 0),
      daysMissed: (progress.daysMissed || 0) + (hit ? 0 : 1),
      lastEvaluatedKey: dateKey,
    });
  },

  /** Bump the lifetime task counter as each task is finished. */
  async bumpTask(progress) {
    return this.update(progress.$id, {
      tasksCompleted: (progress.tasksCompleted || 0) + 1,
    });
  },
};
