const express = require('express');
const router = express.Router();

const Listing = require('../models/Listing');
const ValidTicket = require('../models/ValidTicket');
const auth = require('../middleware/auth');

// ------------------------------------------------------------
// GET all open listings
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  const { event } = req.query;
  const filter = { status: 'open' };

  if (event) {
    filter.event = new RegExp(event, 'i');
  }

  const listings = await Listing.find(filter).populate('seller', 'username');
  res.json(listings);
});

// ------------------------------------------------------------
// GET logged-in user's listings  <-- MUST come before '/:id'
// ------------------------------------------------------------
router.get('/my-listings', auth, async (req, res) => {
  const listings = await Listing.find({ seller: req.user._id });
  res.json(listings);
});

// ------------------------------------------------------------
// GET listing by ID
// ------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('seller', 'username email');

  if (!listing) return res.status(404).json({ error: 'Not found' });

  res.json(listing);
});

// ------------------------------------------------------------
// CREATE LISTING (ticket validation)
// ------------------------------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { category, event, seat, preferredTrade, ticketNumber } = req.body;

    if (!category || !event || !seat || !ticketNumber) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const ticket = await ValidTicket.findOne({ ticketNumber });

    if (!ticket) {
      return res.status(400).json({ error: 'This ticket number is not recognized.' });
    }

    if (
      ticket.category !== category ||
      ticket.event !== event ||
      ticket.seat !== seat
    ) {
      return res.status(400).json({ error: 'Ticket details do not match official UGA records.' });
    }

    if (ticket.isUsed) {
      return res.status(400).json({ error: 'This ticket has already been listed.' });
    }

    const listing = await Listing.create({
      seller: req.user._id,
      category,
      event,
      seat,
      preferredTrade: preferredTrade || null,
      ticketNumber
    });

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
// DELETE listing
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


// ------------------------------------------------------------
// GET LISTINGS THAT BELONG TO CURRENT USER
// ------------------------------------------------------------
router.get('/my-listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id });
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;

