/**
 * Audits the live Appwrite project against src/appwrite/schema.js.
 *
 *   npm run verify:appwrite
 *
 * Reports, per collection: missing/extra attributes, type or size mismatches,
 * missing indexes, and wrong permissions. Read-only — it changes nothing.
 * Run it after provisioning, or any time the app starts erroring on writes.
 */
import "dotenv/config";
import { Client, Databases } from "node-appwrite";
import { SCHEMA, COLLECTION_PERMISSIONS } from "../src/appwrite/schema.js";

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

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

/** Map our schema types onto the type names Appwrite reports back. */
const TYPE = { string: "string", integer: "integer", float: "double", boolean: "boolean" };

let problems = 0;

function fail(msg) {
  problems++;
  console.log(`    ${RED}✗${RESET} ${msg}`);
}

async function auditCollection(col) {
  console.log(`\n${BOLD}${col.id}${RESET}`);

  let live;
  try {
    live = await databases.getCollection({
      databaseId: DATABASE_ID,
      collectionId: col.id,
    });
  } catch (err) {
    if (err?.code === 404) {
      fail(`collection is MISSING`);
      return;
    }
    throw err;
  }

  // --- permissions ---
  const want = COLLECTION_PERMISSIONS.actions
    .map((a) => `${a}("${COLLECTION_PERMISSIONS.role}")`)
    .sort();
  const got = [...(live.$permissions || [])].sort();
  const missingPerms = want.filter((p) => !got.includes(p));
  if (missingPerms.length) {
    fail(`permissions missing: ${missingPerms.join(", ")}  (app will get 401)`);
  }
  if (live.documentSecurity !== COLLECTION_PERMISSIONS.documentSecurity) {
    fail(`documentSecurity is ${live.documentSecurity}, expected ${COLLECTION_PERMISSIONS.documentSecurity}`);
  }

  // --- attributes ---
  const liveAttrs = new Map((live.attributes || []).map((a) => [a.key, a]));

  for (const want of col.attributes) {
    const got = liveAttrs.get(want.key);
    if (!got) {
      fail(`attribute MISSING: ${want.key} (${want.type})`);
      continue;
    }
    if (got.status !== "available") {
      fail(`attribute ${want.key} status=${got.status} (still building or failed)`);
    }
    if (got.type !== TYPE[want.type]) {
      fail(`attribute ${want.key} is ${got.type}, expected ${TYPE[want.type]}`);
    }
    if (want.type === "string" && got.size !== want.size) {
      fail(`attribute ${want.key} size=${got.size}, expected ${want.size}` +
        (want.size === 65535 ? ` ${YELLOW}(long text will be truncated!)${RESET}` : ""));
    }
    if (Boolean(got.required) !== Boolean(want.required)) {
      fail(
        `attribute ${want.key} required=${got.required}, expected ${want.required}` +
          (got.required ? ` ${YELLOW}(writes will fail on null)${RESET}` : "")
      );
    }
    liveAttrs.delete(want.key);
  }

  for (const [key] of liveAttrs) {
    console.log(`    ${DIM}· extra attribute in Appwrite (harmless): ${key}${RESET}`);
  }

  // --- indexes ---
  const liveIdx = new Map((live.indexes || []).map((i) => [i.key, i]));
  for (const want of col.indexes) {
    const got = liveIdx.get(want.key);
    if (!got) {
      fail(`index MISSING: ${want.key} → ${want.attributes.join(", ")}  (queries will fail)`);
      continue;
    }
    const same =
      got.attributes.length === want.attributes.length &&
      got.attributes.every((a, i) => a === want.attributes[i]);
    if (!same) {
      fail(`index ${want.key} covers [${got.attributes}], expected [${want.attributes}]`);
    }
  }

}

console.log(`\nAuditing "${DATABASE_ID}" against src/appwrite/schema.js`);

let before = 0;
for (const col of SCHEMA) {
  before = problems;
  await auditCollection(col);
  if (problems === before) {
    console.log(
      `    ${GREEN}✓${RESET} ${DIM}${col.attributes.length} attributes, ${col.indexes.length} indexes, permissions ok${RESET}`
    );
  }
}

if (problems) {
  console.log(`\n${RED}${BOLD}${problems} problem(s) found.${RESET} Run: npm run setup:appwrite\n`);
  process.exit(1);
}
console.log(`\n${GREEN}${BOLD}All good.${RESET} Every collection matches the schema.\n`);
