const express = require('express');
const axios = require('axios');
const { creerJeu } = require('../game');

function creerRoutes({ jeu = creerJeu({
    chargerArticle: async () => {
        const { data } = await axios.get('https://tr.wikipedia.org/api/rest_v1/page/random/summary',
            { timeout: 10000, maxContentLength: 1024 * 1024 });
        return { title: data.title, summary: data.extract };
    },
}) } = {}) {
    const router = express.Router();
    router.get('/daily-text', async (req, res, next) => {
        try { res.set('Cache-Control', 'no-store').json(await jeu.commencer()); }
        catch (erreur) { next(erreur); }
    });
    router.post('/guess', (req, res, next) => {
        try { res.set('Cache-Control', 'no-store').json(jeu.deviner(req.body?.session_token, req.body?.guessed_word)); }
        catch (erreur) { next(erreur); }
    });
    return router;
}
module.exports = { creerRoutes };
