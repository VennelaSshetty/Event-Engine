import connection from "../src/config/redis.js";

await connection.flushdb();

console.log("Redis cleaned");

process.exit();