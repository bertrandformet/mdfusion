# MDFusion

**Convertir & fusionner des documents en Markdown, 100% hors-ligne.**

Application web progressive (PWA) qui fonctionne entièrement dans le navigateur. Aucune donnée n'est envoyée à un serveur.

[Ouvrir MDFusion](https://bertrandformet.github.io/mdfusion/)

---

## Fonctionnalités

### Convertir

Déposez des documents (PDF, DOCX, XLSX, CSV, HTML, EPUB, images, XML, JSON, texte) et obtenez un seul fichier Markdown. Choisissez le séparateur entre les documents et imbriquez les titres si nécessaire.

### Fusionner

Assemblez plusieurs fichiers `.md` dans l'ordre de votre choix. Ajustez les niveaux de titres et les séparateurs.

### Éditeur

Éditeur Markdown avec toolbar complète (titres H1–H5, gras, italique, souligné, barré, code, listes à puces, listes numérotées, cases à cocher, citations, liens, tableaux, ligne horizontale).

Mode **WYSIWYG bidirectionnel** : écrivez en Markdown et l'aperçu se met à jour, ou modifiez directement l'aperçu et le source Markdown se synchronise.

---

## Formats supportés

| Format | Extensions | Librairie |
| --- | --- | --- |
| PDF | `.pdf` | pdfjs-dist |
| Word | `.docx` | mammoth + turndown |
| PowerPoint | `.pptx` | JSZip (texte uniquement) |
| Excel | `.xlsx`, `.xls` | SheetJS |
| CSV | `.csv` | PapaParse |
| HTML | `.html`, `.htm` | Turndown |
| EPUB | `.epub` | JSZip + Turndown |
| XML | `.xml` | fast-xml-parser |
| JSON | `.json` | natif |
| Images | `.png`, `.jpg`, `.gif`, `.webp`, `.svg` | natif |
| Texte | `.txt`, `.md` | natif |

> **PPTX** : seul le contenu textuel est extrait. Les images, formes et mises en page ne sont pas conservées.
> **PPT** (ancien format) : non supporté. Enregistrez en `.pptx` ou convertissez en PDF.

---

## Installation

MDFusion est une PWA. À la première visite, l'application se met en cache et fonctionne ensuite sans connexion.

- **Navigateur** : ouvrez [bertrandformet.github.io/mdfusion](https://bertrandformet.github.io/mdfusion/)
- **Installer** : cliquez sur l'icône d'installation dans la barre d'adresse (Chrome, Edge) ou "Ajouter à l'écran d'accueil" (mobile)

---

## Stack technique

- **Vanilla JS** — pas de framework, pas de build, fichiers statiques purs
- **ES Modules** — import/export natifs du navigateur
- **Service Worker** — cache-first pour l'offline
- **Libs CDN** (esm.sh) — chargées en lazy-load, mises en cache pour l'offline
- **GitHub Pages** — déploiement statique depuis la branche `main`

---

## Structure du projet

```
mdfusion/
├── index.html              # Point d'entrée
├── manifest.json           # Manifeste PWA
├── sw.js                   # Service Worker
├── icons/                  # Icônes PWA (SVG)
├── src/
│   ├── app.js              # Shell de l'application
│   ├── theme.css           # Design system (light/dark, densité)
│   ├── components/         # Composants UI réutilisables
│   ├── converters/         # Convertisseurs par format
│   ├── utils/              # Helpers (DOM, moteur MD, icônes)
│   └── views/              # Vues (Convertir, Fusionner, Éditeur)
└── tests/                  # Fichiers d'exemple pour tester
```

---

## Fichiers de test

Le dossier `tests/` contient des fichiers d'exemple pour chaque format :

- `exemple.txt` — texte brut
- `exemple.json` — structure JSON
- `exemple.csv` — tableau CSV
- `exemple.html` — page HTML
- `exemple.xml` — document XML
- `chapitre-01.md` — Markdown (introduction)
- `chapitre-02.md` — Markdown (formats)
- `chapitre-03.md` — Markdown (guide)

---

## Design

- Thème clair / sombre avec bascule
- Accent terracotta (#d97757)
- Typographie : Hanken Grotesk + JetBrains Mono
- 3 niveaux de densité (compact / regular / confortable)
- Animations respectant `prefers-reduced-motion`

---

## Licence

Ce projet est sous licence [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Vous êtes libre de partager et adapter ce travail, y compris pour un usage commercial, à condition de créditer l'auteur original.

**Auteur** : Bertrand Formet
**Repo** : [github.com/bertrandformet/mdfusion](https://github.com/bertrandformet/mdfusion)
