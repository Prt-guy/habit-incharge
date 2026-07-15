import { db, Query } from "../appwrite/db";
import { OWNER_ID } from "../appwrite/config";

export const rewardService = {
  async list(limit = 60) {
    return db.list("rewards", [
      Query.equal("ownerId", OWNER_ID),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);
  },

  /** Titles of recent rewards — fed back to the AI so it never repeats one. */
  async recentTitles(limit = 20) {
    const rows = await this.list(limit);
    return rows.map((r) => r.title).filter(Boolean);
  },

  async create({ dateKey, taskTitle, weight, tier, title, body }) {
    return db.create("rewards", {
      ownerId: OWNER_ID,
      dateKey,
      taskTitle,
      weight,
      tier,
      title,
      body,
      createdAt: new Date().toISOString(),
    });
  },
};
