const { request, app, resetDb } = require("./testUtils");

beforeAll(async () => {
    await resetDb();
});

test("Register + login returns JWT", async () => {
    const reg = await request(app).post("/api/auth/register").send({
        email: "user1@test.com",
        username: "user1",
        password: "Password123!"
    });
    expect(reg.statusCode).toBe(200);
    expect(reg.body.token).toBeTruthy();

    const login = await request(app).post("/api/auth/login").send({
        email: "user1@test.com",
        password: "Password123!"
    });
    expect(login.statusCode).toBe(200);
    expect(login.body.token).toBeTruthy();
});
