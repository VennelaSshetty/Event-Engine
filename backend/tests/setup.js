import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import connection from "../src/config/redis.js";

let mongoServer;


beforeAll(async () => {

  mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1
    }
  });


  const uri = mongoServer.getUri();


  await mongoose.connect(uri);

});


afterEach(async () => {

  const collections = mongoose.connection.collections;


  for (const key of Object.keys(collections)) {

    await collections[key].deleteMany({});

  }

});


afterAll(async () => {

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  await connection.quit();

  if (mongoServer) {
    await mongoServer.stop();
  }

});