# Déployer le site New Quality Cleaning

Ce dossier contient le site complet (Next.js) connecté à Supabase. Toutes les pages partagent les mêmes commandes en temps réel.

## Pages incluses
- `/` — page d'accueil (vitrine de consultation, mentions légales, accès équipe)
- `/pressing-domicile` — commande à domicile avec panier
- `/acces-equipe` — connexion équipe (3 rôles avec mot de passe)
- `/direction` — tableau de bord direction
- `/atelier` — espace nettoyage
- `/livreur` — tournées de livraison
- `/mentions-legales` — mentions légales

## Étapes pour mettre le site en ligne (10-15 minutes)

### 1. Créer un compte Vercel
Va sur https://vercel.com/signup et inscris-toi (avec GitHub, GitLab, ou email).

### 2. Préparer le code sur GitHub
Vercel déploie depuis un dépôt GitHub. Si tu n'as pas de compte GitHub :
1. Crée un compte sur https://github.com/signup
2. Crée un nouveau dépôt (bouton vert "New")
3. Donne-lui un nom, par exemple `nqc-site`
4. Upload tous les fichiers de ce dossier dans le dépôt (bouton "Add file" > "Upload files", glisse tout le contenu du dossier sauf node_modules)

### 3. Déployer sur Vercel
1. Dans Vercel, clique sur "Add New" > "Project"
2. Connecte ton compte GitHub si demandé
3. Sélectionne le dépôt `nqc-site` que tu viens de créer
4. Avant de cliquer sur "Deploy", ouvre la section "Environment Variables" et ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://hxskhxunsfcdbtxxsgka.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (ta clé publishable Supabase)
5. Clique sur "Deploy"
6. Attends 1-2 minutes — Vercel te donne une URL du type `nqc-site.vercel.app`

### 4. Tester
Ouvre l'URL fournie par Vercel. Le site complet est en ligne, accessible par n'importe qui, avec toutes les pages reliées entre elles via la même base de données Supabase.

## Mots de passe équipe (à changer plus tard si besoin)
- Direction : `NQC-direction-2026`
- Atelier : `NQC-atelier-2026`
- Livreur : `NQC-livreur-2026`

Pour changer un mot de passe, modifie le fichier `lib/supabase.js`, section `ROLES`.
