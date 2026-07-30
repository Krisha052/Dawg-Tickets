const { MongoMemoryServer } = require("mongodb-memory-server");
(async () => {
  const mongod = await MongoMemoryServer.create({ instance: { port: 27117 } });
  console.log("MONGO_URI=" + mongod.getUri());
})();
