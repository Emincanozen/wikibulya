const { test } = require('node:test');
const assert = require('node:assert/strict');
const { creerJeu } = require('../game');
const { creerApp } = require('../app');
const article = { title: 'İstanbul', summary: 'İstanbul güzel bir şehir. 1453!' };
function preparer(options = {}) { return creerJeu({ chargerArticle: async () => article, ...options }); }

test('masque Unicode et ne révèle jamais le titre avant la victoire', async () => {
    const jeu = preparer(); const partie = await jeu.commencer();
    assert.equal(partie.title, undefined);
    assert.doesNotMatch(partie.text, /[\p{L}\p{N}]/u);
    const reponse = jeu.deviner(partie.session_token, 'şehir');
    assert.match(reponse.text, /şehir/); assert.equal(reponse.title, undefined);
    assert.equal(jeu.deviner(partie.session_token, 'istanbul').won, true);
});
test('sessions isolées, doublons idempotents, score borné', async () => {
    const jeu = preparer(); const a = await jeu.commencer(); const b = await jeu.commencer();
    assert.notEqual(a.session_token, b.session_token);
    assert.equal(jeu.deviner(a.session_token, 'absent').score, 9900);
    assert.equal(jeu.deviner(a.session_token, 'absent').score, 9900);
    assert.doesNotMatch(jeu.deviner(b.session_token, 'güzel').text, /şehir/);
    assert.throws(() => jeu.deviner(a.session_token, '.*'), { status: 400 });
    assert.throws(() => jeu.deviner('inconnu', 'mot'), { status: 404 });
});
test('un article par jour, expiration et capacité', async () => {
    let heure = Date.UTC(2026, 9, 30), appels = 0;
    const jeu = preparer({ maintenant: () => heure, capacite: 2,
        chargerArticle: async () => { appels++; return article; } });
    const a = await jeu.commencer(); await jeu.commencer(); assert.equal(appels, 1);
    await assert.rejects(jeu.commencer(), { status: 429 });
    heure += 86400000;
    assert.throws(() => jeu.deviner(a.session_token, 'mot'), { status: 404 });
    await jeu.commencer(); assert.equal(appels, 2);
});
test('un échec fournisseur ne corrompt pas le cache', async () => {
    let appels = 0;
    const jeu = preparer({ chargerArticle: async () => ++appels === 1 ? {} : article });
    await assert.rejects(jeu.commencer());
    assert.ok((await jeu.commencer()).session_token);
});
test('HTTP : création, proposition, validation et erreurs fournisseur', async t => {
    const serveur = creerApp({ jeu: preparer() }).listen(0, '127.0.0.1');
    await new Promise(resolve => serveur.once('listening', resolve));
    t.after(() => new Promise(resolve => serveur.close(resolve)));
    const url = `http://127.0.0.1:${serveur.address().port}`;
    const partie = await (await fetch(url + '/game/daily-text')).json();
    const resultat = await fetch(url + '/game/guess', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: partie.session_token, guessed_word: 'İstanbul' }) });
    assert.equal(resultat.status, 200); assert.equal((await resultat.json()).won, true);
    assert.equal((await fetch(url + '/game/guess', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
});
