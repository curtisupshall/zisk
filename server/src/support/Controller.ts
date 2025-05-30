import nano from "nano";
import CouchDbConnection from "./CouchDbConnection";

export default class Controller {
  protected get couch(): nano.ServerScope {
    return CouchDbConnection.getInstance().couch;
  }
}
