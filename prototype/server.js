const express = require('express');
const path = require('path');
const session = require('express-session');
const routes = require('./routes/route-index');
const { settingsConfig } = require('./config/config-loader');

const app = express();
const port = 3000;

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

app.use(express.static('public'));
app.use(express.json());

// Middleware to set default property if none selected
app.use((req, res, next) => {
    if (!req.session.currentSpid) {
        req.session.currentSpid = settingsConfig.properties[0].spid;
        console.log('Set default property SPID:', req.session.currentSpid);
    }
    next();
});

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Available properties:', settingsConfig.properties.map(p => p.propertyName));
});