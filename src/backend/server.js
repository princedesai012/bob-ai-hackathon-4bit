// server.js - No MongoDB needed. Uses in-memory store.
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SupplyShield AI backend running on http://localhost:${PORT}`);
  console.log(`📦 Using in-memory data store (no MongoDB required)`);
  console.log(`🔗 Ready to connect to MongoDB later via MONGODB_URI env variable`);
});
