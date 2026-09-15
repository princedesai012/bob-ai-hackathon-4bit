// copilotController.js
const { handleQuery } = require('../services/aiService');

const query = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: { message: 'Message is required' }});
    }

    const aiResponse = await handleQuery(message);

    res.json({
      success: true,
      data: {
        response: aiResponse
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { message: err.message }});
  }
};

module.exports = { query };
