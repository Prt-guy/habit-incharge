/**
 * Central Appwrite configuration, read from env with sensible fallbacks so the
 * collection names double as documentation.
 *
 * Every key below is referenced as an explicit `import.meta.env.VITE_*` literal
 * — never `const env = import.meta.env`. That distinction matters: aliasing the
 * whole object forces Vite to inline ALL VITE_-prefixed vars into the bundle,
 * including any that were never meant for the browser. Referencing each key by
 * name means only these values ship. Keep it that way.
 */

export const APPWRITE = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || "",
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "life_companion",
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || "uploads",
};

/**
 * This is a single-user app with no sign-in. Every document is written with
 * this constant as its `ownerId`, and every query filters on it.
 *
 * Keeping the field (rather than dropping it) means the schema, indexes, and
 * service queries stay unchanged if a second user is ever added — at that point
 * this becomes a real user ID and the collections get locked down again.
 */
export const OWNER_ID = import.meta.env.VITE_OWNER_ID || "solo";

/** Display name used when the profile is first created. */
export const OWNER_NAME = import.meta.env.VITE_OWNER_NAME || "Friend";

/**
 * Collection ids, keyed by their own canonical id (the one in
 * `src/appwrite/schema.js`). Services address collections by that same id, so
 * there is no alias layer to fall out of sync — a typo becomes a loud throw in
 * `db.js` rather than an `undefined` collectionId.
 */
export const COLLECTIONS = {
  days: "days",
  rewards: "rewards",
  progress: "progress",
};
