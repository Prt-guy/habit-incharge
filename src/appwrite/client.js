import { Client, Databases, Storage, ID, Query } from "appwrite";
import { APPWRITE } from "./config";

// Single-user app: no Account service, no sessions. Requests are authorized by
// the project ID alone, against collections that permit Role.any().
const client = new Client()
  .setEndpoint(APPWRITE.endpoint)
  .setProject(APPWRITE.projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);

export { client, ID, Query };
