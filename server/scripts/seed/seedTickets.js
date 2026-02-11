require('dotenv').config();
const mongoose = require('mongoose');
const ValidTicket = require('./models/ValidTicket');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

const tickets = [
  { ticketNumber: "FB-001", category: "UGA Football", event: "FB: Georgia v. Marshall", seat: "Section 101, Row 5, Seat 12" },
  { ticketNumber: "FB-002", category: "UGA Football", event: "FB: Georgia v. Alabama", seat: "Section 103, Row 9, Seat 7" },
  { ticketNumber: "FB-003", category: "UGA Football", event: "FB: Georgia v. Tech", seat: "Section 110, Row 3, Seat 20" },

  { ticketNumber: "BB-101", category: "UGA Basketball", event: "MBB: Georgia v. Kentucky", seat: "Section A, Row 2, Seat 4" },
  { ticketNumber: "BB-102", category: "UGA Basketball", event: "MBB: Georgia v. Auburn", seat: "Section B, Row 1, Seat 2" },
  { ticketNumber: "BB-103", category: "UGA Basketball", event: "MBB: Georgia v. Tennessee", seat: "Section C, Row 7, Seat 11" },

  { ticketNumber: "BSB-201", category: "UGA Baseball", event: "BSB: Georgia v. Florida", seat: "Section Diamond, Row 4, Seat 3" },
  { ticketNumber: "BSB-202", category: "UGA Baseball", event: "BSB: Georgia v. Auburn", seat: "Section Diamond, Row 1, Seat 10" },

  { ticketNumber: "GYM-301", category: "UGA Gymnastics", event: "Gym: Georgia v. Alabama", seat: "Section Floor, Row 2, Seat 8" }
];

async function seedTickets() {
  await connectDB();

  try {
    await ValidTicket.deleteMany();
    console.log("Old valid tickets removed.");

    await ValidTicket.insertMany(
      tickets.map((t) => ({ ...t, isUsed: false }))
    );

    console.log("🎉 Seed data inserted successfully!");
  } catch (err) {
    console.error("Error inserting seed data:", err);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seedTickets();

