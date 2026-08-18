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
    const pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "furniture_app",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "goldenwood",
      waitForConnections: true,
      // Kept modest on purpose: this app never needs many concurrent
      // connections, and a small limit caps how much damage an orphaned
      // dev-server process (e.g. a terminal window closed without
      // stopping `next dev` cleanly) can do to a shared connection
      // limit before it's noticed and cleaned up.
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 30_000,
    });
    globalForPool.__dbPool = pool;

    // Best-effort: release connections immediately on a clean shutdown
    // (e.g. Ctrl+C reaching the process) instead of leaving them open
    // until MySQL's own wait_timeout eventually reaps them. Doesn't
    // help with a process that's killed outright (common on Windows
    // when a terminal window is closed rather than stopped), but costs
    // nothing and helps the common case.
    process.once("SIGINT", () => void pool.end().catch(() => {}));
    process.once("SIGTERM", () => void pool.end().catch(() => {}));
  }
  return globalForPool.__dbPool;
}
