/**
 * THE schema — the single source of truth.
 *
 * Read by:
 *   npm run setup:appwrite   provisions Appwrite from it
 *   npm run verify:appwrite  audits the live project against it
 *   npm run schema           prints a build checklist from it
 *
 * The app is deliberately small: one document per day holding that day's
 * tasks, a running progress document, and a log of rewards earned.
 *
 * Conventions:
 *   - `ownerId` is the ONLY required attribute. The app writes partial
 *     documents, and Appwrite rejects null on a required attribute.
 *   - `dateKey` is a LOCAL "YYYY-MM-DD" string, so "today" means your today.
 *   - `*_json` fields hold JSON as text — Appwrite has no object type.
 */

const str = (key, size = 255, note = "") => ({ type: "string", key, size, required: false, note });
const text = (key, note = "") => ({ type: "string", key, size: 65535, required: false, note });
const int = (key, xdefault = null, note = "") => ({ type: "integer", key, required: false, xdefault, note });

const owner = {
  type: "string",
  key: "ownerId",
  size: 64,
  required: true,
  note: "REQUIRED — who this belongs to",
};

export const SCHEMA = [
  {
    id: "days",
    name: "Days",
    purpose:
      "One document per day. Holds the tasks the AI assigned, their completion state, and the AI's end-of-day verdict.",
    attributes: [
      owner,
      str("dateKey", 10, "one doc per day — the app upserts on this"),
      text("tasks_json", "[{ id, title, detail, weight 1-5, completed, completedAt, reward }]"),
      int("completedCount", 0, "how many of the day's tasks were finished"),
      int("totalCount", 0, "how many were assigned (normally 5)"),
      str("status", 16, "pending | done | missed — set when the day is evaluated"),
      text("verdict", "the AI's morning message about YESTERDAY: praise or guilt"),
      text("greeting", "the AI's line for TODAY, written when the tasks were generated"),
      str("createdAt", 32),
    ],
    indexes: [
      { key: "owner", attributes: ["ownerId"] },
      { key: "owner_day", attributes: ["ownerId", "dateKey"] },
      { key: "owner_status", attributes: ["ownerId", "status"] },
    ],
  },
  {
    id: "rewards",
    name: "Rewards",
    purpose:
      "Every reward the AI has handed out. Recent ones are fed back to it so it never repeats itself.",
    attributes: [
      owner,
      str("dateKey", 10),
      str("taskTitle", 255, "the task this was earned for"),
      int("weight", 1, "1-5 — how much the task was worth; drives reward size"),
      str("tier", 16, "small | solid | big | epic"),
      str("title", 255, "the reward's headline"),
      text("body", "the reward itself, built from what you like"),
      str("createdAt", 32),
    ],
    indexes: [
      { key: "owner", attributes: ["ownerId"] },
      { key: "owner_day", attributes: ["ownerId", "dateKey"] },
    ],
  },
  {
    id: "progress",
    name: "Progress",
    purpose:
      "A single running document. Streak, days done, days missed — what the motivation and the guilt are built on.",
    attributes: [
      owner,
      int("streak", 0, "consecutive days that hit the threshold"),
      int("longestStreak", 0),
      int("daysDone", 0),
      int("daysMissed", 0),
      int("tasksCompleted", 0, "lifetime"),
      str("lastEvaluatedKey", 10, "last day rolled up into the counters above"),
      str("createdAt", 32),
    ],
    indexes: [{ key: "owner", attributes: ["ownerId"] }],
  },
];

/** Collection permissions for this single-user, no-sign-in build. */
export const COLLECTION_PERMISSIONS = {
  role: "any",
  actions: ["create", "read", "update", "delete"],
  documentSecurity: false,
};
