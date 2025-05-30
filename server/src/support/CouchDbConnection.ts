import nano from "nano";
import { ZISK_COUCHDB_ADMIN_PASS, ZISK_COUCHDB_ADMIN_USER, ZISK_COUCHDB_URL } from "./env";

/**
 * Singleton class for managing CouchDB connection
 */
export default class CouchDbConnection {
  private static instance: CouchDbConnection;
  private _couch: nano.ServerScope;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this._couch = nano(`http://${ZISK_COUCHDB_ADMIN_USER}:${ZISK_COUCHDB_ADMIN_PASS}@${ZISK_COUCHDB_URL.split('//')[1]}`);
  }

  /**
   * Get the singleton instance of CouchDbConnection
   * @returns The singleton instance
   */
  public static getInstance(): CouchDbConnection {
    if (!CouchDbConnection.instance) {
      CouchDbConnection.instance = new CouchDbConnection();
    }
    return CouchDbConnection.instance;
  }

  /**
   * Get the CouchDB connection
   * @returns The nano ServerScope instance
   */
  public get couch(): nano.ServerScope {
    return this._couch;
  }
}
