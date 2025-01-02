const express = require('express');
const app = express();

const PORT = process.env.PORT || 9000;

// Health check endpoint
app.get('/version', (req, res) => {
  res.json({ version: '1.0.0', status: 'healthy' });
});

// Example endpoint
app.get('/api/example', (req, res) => {
  res.json({ message: 'Hello from the Node.js API!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node API running on port ${PORT}`);
});
