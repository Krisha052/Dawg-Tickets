import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const options = {};

let theClient;
let theClientPromise;

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    theClient = new MongoClient(uri, options);
    global._mongoClientPromise = theClient.connect();
  }
  theClientPromise = global._mongoClientPromise;
} else {
  theClient = new MongoClient(uri, options);
  theClientPromise = theClient.connect();
}

export default theClientPromise;
