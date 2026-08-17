import mysql from "mysql2/promise";

// The one MySQL connection pool for the whole app — lib/db.ts and
// lib/translate.ts both import getPool() from here instead of each
// creating their own (that used to be the bug: two pools meant twice
// the connections).
//
// Cached on globalThis, not just a module-level variable, because
// Next.js's dev-mode hot-reload re-evaluates server modules on file
// changes without tearing down old connections — a plain `let pool`
// gets a fresh pool (and a fresh set of open connections) on every
// edit, which is the classic way to hit MySQL's "Too many connections"
// in dev. Stashing it on globalThis survives that re-evaluation.
const globalForPool = globalThis as unknown as { __dbPool?: mysql.Pool };

export function getPool(): mysql.Pool {
  if (!globalForPool.__dbPool) {
    globalForPool.__dbPool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "furniture_app",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "furniture",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return globalForPool.__dbPool;
}
