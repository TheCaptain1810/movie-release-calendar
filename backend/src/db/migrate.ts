import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client";

// Applies any generated migrations in ./drizzle to the local SQLite file.
// Run `npm run db:generate` first if you've changed schema.ts.
migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied.");
