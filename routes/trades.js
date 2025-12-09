const express = require('express');
const router = express.Router();

const Trade = require('../models/Trade');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

// ------------------------------------------------------------
// CREATE TRADE (swap): offerListingId ↔ requestListingId
// Body: { offerListingId, requestListingId }
// ------------------------------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { offerListingId, requestListingId } = req.body;

    if (!offerListingId || !requestListingId) {
      return res.status(400).json({ error: 'Both listings are required.' });
    }

    const [offerListing, requestListing] = await Promise.all([
      Listing.findById(offerListingId).populate('seller'),
      Listing.findById(requestListingId).populate('seller'),
    ]);

    if (!offerListing || !requestListing) {
      return res.status(404).json({ error: 'One or both listings not found.' });
    }

    if (offerListing.category !== requestListing.category) {
      return res.status(400).json({ error: 'Trades must be within the same category.' });
    }

    if (offerListing.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only offer a listing you own.' });
    }

    if (offerListing.status !== 'open' || requestListing.status !== 'open') {
      return res.status(400).json({ error: 'Both listings must be open.' });
    }

    const trade = await Trade.create({
      offerListing: offerListing._id,
      requestListing: requestListing._id,
      seller: requestListing.seller._id, // owner of requested listing
      buyer: req.user._id,               // you (the initiator)
      category: offerListing.category,
      status: 'pending',
    });

    const populated = await Trade.findById(trade._id)
      .populate('offerListing')
      .populate('requestListing')
      .populate('buyer', 'username')
      .populate('seller', 'username');

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating trade:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error.' });
    }
  }
});

// ------------------------------------------------------------
// GET ALL TRADES FOR CURRENT USER
// ------------------------------------------------------------
router.get('/', auth, async (req, res) => {
  try {
    const trades = await Trade.find({
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id },
      ],
    })
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .populate('offerListing')
      .populate('requestListing');

    return res.json(trades);
  } catch (err) {
    console.error('Error fetching trades:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// UPDATE TRADE STATUS (accept / decline / cancel)
// Body: { status } where status ∈ ['pending','completed','cancelled']
// Only the seller (owner of requested listing) can change status.
// ------------------------------------------------------------
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const trade = await Trade.findById(req.params.id)
      .populate('offerListing')
      .populate('requestListing');

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found.' });
    }

    if (trade.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this trade.' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'Trade is no longer pending.' });
    }

    // If seller accepts, mark both listings completed
    if (status === 'completed') {
      if (trade.offerListing) {
        trade.offerListing.status = 'completed';
        await trade.offerListing.save();
      }
      if (trade.requestListing) {
        trade.requestListing.status = 'completed';
        await trade.requestListing.save();
      }
    }

    // If seller cancels, optionally re-open offer listing
    if (status === 'cancelled') {
      if (trade.offerListing && trade.offerListing.status === 'pending') {
        trade.offerListing.status = 'open';
        await trade.offerListing.save();
      }
    }

    trade.status = status;
    await trade.save();

    const populated = await Trade.findById(trade._id)
      .populate('offerListing')
      .populate('requestListing')
      .populate('buyer', 'username')
      .populate('seller', 'username');

    return res.json(populated);
  } catch (err) {
    console.error('Error updating trade:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error.' });
    }
  }
});

// ------------------------------------------------------------
// ADMIN: Full trade history
// GET /api/trades/admin/all
// Requires: logged-in user whose email is in ADMIN_EMAILS
// ------------------------------------------------------------
router.get('/admin/all', auth, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase();

    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Admin access only' });
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
