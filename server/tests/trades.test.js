const { request, app, prisma, resetDb, registerAndLogin } = require("./testUtils");

test("Trade creation fails without auth", async () => {
    const res = await request(app).post("/api/trades").send({ requestListingId: "fake" });
    expect(res.statusCode).toBe(401);
});

async function makeListing(sellerId, ticketNumber) {
    const event = await prisma.event.create({ data: { name: "Test Event", date: new Date() } });
    const ticket = await prisma.ticket.create({ data: { eventId: event.id, seat: "A1", ticketNumber } });
    return prisma.listing.create({
        data: { sellerId, eventId: event.id, ticketId: ticket.id, category: "student", status: "open" }
    });
}

describe("trade accept/decline lifecycle", () => {
    beforeAll(async () => {
        await resetDb();
    });

    test("seller can accept a pending trade, which completes the listing", async () => {
        const sellerToken = await registerAndLogin("seller@test.com", "seller1");
        const buyerToken = await registerAndLogin("buyer@test.com", "buyer1");
        const seller = await prisma.user.findUniqueOrThrow({ where: { email: "seller@test.com" } });

        const listing = await makeListing(seller.id, "TICK-ACCEPT-1");

        const createRes = await request(app)
            .post("/api/trades")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ requestListingId: listing.id });
        expect(createRes.statusCode).toBe(201);
        const tradeId = createRes.body.id;

        const buyerAccept = await request(app)
            .patch(`/api/trades/${tradeId}/accept`)
            .set("Authorization", `Bearer ${buyerToken}`);
        expect(buyerAccept.statusCode).toBe(403);

        const acceptRes = await request(app)
            .patch(`/api/trades/${tradeId}/accept`)
            .set("Authorization", `Bearer ${sellerToken}`);
        expect(acceptRes.statusCode).toBe(200);
        expect(acceptRes.body.status).toBe("accepted");

        const updatedListing = await prisma.listing.findUnique({ where: { id: listing.id } });
        expect(updatedListing.status).toBe("completed");

        const reAccept = await request(app)
            .patch(`/api/trades/${tradeId}/accept`)
            .set("Authorization", `Bearer ${sellerToken}`);
        expect(reAccept.statusCode).toBe(400);
    });

    test("seller can decline a pending trade, which reopens the listing", async () => {
        const sellerToken = await registerAndLogin("seller2@test.com", "seller2");
        const buyerToken = await registerAndLogin("buyer2@test.com", "buyer2");
        const seller = await prisma.user.findUniqueOrThrow({ where: { email: "seller2@test.com" } });

        const listing = await makeListing(seller.id, "TICK-DECLINE-1");

        const createRes = await request(app)
            .post("/api/trades")
            .set("Authorization", `Bearer ${buyerToken}`)
            .send({ requestListingId: listing.id });
        expect(createRes.statusCode).toBe(201);
        const tradeId = createRes.body.id;

        const declineRes = await request(app)
            .patch(`/api/trades/${tradeId}/decline`)
            .set("Authorization", `Bearer ${sellerToken}`);
        expect(declineRes.statusCode).toBe(200);
        expect(declineRes.body.status).toBe("declined");

        const updatedListing = await prisma.listing.findUnique({ where: { id: listing.id } });
        expect(updatedListing.status).toBe("open");
    });
});
