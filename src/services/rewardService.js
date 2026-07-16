import { db, Query } from "../appwrite/db";
import { OWNER_ID } from "../appwrite/config";
import { readCache, writeCache } from "../utils/cache";

export const rewardService = {
  async list(limit = 60) {
    return db.list("rewards", [
      Query.equal("ownerId", OWNER_ID),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);
  },

  /**
   * The Rewards list, cache-first. The reward log only grows through create()
   * below (single owner, no external edits), and create() writes through to
   * this cache — so once it's warm we never hit the network again. That's the
   * "fetch only when state changes" contract: earning a reward is the change.
   */
  async listCached(limit = 80) {
    const cached = readCache("rewards");
    if (cached) return cached;
    const rows = await this.list(limit);
    writeCache("rewards", rows);
    return rows;
  },

  /** Titles of recent rewards — fed back to the AI so it never repeats one. */
  async recentTitles(limit = 20) {
    const rows = await this.list(limit);
    return rows.map((r) => r.title).filter(Boolean);
  },

  async create({ dateKey, taskTitle, weight, tier, title, body }) {
    const doc = await db.create("rewards", {
      ownerId: OWNER_ID,
      dateKey,
      taskTitle,
      weight,
      tier,
      title,
      body,
      createdAt: new Date().toISOString(),
    });

    // Keep the cached list current in place, so Rewards never has to refetch.
    const cached = readCache("rewards");
    if (cached) writeCache("rewards", [doc, ...cached]);

    return doc;
  },
};
