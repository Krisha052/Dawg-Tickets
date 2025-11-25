const mongoose = require('mongoose');
const crypto = require('crypto');

const TradeSchema = new mongoose.Schema({
  tradeId:   { type: String, unique: true, required: true },

  offerListing:  { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }, 
  requestListing:{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },

  seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  category: { type: String, required: true },

  status:   { type: String, enum:['pending','accepted','declined'], default:'pending' },

  createdAt:{ type: Date, default: Date.now }
});

// create readable trade ID
TradeSchema.pre('validate', function(next) {
  if (!this.tradeId) {
    this.tradeId = 'TRD-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Trade', TradeSchema);

