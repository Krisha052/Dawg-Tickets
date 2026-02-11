const { request, app, registerAndLogin } = require("./testUtils");

test("Create listing requires auth", async () => {
    const res = await request(app).post("/api/listings").send({
        category: "student",
        event: "Football vs Florida",
        seat: "Section 101, Row 5, Seat 12",
        ticketNumber: "FB-001"
    });
    expect(res.statusCode).toBe(401);
});
