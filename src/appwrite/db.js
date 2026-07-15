import { databases, ID, Query } from "./client";
import { APPWRITE, COLLECTIONS } from "./config";

const DB = APPWRITE.databaseId;

// Single-user app: there is no signed-in identity to scope documents to, so
// access is governed entirely by the collection-level permissions set in
// scripts/setupDatabase.js. Documents carry no permissions of their own.

/**
 * Resolve a collection key to its Appwrite id.
 *
 * Throws on an unknown key rather than returning undefined — otherwise the bad
 * value is passed straight through to the SDK, which reports it as the far less
 * helpful `Missing required parameter: "collectionId"`.
 */
function collectionId(key) {
  const id = COLLECTIONS[key];
  if (!id) {
    throw new Error(
      `Unknown collection "${key}". Valid keys: ${Object.keys(COLLECTIONS).join(", ")}`
    );
  }
  return id;
}

/**
 * Thin CRUD wrapper over Appwrite Databases (SDK v26 object-style params).
 * `collectionKey` is a key of COLLECTIONS — i.e. the collection's own id.
 */
export const db = {
  async list(collectionKey, queries = []) {
    const res = await databases.listDocuments({
      databaseId: DB,
      collectionId: collectionId(collectionKey),
      queries,
    });
    return res.documents;
  },

  async listPage(collectionKey, queries = []) {
    return databases.listDocuments({
      databaseId: DB,
      collectionId: collectionId(collectionKey),
      queries,
    });
  },

  async get(collectionKey, id) {
    return databases.getDocument({
      databaseId: DB,
      collectionId: collectionId(collectionKey),
      documentId: id,
    });
  },

  async create(collectionKey, data, id = ID.unique()) {
    return databases.createDocument({
      databaseId: DB,
      collectionId: collectionId(collectionKey),
      documentId: id,
      data,
    });
  },

  async update(collectionKey, id, data) {
    return databases.updateDocument({
      databaseId: DB,
      collectionId: collectionId(collectionKey),
      documentId: id,
      data,
    });
  },

  async remove(collectionKey, id) {
    return databases.deleteDocument({
      databaseId: DB,
      collectionId: collectionId(collectionKey),
      documentId: id,
    });
  },
};

export { Query };

/** JSON helpers for attributes stored as strings. */
export function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function toJson(value) {
  return JSON.stringify(value ?? null);
}
