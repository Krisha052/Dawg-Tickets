require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
    if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo connected");

    app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
  } catch (e) {
    console.error("❌ Failed to start:", e);
    process.exit(1);
  }
}

start();







