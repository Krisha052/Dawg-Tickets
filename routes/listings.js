const express = require('express');
const router = express.Router();

const Listing = require('../models/Listing');
const ValidTicket = require('../models/ValidTicket');   // ⬅ NEW
const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');      // ⬅ keep for later if you add images

// ------------------------------------------------------------
// GET all open listings (optionally filter by event query)
// /api/listings?event=FB%3A%20Georgia%20v.%20Marshall
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  const { event } = req.query;
  const filter = { status: 'open' };

  if (event) {
    // case-insensitive match on event name
    filter.event = new RegExp(event, 'i');
  }

  const listings = await Listing.find(filter).populate('seller', 'username');
  res.json(listings);
});


// ------------------------------------------------------------
// GET listing by ID
// /api/listings/:id
// ------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'username email');

  if (!listing) return res.status(404).json({ error: 'Not found' });

  res.json(listing);
});


// ------------------------------------------------------------
// CREATE LISTING (with ticket validation)
// /api/listings   [POST]
// body: { category, event, seat, preferredTrade?, ticketNumber }
// ------------------------------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { category, event, seat, preferredTrade, ticketNumber } = req.body;

    if (!category || !event || !seat || !ticketNumber) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    //Validate ticket number exists in official DB
    const ticket = await ValidTicket.findOne({ ticketNumber });

    if (!ticket) {
      return res.status(400).json({
        error: 'This ticket number is not recognized. Please check again.'
      });
    }

    //Validate category, event, and seat match the official record
    if (
      ticket.category !== category ||
      ticket.event !== event ||
      ticket.seat !== seat
    ) {
      return res.status(400).json({
        error: 'Ticket details do not match official UGA records.'
      });
    }

   ⃣//Ensure ticket isn’t already used
    if (ticket.isUsed) {
      return res.status(400).json({
        error: 'This ticket has already been listed and cannot be reused.'
      });
    }

    /⃣/Create the listing
    const listing = await Listing.create({
      seller: req.user._id,
      category,
      event,
      seat,
      preferredTrade: preferredTrade || null,
      ticketNumber
    });

    // Mark ticket as used
    ticket.isUsed = true;
    await ticket.save();

    res.json({
      message: 'Listing created successfully.',
      listing
    });

  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});


// ------------------------------------------------------------
// DELETE listing (owner only)
// /api/listings/:id   [DELETE]
// ------------------------------------------------------------
router.delete('/:id', auth, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });

  if (!listing.seller.equals(req.user._id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await listing.deleteOne();
  res.json({ success: true });
});

module.exports = router;

router.get('/my-listings', auth, async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id });
  res.json(listings);
});

