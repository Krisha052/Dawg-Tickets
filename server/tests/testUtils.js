const request = require("supertest");
const app = require("../app");
const prisma = require("../lib/prisma");

async function resetDb() {
  await prisma.moderationAction.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
}

async function registerAndLogin(email, username, password = "Password123!") {
  await request(app).post("/api/auth/register").send({ email, username, password });
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.token;
}

module.exports = { request, app, prisma, resetDb, registerAndLogin };
