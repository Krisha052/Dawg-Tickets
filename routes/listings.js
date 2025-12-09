const express = require('express');
const router = express.Router();

const Listing = require('../models/Listing');
const ValidTicket = require('../models/ValidTicket');
const auth = require('../middleware/auth');

// ------------------------------------------------------------
// GET all open listings
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { event } = req.query;
    const filter = { status: 'open' };

    if (event) {
      filter.event = new RegExp(event, 'i');
    }

    const listings = await Listing.find(filter).populate('seller', 'username');
    return res.json(listings);
  } catch (err) {
    console.error('Error fetching listings:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// GET logged-in user's listings  (ONLY ONE route, no duplicate)
// ------------------------------------------------------------
router.get('/my-listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id });
    return res.json(listings);
  } catch (err) {
    console.error('Error fetching user listings:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// GET listing by ID
// ------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'username email');

    if (!listing) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(listing);
  } catch (err) {
    console.error('Error fetching listing by id:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

// ------------------------------------------------------------
// CREATE LISTING (validates against ValidTicket)
// ------------------------------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { category, event, seat, preferredTrade, ticketNumber } = req.body;

    console.log('Create listing body:', req.body); // debug

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
      return res.status(400).json({
        error: 'Ticket details do not match official UGA records.'
      });
    }

    if (ticket.isUsed) {
      return res.status(400).json({ error: 'This ticket has already been listed.' });
    }

    const listing = await Listing.create({
      seller: req.user._id,
      category,
      event,
      seat,
      preferredTrade: preferredTrade || '',
      ticketNumber,
      status: 'open',
    });

    ticket.isUsed = true;
    await ticket.save();

    return res.status(201).json({
      message: 'Listing created successfully.',
      listing,
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error.' });
    }
  }
});

// ------------------------------------------------------------
// DELETE listing
// ------------------------------------------------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!listing.seller.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await listing.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error('Error deleting listing:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
