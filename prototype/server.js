const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));

// API endpoint to fetch templates
app.get('/api/templates', async (req, res) => {
    try {
        const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/templates', {
            headers: {
                'Authorization': 'Basic NmExNTEzODE6djZqVWh5QTJTb0M5'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});