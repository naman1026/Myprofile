// src/lib/mongodb.ts
import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env');
}

let client: MongoClient | null = null;
let db: Db | null = null;

// Use a global variable to maintain a cached connection across hot reloads in development.
// This prevents connections from growing rapidly during API Route usage.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}


export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }
  const client = await clientPromise;
  db = client.db(dbName);
  return db;
}

export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const database = await getDb();
  return database.collection<T>(collectionName);
}

// Optional: Export the promise directly if needed elsewhere
export default clientPromise;
