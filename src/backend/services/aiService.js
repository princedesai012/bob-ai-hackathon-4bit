// services/aiService.js

const { queryDatabase } = require('./ai/fallbackProvider');

const handleQuery = async (message) => {
  // Check if IBM credentials exist (mock logic)
  const useIbm = process.env.IBM_BOB_API_KEY && process.env.IBM_BOB_URL;

  if (useIbm) {
    // IBM Bob Integration goes here...
    return "IBM Bob integration is pending finalization. Response via IBM.";
  } else {
    // Use fallback provider utilizing real DB data
    const response = await queryDatabase(message);
    return response;
  }
};

module.exports = { handleQuery };
