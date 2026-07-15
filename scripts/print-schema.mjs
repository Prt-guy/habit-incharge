/**
 * Prints a console-ready build checklist from src/appwrite/schema.js.
 *
 *   npm run schema          # human-readable checklist, for clicking through the Appwrite console
 *   npm run schema -- --md  # markdown tables, for pasting into docs
 *
 * Generated from the same schema the provisioning script uses, so it can never
 * drift from what the app actually expects.
 */
import { SCHEMA, COLLECTION_PERMISSIONS } from "../src/appwrite/schema.js";

const asMarkdown = process.argv.includes("--md");

/** Human-readable type + size, as the Appwrite console labels them. */
function typeLabel(attr) {
  switch (attr.type) {
    case "string":
      return `String(${attr.size})`;
    case "integer":
      return "Integer";
    case "float":
      return "Float";
    case "boolean":
      return "Boolean";
    default:
      return attr.type;
  }
}

function defaultLabel(attr) {
  if (attr.required) return "—";
  if (attr.xdefault === null || attr.xdefault === undefined) return "—";
  return String(attr.xdefault);
}

const totals = SCHEMA.reduce(
  (acc, c) => ({
    collections: acc.collections + 1,
    attributes: acc.attributes + c.attributes.length,
    indexes: acc.indexes + c.indexes.length,
  }),
  { collections: 0, attributes: 0, indexes: 0 }
);

if (asMarkdown) {
  console.log("# Appwrite build checklist\n");
  console.log(
    `${totals.collections} collections · ${totals.attributes} attributes · ${totals.indexes} indexes\n`
  );
  for (const col of SCHEMA) {
    console.log(`## \`${col.id}\`\n`);
    console.log(`${col.purpose}\n`);
    console.log("| Attribute | Type | Required | Default | Notes |");
    console.log("| --- | --- | --- | --- | --- |");
    for (const a of col.attributes) {
      console.log(
        `| \`${a.key}\` | ${typeLabel(a)} | ${a.required ? "**yes**" : "no"} | ${defaultLabel(a)} | ${a.note || ""} |`
      );
    }
    console.log("\n**Indexes** (type: key)\n");
    for (const i of col.indexes) {
      console.log(`- \`${i.key}\` → ${i.attributes.map((x) => `\`${x}\``).join(", ")}`);
    }
    console.log("");
  }
  process.exit(0);
}

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

console.log(`\n${BOLD}Appwrite build checklist${RESET}`);
console.log(
  `${DIM}${totals.collections} collections · ${totals.attributes} attributes · ${totals.indexes} indexes${RESET}\n`
);

console.log(`${YELLOW}Read this first${RESET}`);
console.log("  1. Create a database whose ID matches VITE_APPWRITE_DATABASE_ID (default: life_companion).");
console.log("  2. Create each collection below using the EXACT id shown — the app looks them up by id.");
console.log(
  `  3. On every collection set Permissions → role ${BOLD}${COLLECTION_PERMISSIONS.role}${RESET} with ` +
    `${COLLECTION_PERMISSIONS.actions.join(", ")}, and leave Document Security ${BOLD}off${RESET}.`
);
console.log(`  4. ${BOLD}Only ownerId is Required.${RESET} Leave every other attribute optional — the app`);
console.log("     writes nulls for blank fields, and Appwrite rejects null on a required attribute.");
console.log("  5. Watch the String sizes. Long fields are 65535; a 255 cap silently truncates.");
console.log("  6. Indexes are not optional — Appwrite refuses to query an unindexed attribute.\n");

for (const col of SCHEMA) {
  console.log(`${CYAN}${BOLD}${col.id}${RESET}`);
  console.log(`${DIM}${col.purpose}${RESET}`);

  const pad = Math.max(...col.attributes.map((a) => a.key.length));
  const typePad = Math.max(...col.attributes.map((a) => typeLabel(a).length));

  for (const a of col.attributes) {
    const req = a.required ? `${YELLOW}required${RESET}` : `${DIM}optional${RESET}`;
    const def = defaultLabel(a);
    const defStr = def === "—" ? "" : `${DIM} default=${def}${RESET}`;
    const note = a.note ? `${DIM}  ${a.note}${RESET}` : "";
    console.log(
      `  ${a.key.padEnd(pad)}  ${typeLabel(a).padEnd(typePad)}  ${req}${defStr}${note}`
    );
  }

  console.log(`  ${DIM}indexes (type: key):${RESET}`);
  for (const i of col.indexes) {
    console.log(`    ${i.key.padEnd(pad)}  ${DIM}→${RESET} ${i.attributes.join(", ")}`);
  }
  console.log("");
}
