const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const AuditLog = require("../models/AuditLog");

router.post("/", auth, async (req, res) => {
  try {
    const { requestListingId, offerListingId } = req.body;
    if (!requestListingId) return res.status(400).json({ error: "Missing requestListingId" });

    const buyerId = req.user.id;

    const trade = await prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({ where: { id: requestListingId } });
      if (!listing) throw new Error("LISTING_NOT_FOUND");
      if (listing.sellerId === buyerId) throw new Error("SELF_TRADE");

      const updated = await tx.listing.updateMany({
        where: { id: requestListingId, status: "open" },
        data: { status: "pending" }
      });
      if (updated.count === 0) throw new Error("LISTING_UNAVAILABLE");

      const existing = await tx.trade.findFirst({
        where: { requestListingId, buyerId, status: "pending" }
      });
      if (existing) throw new Error("DUPLICATE_TRADE");

      const tradeCode = "TRD-" + crypto.randomBytes(3).toString("hex").toUpperCase();

      return await tx.trade.create({
        data: {
          tradeCode,
          requestListingId,
          offerListingId: offerListingId || null,
          sellerId: listing.sellerId,
          buyerId,
          status: "pending"
        },
        include: {
          requestListing: { include: { event: true, ticket: true } },
          buyer: { select: { id: true, username: true } },
          seller: { select: { id: true, username: true } }
        }
      });
    });

    await AuditLog.create({
      actorUserId: buyerId,
      action: "TRADE_CREATE",
      entityType: "trade",
      entityId: trade.id,
      metadata: { requestListingId, offerListingId: offerListingId || null }
    });

    res.status(201).json(trade);
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg === "LISTING_NOT_FOUND") return res.status(404).json({ error: "Listing not found" });
    if (msg === "SELF_TRADE") return res.status(400).json({ error: "You cannot trade with yourself" });
    if (msg === "LISTING_UNAVAILABLE") return res.status(400).json({ error: "Listing unavailable" });
    if (msg === "DUPLICATE_TRADE") return res.status(400).json({ error: "Duplicate trade request" });

    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const id = req.user.id;
    const trades = await prisma.trade.findMany({
      where: { OR: [{ buyerId: id }, { sellerId: id }] },
      include: { requestListing: { include: { event: true, ticket: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(trades);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// admin example
router.get("/admin/all", auth, requireRole("admin"), async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        requestListing: { include: { event: true, ticket: true } },
        buyer: { select: { id: true, username: true, email: true } },
        seller: { select: { id: true, username: true, email: true } }
      }
    });
    res.json(trades);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
