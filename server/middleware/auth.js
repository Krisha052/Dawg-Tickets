const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

module.exports = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No token" });

    const [scheme, token] = auth.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "Malformed token" });

    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.id) return res.status(401).json({ error: "Invalid token payload" });

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        roles: { include: { role: true } }
      }
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(r => r.role.name)
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

