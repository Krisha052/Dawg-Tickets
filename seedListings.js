const mongoose = require("mongoose");
require("dotenv").config();

const Listing = require("./models/Listing");
const User = require("./models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne(); 

    if (!user) {
      console.log("❌ No users found. You must create an account first.");
      process.exit();
    }

    await Listing.deleteMany({});
    console.log("Old listings removed.");

    const sample = [
      {
        seller: user._id,
        category: "UGA Football",
        event: "FB: Georgia v. Marshall",
        seat: "A12",
        preferredTrade: "FB: Georgia v. Alabama",
        ticketNumber: "FBM-001",
        status: "open"
      },
      {
        seller: user._id,
        category: "UGA Football",
        event: "FB: Georgia v. Alabama",
        seat: "B17",
        preferredTrade: "FB: Georgia v. Tech",
        ticketNumber: "FBA-002",
        status: "open"
      }
    ];

    await Listing.insertMany(sample);

    console.log("🎉 Sample listings inserted!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
}

seed();

