// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to the MongoDB'))
.catch(err => console.error('MongoDB connection error is:', err));

app.get('/', (req, res) => {
  res.send('Dawg-Tickets backend is running correctly.');
});

app.post('/api/auth/register', (req, res) => {
  res.json({ token: 'fake-jwt-token-for-now' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ token: 'fake-jwt-token-for-now' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
