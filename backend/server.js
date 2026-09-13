import app from "./app.js";

import config from "./src/config/env.js";
import connectDB from "./src/config/db.js";

await connectDB();

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});