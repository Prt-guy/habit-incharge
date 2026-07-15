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

// There is exactly one progress document, ever. Giving it a fixed id means a
// race between two boot() calls (two tabs, or a reload mid-request) collides
// on Appwrite's atomic $id uniqueness — a 409 for the loser — instead of
// silently forking into two documents whose streaks then diverge forever.
const PROGRESS_ID = "progress";

export const progressService = {
  /** The single running progress document, created on first run. */
  async getOrCreate() {
    // Look up by ownerId, not by PROGRESS_ID: a document created before this
    // id scheme existed still has a random $id, and must keep being found.
    const rows = await db.list("progress", [
      Query.equal("ownerId", OWNER_ID),
      Query.limit(1),
    ]);
    if (rows.length) return rows[0];

    try {
      return await db.create(
        "progress",
        { ownerId: OWNER_ID, ...EMPTY, createdAt: new Date().toISOString() },
        PROGRESS_ID
      );
    } catch (err) {
      if (err?.code === 409) {
        const existing = await db.list("progress", [
          Query.equal("ownerId", OWNER_ID),
          Query.limit(1),
        ]);
        if (existing.length) return existing[0];
      }
      throw err;
    }
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
   *
   * Guards against re-recording a day that's already folded in — this can
   * happen if two boot()s ever race to close out the same stale day (two tabs
   * open at once). `lastEvaluatedKey` is the high-water mark; a dateKey at or
   * before it has already been counted, so skip rather than double it.
   */
  async recordDay(progress, { dateKey, hit }) {
    if (progress.lastEvaluatedKey && dateKey <= progress.lastEvaluatedKey) {
      return progress;
    }

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
