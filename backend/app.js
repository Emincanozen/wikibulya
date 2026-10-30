const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { creerRoutes } = require('./routes/gameRoutes');

function creerApp(options) {
    const app = express();
    app.disable('x-powered-by');
    app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8081' }));
    app.use(express.json({ limit: '4kb' }));
    app.get('/', (req, res) => res.json({ name: 'WikiBulYa', storage: 'temporary-memory' }));
    app.use('/game', creerRoutes(options));
    app.use((err, req, res, next) => {
        const status = err.status || 502;
        res.status(status).json({ error: status < 500 ? err.message : 'Service temporairement indisponible' });
    });
    return app;
}
if (require.main === module) {
    const port = Number(process.env.PORT || 5000);
    const serveur = creerApp().listen(port, '0.0.0.0', () => console.log(`WikiBulYa : port ${port}`));
    process.on('SIGTERM', () => serveur.close());
}
module.exports = { creerApp };
