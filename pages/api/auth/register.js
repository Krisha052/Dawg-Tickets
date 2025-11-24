import bcrypt from "bcryptjs";
import theDbConnect from "../../../lib/mongoose"; // helper to connect to MongoDB
import theUserModel from "../../../models/User";

export default async function handler(theReq, theRes) {
  if (theReq.method !== "POST") {
    return theRes.status(405).json({ error: "Method not allowed" });
  }

  await theDbConnect();

  const { theEmail, theUsername, thePassword } = theReq.body;

  if (!theEmail || !theUsername || !thePassword) {
    return theRes.status(400).json({ error: "Missing required fields" });
  }

  try {
    const theExistingUser = await theUserModel.findOne({ email: theEmail });
    if (theExistingUser) {
      return theRes.status(400).json({ error: "User already exists" });
    }

    const theHashedPassword = await bcrypt.hash(thePassword, 10);

    const theNewUser = await theUserModel.create({
      email: theEmail,
      username: theUsername,
      password: theHashedPassword,
    });

    return theRes.status(201).json({ message: "User created", user: theNewUser });
  } catch (theErr) {
    console.error(theErr);
    return theRes.status(500).json({ error: "Server error" });
  }
}
