const mongoose = require('mongoose');

const ValidTicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },

  // Official, admin-certified information
  category: { type: String, required: true },
  event: { type: String, required: true },
  seat: { type: String, required: true },

  // Whether this ticket was already used in a listing
  isUsed: { type: Boolean, default: false }
});

module.exports = mongoose.model('ValidTicket', ValidTicketSchema);

