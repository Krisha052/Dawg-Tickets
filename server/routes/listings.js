const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

const ValidTicket = require("../models/ValidTicket");
const AuditLog = require("../models/AuditLog");

router.get("/", async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "open" },
      include: {
        seller: { select: { id: true, username: true } },
        event: true,
        ticket: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(listings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/my-listings", auth, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.user.id },
      include: { event: true, ticket: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(listings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { category, event, seat, preferredTrade, ticketNumber, priceCents, eventDate, venue } = req.body;
    if (!category || !event || !seat || !ticketNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const vt = await ValidTicket.findOne({ ticketNumber });
    if (!vt) return res.status(400).json({ error: "Ticket number not recognized" });

    if (vt.category !== category || vt.event !== event || vt.seat !== seat) {
      return res.status(400).json({ error: "Ticket details do not match registry" });
    }
    if (vt.isUsed) return res.status(400).json({ error: "Ticket already listed" });

    const created = await prisma.$transaction(async (tx) => {
      const ev = await tx.event.create({
        data: { name: event, date: eventDate ? new Date(eventDate) : new Date(), venue: venue || null }
      });

      const t = await tx.ticket.create({
        data: { eventId: ev.id, seat, ticketNumber }
      });

      const listing = await tx.listing.create({
        data: {
          sellerId: req.user.id,
          eventId: ev.id,
          ticketId: t.id,
          category,
          preferredTrade: preferredTrade || null,
          priceCents: typeof priceCents === "number" ? priceCents : null,
          status: "open"
        },
        include: { event: true, ticket: true }
      });

      return listing;
    });

    vt.isUsed = true;
    await vt.save();

    await AuditLog.create({
      actorUserId: req.user.id,
      action: "LISTING_CREATE",
      entityType: "listing",
      entityId: created.id,
      metadata: { category, event, seat, ticketNumber }
    });

    res.status(201).json({ listing: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
