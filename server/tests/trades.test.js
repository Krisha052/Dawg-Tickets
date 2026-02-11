const { request, app, registerAndLogin } = require("./testUtils");

test("Trade creation fails without auth", async () => {
    const res = await request(app).post("/api/trades").send({ requestListingId: "fake" });
    expect(res.statusCode).toBe(401);
});
