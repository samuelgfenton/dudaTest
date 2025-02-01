const express = require('express');
const path = require('path');
const routes = require('./routes/route-index');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:3000`);
});