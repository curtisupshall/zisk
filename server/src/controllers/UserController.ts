import Controller from "../support/Controller";
import { CouchDBUserDocument } from "../support/types";

export default class UserController extends Controller {
  /**
   * Retrieves a user document by username from the _users database
   * 
   * @param name The username to look up
   * @returns The user document if found, or null if not found
   */
  public async getUserByName(name: string): Promise<CouchDBUserDocument | null> {
    try {
      const userId = `org.couchdb.user:${name}`;
      const user = await this.couch.db.use('_users').get(userId) as CouchDBUserDocument;
      return user;
    } catch (error) {
      if ((error as any).statusCode === 404) {
        return null;
      }
      throw error;
    }
  }
}
