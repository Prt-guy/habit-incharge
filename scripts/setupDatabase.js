/**
 * Provisions the Appwrite backend for Life Companion AI.
 *
 *   npm run setup:appwrite
 *
 * Creates (or completes) the database, all 11 collections, every attribute,
 * every index, and the collection permissions — reading it all from
 * src/appwrite/schema.js, the single source of truth.
 *
 * Idempotent. Anything that already exists is left alone, so it is safe to
 * re-run after editing the schema; only what is missing gets added.
 *
 * Needs APPWRITE_API_KEY in .env — a server key with the `databases.*` scopes.
 * The name deliberately has NO `VITE_` prefix: Vite bundles every VITE_* var
 * into the browser, so a VITE_APPWRITE_API_KEY would publish your server key
 * to every visitor in plaintext.
 *
 * Related:
 *   npm run schema           print a checklist to build this by hand instead
 *   npm run verify:appwrite  audit the live project against the schema
 */
import "dotenv/config";
import { Client, Databases, Permission, Role } from "node-appwrite";
import { SCHEMA, COLLECTION_PERMISSIONS } from "../src/appwrite/schema.js";

const {
  VITE_APPWRITE_ENDPOINT: ENDPOINT = "https://cloud.appwrite.io/v1",
  VITE_APPWRITE_PROJECT_ID: PROJECT_ID,
  VITE_APPWRITE_DATABASE_ID: DATABASE_ID = "life_companion",
  APPWRITE_API_KEY: API_KEY,
} = process.env;

if (!PROJECT_ID || !API_KEY) {
  console.error(
    "Missing VITE_APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env\n\n" +
      "APPWRITE_API_KEY must NOT have a VITE_ prefix — Vite bundles VITE_* vars\n" +
      "into the browser, which would publish your server key.\n\n" +
      "To provision by hand in the console instead, run: npm run schema"
  );
  process.exit(1);
}

const databases = new Databases(
  new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
);

const permissions = COLLECTION_PERMISSIONS.actions.map((action) =>
  Permission[action](Role[COLLECTION_PERMISSIONS.role]())
);

/** Run `fn`, treating "already exists" (409) as success rather than an error. */
async function step(label, fn) {
  try {
    await fn();
    console.log(`  + ${label}`);
  } catch (err) {
    if (err?.code === 409) {
      console.log(`  · ${label} (exists)`);
      return;
    }
    throw err;
  }
}

/**
 * Create the database only if it isn't already there. We probe with get()
 * rather than relying on a 409, because on the free plan (one database max)
 * a redundant create() fails with a plan-limit error instead.
 */
async function ensureDatabase() {
  try {
    await databases.get({ databaseId: DATABASE_ID });
    console.log(`  · database ${DATABASE_ID} (exists)`);
    return;
  } catch (err) {
    if (err?.code !== 404) throw err;
  }
  await databases.create({ databaseId: DATABASE_ID, name: "Life Companion" });
  console.log(`  + database ${DATABASE_ID}`);
}

/**
 * Create the collection, or — if it already exists — re-assert its permissions.
 * That second half matters: a collection created without permissions rejects
 * every request from the app with a 401, and creating it again just 409s.
 */
async function ensureCollection(col) {
  const shape = {
    databaseId: DATABASE_ID,
    collectionId: col.id,
    name: col.name,
    permissions,
    documentSecurity: COLLECTION_PERMISSIONS.documentSecurity,
  };

  try {
    await databases.createCollection(shape);
    console.log(`  + collection ${col.id}`);
  } catch (err) {
    if (err?.code !== 409) throw err;
    await databases.updateCollection(shape);
    console.log(`  · collection ${col.id} (exists — permissions re-applied)`);
  }
}

function createAttribute(collectionId, attr) {
  const base = {
    databaseId: DATABASE_ID,
    collectionId,
    key: attr.key,
    required: attr.required,
  };
  // Appwrite rejects a default value on a required attribute.
  const xdefault = attr.required ? undefined : attr.xdefault ?? undefined;

  switch (attr.type) {
    case "string":
      return databases.createStringAttribute({ ...base, size: attr.size, xdefault });
    case "integer":
      return databases.createIntegerAttribute({ ...base, xdefault });
    case "float":
      return databases.createFloatAttribute({ ...base, xdefault });
    case "boolean":
      return databases.createBooleanAttribute({ ...base, xdefault });
    default:
      throw new Error(`Unknown attribute type: ${attr.type}`);
  }
}

/**
 * Delete collections that exist in Appwrite but are no longer in the schema.
 * Destructive, so it only runs behind an explicit --prune flag.
 */
async function prune() {
  const keep = new Set(SCHEMA.map((c) => c.id));
  const { collections } = await databases.listCollections({ databaseId: DATABASE_ID });
  const stale = collections.filter((c) => !keep.has(c.$id));

  if (!stale.length) {
    console.log("\nNothing to prune — no collections outside the schema.");
    return;
  }

  console.log(`\nPruning ${stale.length} collection(s) not in the schema:`);
  for (const c of stale) {
    await databases.deleteCollection({ databaseId: DATABASE_ID, collectionId: c.$id });
    console.log(`  - deleted ${c.$id}`);
  }
}

async function main() {
  console.log(`\nProvisioning "${DATABASE_ID}" on ${ENDPOINT}\n`);

  await ensureDatabase();

  for (const col of SCHEMA) {
    console.log(`\n${col.id}`);

    await ensureCollection(col);

    for (const attr of col.attributes) {
      await step(`${col.id}.${attr.key} (${attr.type})`, () =>
        createAttribute(col.id, attr)
      );
    }

    // Appwrite builds attributes asynchronously, and an index over a
    // still-processing attribute fails — let them settle before indexing.
    await new Promise((r) => setTimeout(r, 2000));

    for (const idx of col.indexes) {
      await step(`${col.id} index ${idx.key}`, () =>
        databases.createIndex({
          databaseId: DATABASE_ID,
          collectionId: col.id,
          key: idx.key,
          type: "key",
          attributes: idx.attributes,
        })
      );
    }
  }

  if (process.argv.includes("--prune")) {
    await prune();
  } else {
    const keep = new Set(SCHEMA.map((c) => c.id));
    const { collections } = await databases.listCollections({ databaseId: DATABASE_ID });
    const stale = collections.filter((c) => !keep.has(c.$id));
    if (stale.length) {
      console.log(
        `\n${stale.length} collection(s) exist that are no longer in the schema:\n` +
          `  ${stale.map((c) => c.$id).join(", ")}\n` +
          `They are harmless but dead. To delete them: npm run setup:appwrite -- --prune`
      );
    }
  }

  console.log("\nDone. Verify with: npm run verify:appwrite\n");
}

main().catch((err) => {
  console.error("\nProvisioning failed:", err?.message || err);
  process.exit(1);
});
