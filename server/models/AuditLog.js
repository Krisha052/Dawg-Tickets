const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
    actorUserId: { type: String, required: true }, // Postgres User.id
    action: { type: String, required: true },      // LISTING_CREATE, TRADE_CREATE...
    entityType: { type: String, required: true },  // listing|trade
    entityId: { type: String, required: true },    // Postgres UUID
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
