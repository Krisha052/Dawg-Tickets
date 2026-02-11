const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const SALT = 10;

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

async function ensureRoles() {
  await prisma.role.upsert({ where: { name: "user" }, update: {}, create: { name: "user" } });
  await prisma.role.upsert({ where: { name: "admin" }, update: {}, create: { name: "admin" } });
}

router.post("/register", async (req, res) => {
  try {
    await ensureRoles();

    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const emailNorm = email.trim().toLowerCase();
    const exists = await prisma.user.findFirst({ where: { OR: [{ email: emailNorm }, { username }] } });
    if (exists) return res.status(409).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, SALT);
    const isAdmin = adminEmails().includes(emailNorm);
    const roles = isAdmin ? ["user", "admin"] : ["user"];

    const user = await prisma.user.create({
      data: {
        username,
        email: emailNorm,
        password: hashed,
        roles: { create: roles.map(name => ({ role: { connect: { name } } })) }
      },
      select: { id: true, username: true, email: true }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const emailNorm = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
