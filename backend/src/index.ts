import mongoose from "mongoose";
import app from "./app";
import { env } from "./env";

const port = env.PORT;
const MONGODB_URI = env.MONGODB_URI || "mongodb://localhost:27017/mydb";

console.log("MongoDB URI:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    
    const server = app.listen(port, () => {
      /* eslint-disable no-console */
      console.log(`Listening: http://localhost:${port}`);
      /* eslint-enable no-console */
    });

    server.on("error", (err) => {
      if ("code" in err && err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Please choose another port or stop the process using it.`);
      } else {
        console.error("Failed to start server:", err);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
});
