# WikiBulYa

Jeu de vocabulaire : retrouver le titre d'un article Wikipédia turc en proposant des mots. Le résumé est masqué ; les mots corrects sont révélés par le serveur. Trouver le titre termine la partie. Une erreur coûte 100 points, sans descendre sous zéro ; une proposition répétée ne coûte pas deux fois.

## État réel

Prototype jouable avec API Express et client React Native/Expo, exportable pour le web. Ce dépôt est préparé pour une revue privée, sans déploiement ni publication. Les dossiers `database/`, les modèles Sequelize et les fichiers de classement sont des ébauches historiques **non utilisés** par ce parcours. Aucun classement fonctionnel ni compte utilisateur n'est annoncé.

Les sessions sont temporaires en mémoire, limitées à 1 000, expirent après 24 heures et disparaissent au redémarrage. L'article est commun aux sessions d'une journée UTC dans un même processus. Plusieurs instances ne partagent pas encore cet état. Le chargement initial exige Wikipédia ; en cas de panne, l'API renvoie une erreur et le client permet de réessayer.

## Démarrer

Prérequis : Node.js 24 et npm. Dans deux terminaux :

```sh
cd backend
npm ci
cp .env.example .env
npm start
```

```sh
cd frontend
npm ci
cp .env.example .env
npm run web
```

Ouvrir l'adresse fournie par Expo. Sur un téléphone physique, `localhost` désigne le téléphone : définir `EXPO_PUBLIC_API_URL` avec l'adresse du serveur sur le réseau local, puis relancer Expo. Ne pas exposer ce prototype directement sur Internet.

## Vérifier

```sh
cd backend
npm test
```

```sh
cd frontend
npm run build:web
```

Les tests couvrent le masquage Unicode, l'absence de fuite du titre, le traitement des propositions, les sessions séparées, le score, l'expiration, le cache quotidien, la capacité et les routes HTTP avec un fournisseur simulé. Ils ne prouvent pas la disponibilité actuelle de Wikipédia ni le fonctionnement sur un téléphone réel.

## Docker

```sh
docker compose -f docker/docker-compose.yml up --build
```

Le client est sur `http://localhost:8081`, l'API sur `http://localhost:5000`. Les ports sont liés à la boucle locale. Les Dockerfiles et le compose ont été réécrits ; une compilation Docker complète doit encore être validée. Les variables `EXPO_PUBLIC_*` sont publiques dans le bundle ; n'y placer aucun secret.

## API

- `GET /game/daily-text` crée une session et renvoie `session_token`, `text`, `score`, `won`. Le titre reste caché.
- `POST /game/guess` reçoit `{ "session_token": "…", "guessed_word": "…" }` et renvoie le nouvel état, avec `isCorrect`. Le titre apparaît seulement à la victoire.
- Les entrées invalides renvoient 400, les sessions absentes ou expirées 404, la capacité atteinte 429 et les pannes fournisseur 502.

## Avant toute ouverture publique

Le `.env` était suivi par Git : retirer le fichier courant ne supprime pas l'historique. Renouveler les identifiants réels éventuels, puis décider séparément d'un nettoyage d'historique. Les dépendances générées ne sont plus suivies ; les lockfiles restent versionnés.

Il reste à définir la licence du code, l'attribution et les obligations liées aux extraits Wikipédia, la persistance et les sauvegardes, ainsi qu'une limitation de débit en amont. Les jetons de session sont des accès porteurs : utiliser HTTPS et ne pas les journaliser. Aucun compte, paiement ou classement n'est ajouté sans conception dédiée.

Voir [la revue détaillée](REVIEW.md) pour les résultats et limites.
