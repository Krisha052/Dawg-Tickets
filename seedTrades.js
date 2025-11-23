const mongoose = require("mongoose");
require("dotenv").config();

const Trade = require("./models/Trade");
const Listing = require("./models/Listing");
const User = require("./models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne(); 
    const listings = await Listing.find();

    if (!user || listings.length < 2) {
      console.log("❌ Need at least 1 user and 2 listings.");
      process.exit();
    }

    await Trade.deleteMany({});
    console.log("Old trades removed.");

    const tradeData = [
      {
        offerListing: listings[0]._id,
        requestListing: listings[1]._id,
        seller: user._id,
        buyer: user._id,
        category: "UGA Football",
        status: "pending"
      }
    ];

    await Trade.insertMany(tradeData);

    console.log("🎉 Sample trades inserted!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

seed();

