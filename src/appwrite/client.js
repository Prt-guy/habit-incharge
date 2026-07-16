import { Client, Databases, Storage, ID, Query } from "appwrite";
import { APPWRITE } from "./config";

/**
 * Appwrite's `setEndpoint` THROWS on a malformed URL, and this runs at module
 * import — so a bad `VITE_APPWRITE_ENDPOINT` in the deploy env (e.g. missing
 * `https://`, or a leftover placeholder) crashes the whole bundle before React
 * mounts and the page renders blank. Validate here and fall back to the default
 * so a misconfigured env degrades to a visible error, never a white screen.
 */
const DEFAULT_ENDPOINT = "https://cloud.appwrite.io/v1";
function safeEndpoint(url) {
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return url;
  } catch {
    /* not a valid absolute URL — fall through */
  }
  console.error(
    `[appwrite] Invalid VITE_APPWRITE_ENDPOINT: ${JSON.stringify(url)}. ` +
      `It must be a full URL like ${DEFAULT_ENDPOINT}. Using the default instead.`
  );
  return DEFAULT_ENDPOINT;
}

// Single-user app: no Account service, no sessions. Requests are authorized by
// the project ID alone, against collections that permit Role.any().
const client = new Client()
  .setEndpoint(safeEndpoint(APPWRITE.endpoint))
  .setProject(APPWRITE.projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);

export { client, ID, Query };
