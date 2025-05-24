import BetterSqlite3 from 'better-sqlite3';

// Initialize the SQLite database
const sqlite = new BetterSqlite3('database.sqlite');

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER NOT NULL PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
  );
`);

// Database wrapper with simplified query methods
export const db = {
  /**
   * Execute a SQL statement with parameters
   * @param {string} sql - SQL statement to execute
   * @param {...any} params - Parameters for the SQL statement
   * @returns {object} - Statement result
   */
  execute(sql: string, ...params: any[]): BetterSqlite3.RunResult {
    const stmt = sqlite.prepare(sql);
    return stmt.run(...params);
  },

  /**
   * Query a single row from the database
   * @param {string} sql - SQL query
   * @param {...any} params - Parameters for the SQL query
   * @returns {any|null} - Row data or null if not found
   */
  queryOne(sql: string, ...params: any[]): any {
    const stmt = sqlite.prepare(sql);
    const row = stmt.get(...params);
    return row || null;
  },

  /**
   * Query multiple rows from the database
   * @param {string} sql - SQL query
   * @param {...any} params - Parameters for the SQL query
   * @returns {any[]} - Array of rows
   */
  queryAll(sql: string, ...params: any[]): any[] {
    const stmt = sqlite.prepare(sql);
    return stmt.all(...params);
  }
};
