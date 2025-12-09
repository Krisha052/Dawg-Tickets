// routes/trades.js
const express = require('express');
const router = express.Router();

const Trade = require('../models/Trade');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

// ------------------------------------------------------------
// POST /api/trades
// Body:
//   { listingId }                        // current UI
// or { offerListingId, requestListingId } // future swap UI
// ------------------------------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { offerListingId, requestListingId, listingId } = req.body;

    let offerListing = null;
    let requestListing = null;

    if (offerListingId && requestListingId) {
      offerListing = await Listing.findById(offerListingId).populate('seller');
      requestListing = await Listing.findById(requestListingId).populate(
        'seller'
      );

      if (!offerListing || !requestListing) {
        return res
          .status(404)
          .json({ error: 'One or both listings not found' });
      }
    } else if (listingId) {
      requestListing = await Listing.findById(listingId).populate('seller');
      if (!requestListing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
    } else {
      return res.status(400).json({
        error:
          'Provide either { listingId } or { offerListingId, requestListingId }'
      });
    }

    const buyerId = req.user._id;
    const sellerId = requestListing.seller._id;

    if (buyerId.equals(sellerId)) {
      return res.status(400).json({ error: 'You cannot trade with yourself' });
    }

    const trade = await Trade.create({
      offerListing: offerListing ? offerListing._id : undefined,
      requestListing: requestListing._id,
      seller: sellerId,
      buyer: buyerId,
      category: requestListing.category
    });

    // mark requested listing as pending
    requestListing.status = 'pending';
    await requestListing.save();

    const populated = await Trade.findById(trade._id)
      .populate('offerListing')
      .populate('requestListing')
      .populate('buyer', 'username email')
      .populate('seller', 'username email');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating trade:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// GET /api/trades
// Trades involving the logged-in user
// ------------------------------------------------------------
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const trades = await Trade.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('offerListing')
      .populate('requestListing')
      .populate('buyer', 'username email')
      .populate('seller', 'username email');

    return res.json(trades);
  } catch (err) {
    console.error('Error fetching user trades:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// PATCH /api/trades/:id/status
// Body: { status: 'accepted' | 'declined' }
// Seller only
// ------------------------------------------------------------
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let trade = await Trade.findById(req.params.id)
      .populate('requestListing')
      .populate('offerListing');

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (!trade.seller.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    trade.status = status;
    await trade.save();

    if (trade.requestListing) {
      if (status === 'accepted') {
        trade.requestListing.status = 'completed';
      } else if (status === 'declined') {
        trade.requestListing.status = 'open';
      }
      await trade.requestListing.save();
    }

    trade = await Trade.findById(trade._id)
      .populate('offerListing')
      .populate('requestListing')
      .populate('buyer', 'username email')
      .populate('seller', 'username email');

    return res.json(trade);
  } catch (err) {
    console.error('Error updating trade status:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// GET /api/trades/admin/all
// Admin-only list of all trades
// ------------------------------------------------------------
router.get('/admin/all', auth, async (req, res) => {
  try {
    const ADMIN_EMAILS = getAdminEmails();
    const userEmail = (req.user.email || '').toLowerCase();

    if (!ADMIN_EMAILS.includes(userEmail)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const trades = await Trade.find({})
      .sort({ createdAt: -1 })
      .populate('offerListing')
      .populate('requestListing')
      .populate('buyer', 'username email')
      .populate('seller', 'username email');

    return res.json(trades);
  } catch (err) {
    console.error('Error fetching admin trades:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
