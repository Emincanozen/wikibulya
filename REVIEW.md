# Revue privée du 30 octobre 2026

## Problèmes corrigés

1. `/game/guess` n'existait pas alors que l'interface l'appelait : parcours serveur ajouté avec tests HTTP.
2. Le titre était renvoyé au début : il n'est désormais révélé qu'à la victoire.
3. `\w` ne masquait pas les lettres turques : masquage et recherche Unicode, avec casse turque.
4. Le client remplaçait des caractères dans un texte déjà masqué et utilisait un jeton fixe : il affiche maintenant l'état calculé par le serveur et utilise une session propre.
5. Chaque requête changeait l'article « quotidien » : cache journalier UTC et protection contre les chargements simultanés.
6. Aucune limite de taille, d'attente ou de sessions : limites d'entrée, timeout fournisseur, capacité et expiration ajoutés.
7. Le serveur exigeait une base inutile à ce parcours : démarrage du prototype sans base ; les anciens modèles restent identifiés comme inactifs.
8. Le client n'avait ni point d'entrée ni commandes de démarrage : configuration Expo et lockfile ajoutés.
9. Les Dockerfiles étaient vides et les chemins compose erronés : réécriture pour l'API et le client web.
10. `.env` et plus de 17 000 fichiers de dépendances étaient suivis : retrait de l'index, règles d'exclusion et exemples sans secret.
11. Le README était vide et `npm test` échouait volontairement : instructions et véritables tests ajoutés.

## Vérification

Cinq tests Node passent, dont un exercice HTTP local. L'export web Expo réussit. Une vérification finale après mise à jour des dépendances est consignée dans le dossier de rapport de session. Aucun essai sur téléphone, aucun déploiement, aucun appel réel Wikipédia validé, aucune compilation Docker complète annoncée.

## Points encore ouverts

Persistance, classement, authentification, anti-abus complet, disponibilité du fournisseur, examen de l'historique des secrets et obligations de réutilisation des extraits. Ce prototype ne doit pas être présenté comme une application de production achevée.
