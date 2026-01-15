import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";

// Use SQLite database file in the root directory
const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "rfp.db");

// Create or open the SQLite database
const sqlite = new Database(dbPath);

// Enable foreign keys for SQLite
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Optional: Log database info
console.log(`[DB] Connected to SQLite database at: ${dbPath}`);

