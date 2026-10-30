const { randomUUID } = require('node:crypto');

const normaliser = (texte) => texte.normalize('NFC').toLocaleLowerCase('tr-TR');
const masquer = (texte, mots) => texte.replace(/[\p{L}\p{N}]+/gu,
    mot => mots.has(normaliser(mot)) ? mot : mot.replace(/[\p{L}\p{N}]/gu, '█'));

// Stockage temporaire explicite : un redémarrage termine les parties en cours.
function creerJeu({ chargerArticle, maintenant = Date.now, capacite = 1000 }) {
    const sessions = new Map();
    let jour, article, chargement;
    const duree = 24 * 60 * 60 * 1000;
    async function articleDuJour() {
        const date = new Date(maintenant()).toISOString().slice(0, 10);
        if (jour === date && article) return article;
        if (!chargement) {
            chargement = Promise.resolve().then(chargerArticle).then(resultat => {
                if (typeof resultat?.title !== 'string' || !resultat.title.trim() ||
                    typeof resultat?.summary !== 'string' || !resultat.summary.trim()) {
                    throw new Error('Article indisponible');
                }
                article = resultat;
                jour = date;
                return article;
            }).finally(() => { chargement = undefined; });
        }
        return chargement;
    }
    function vue(session) {
        return {
            session_token: session.token,
            text: session.gagne ? session.article.summary : masquer(session.article.summary, session.mots),
            score: session.score,
            won: session.gagne,
            ...(session.gagne ? { title: session.article.title } : {}),
        };
    }
    return {
        async commencer() {
            for (const [id, session] of sessions) {
                if (maintenant() - session.debut >= duree) sessions.delete(id);
            }
            if (sessions.size >= capacite) {
                const erreur = new Error('Trop de parties en cours, réessayez plus tard');
                erreur.status = 429;
                throw erreur;
            }
            const courant = await articleDuJour();
            // Vérifier aussi après l'attente réseau : plusieurs créations peuvent être concurrentes.
            if (sessions.size >= capacite) {
                const erreur = new Error('Trop de parties en cours'); erreur.status = 429; throw erreur;
            }
            const session = { token: randomUUID(), article: courant, mots: new Set(),
                essais: new Set(), score: 10000, gagne: false, debut: maintenant() };
            sessions.set(session.token, session);
            return vue(session);
        },
        deviner(token, mot) {
            if (typeof token !== 'string' || typeof mot !== 'string' || !mot.trim() ||
                mot.length > 100 || !/^[\p{L}\p{N}\s'’.-]+$/u.test(mot)) {
                const erreur = new Error('Proposition invalide'); erreur.status = 400; throw erreur;
            }
            const session = sessions.get(token);
            if (!session || maintenant() - session.debut >= duree) {
                sessions.delete(token);
                const erreur = new Error('Partie expirée ou inconnue'); erreur.status = 404; throw erreur;
            }
            const proposition = normaliser(mot.trim());
            const mots = session.article.summary.match(/[\p{L}\p{N}]+/gu) || [];
            const correct = proposition === normaliser(session.article.title) ||
                mots.some(m => normaliser(m) === proposition);
            if (!session.gagne && !session.essais.has(proposition)) {
                if (session.essais.size >= 1000) {
                    const erreur = new Error('Limite de propositions atteinte'); erreur.status = 429; throw erreur;
                }
                session.essais.add(proposition);
                if (correct) session.mots.add(proposition);
                else session.score = Math.max(0, session.score - 100);
                session.gagne = proposition === normaliser(session.article.title);
            }
            return { ...vue(session), isCorrect: correct };
        },
    };
}
module.exports = { creerJeu, masquer };
