const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  category: { 
    type: String, 
    required: true 
  },

  event: { 
    type: String, 
    required: true 
  },

  seat: { 
    type: String, 
    required: true 
  },

  ticketNumber: { 
    type: String, 
    required: true 
  },

  preferredTrade: { 
    type: String, 
    default: null 
  },

  status: { 
    type: String, 
    enum: ['open', 'pending', 'completed'], 
    default: 'open' 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Listing', ListingSchema);

