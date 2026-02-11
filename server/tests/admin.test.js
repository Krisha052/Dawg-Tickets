const { request, app, registerAndLogin } = require("./testUtils");

test("Admin endpoint blocked for non-admin", async () => {
    const token = await registerAndLogin("normal@test.com", "normal");
    const res = await request(app)
        .get("/api/trades/admin/all")
        .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
});
