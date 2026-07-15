/**
 * Wipes all documents from days / rewards / progress — a clean slate.
 * Collections, attributes, and indexes are left intact; only rows are deleted.
 *
 *   node scripts/reset-data.mjs          # asks for confirmation
 *   node scripts/reset-data.mjs --yes    # skips the prompt
 *
 * Needs APPWRITE_API_KEY in .env (a server key with databases.* scopes).
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Client, Databases, Query } from "node-appwrite";

const {
  VITE_APPWRITE_ENDPOINT: ENDPOINT = "https://cloud.appwrite.io/v1",
  VITE_APPWRITE_PROJECT_ID: PROJECT_ID,
  VITE_APPWRITE_DATABASE_ID: DATABASE_ID = "life_companion",
  APPWRITE_API_KEY: API_KEY,
} = process.env;

if (!PROJECT_ID || !API_KEY) {
  console.error("Missing VITE_APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env");
  process.exit(1);
}

const databases = new Databases(
  new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
);

const COLLECTIONS = ["days", "rewards", "progress"];

async function clearCollection(id) {
  let deleted = 0;
  // Delete in pages until the collection is empty.
  for (;;) {
    const { documents } = await databases.listDocuments({
      databaseId: DATABASE_ID,
      collectionId: id,
      queries: [Query.limit(100)],
    });
    if (documents.length === 0) break;
    for (const doc of documents) {
      await databases.deleteDocument({
        databaseId: DATABASE_ID,
        collectionId: id,
        documentId: doc.$id,
      });
      deleted++;
    }
  }
  console.log(`  ${id}: deleted ${deleted}`);
}

async function main() {
  if (!process.argv.includes("--yes")) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `This deletes ALL documents in ${COLLECTIONS.join(", ")} on "${DATABASE_ID}". Type "reset" to confirm: `
    );
    rl.close();
    if (answer.trim() !== "reset") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  console.log(`\nWiping data on "${DATABASE_ID}"…`);
  for (const id of COLLECTIONS) await clearCollection(id);
  console.log("\nDone. The app will rebuild today's document fresh on next load.\n");
}

main().catch((err) => {
  console.error("\nReset failed:", err?.message || err);
  process.exit(1);
});
