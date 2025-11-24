const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');


// ------------------------------------------------------------
// CREATE TRADE (swap): offerListingId ↔ requestListingId
// ------------------------------------------------------------
router.post('/', auth, async (req, res) => {
  const { offerListingId, requestListingId } = req.body;

  const offerListing = await Listing.findById(offerListingId).populate('seller');
  const requestListing = await Listing.findById(requestListingId).populate('seller');

  if (!offerListing || !requestListing)
    return res.status(404).json({ error: 'One or both listings not found' });

  // Prevent self-trading
  if (requestListing.seller._id.toString() === req.user._id.toString())
    return res.status(400).json({ error: 'You cannot trade with your own listing' });

  // Category match required
  if (offerListing.category !== requestListing.category)
    return res.status(400).json({ error: 'Trades must be within the same category' });

  // User must own the offered listing
  if (offerListing.seller._id.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'You can only offer a listing you own' });

  const trade = await Trade.create({
    offerListing: offerListing._id,
    requestListing: requestListing._id,
    seller: requestListing.seller._id,  // owner of the listing being requested
    buyer: req.user._id,
    category: offerListing.category,
    status: 'pending'
  });

  res.json(trade);
});


// ------------------------------------------------------------
// GET ALL TRADES FOR CURRENT USER
// ------------------------------------------------------------
router.get('/', auth, async (req, res) => {
  const trades = await Trade.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }]
  })
    .populate('offerListing')
    .populate('requestListing')
    .populate('buyer', 'username')
    .populate('seller', 'username');

  res.json(trades);
});


// ------------------------------------------------------------
// UPDATE TRADE STATUS (accept or decline)
// ------------------------------------------------------------
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'completed', 'cancelled', 'declined'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  const trade = await Trade.findById(req.params.id);
  if (!trade) return res.status(404).json({ error: 'Trade not found' });

  // Only the seller of the requested listing can accept/decline
  if (trade.seller.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Not authorized to update this trade' });

  // If trade is accepted (completed)
  if (status === 'completed') {
    const offerListing = await Listing.findById(trade.offerListing);
    const requestListing = await Listing.findById(trade.requestListing);

    offerListing.status = 'completed';
    requestListing.status = 'completed';

    await offerListing.save();
    await requestListing.save();
  }

  trade.status = status;
  await trade.save();

  res.json(trade);
});


module.exports = router;

