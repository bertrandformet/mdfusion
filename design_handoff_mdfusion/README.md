# Handoff : MDFusion — App offline de conversion & fusion Markdown

## Overview

MDFusion est une **PWA hors-ligne** qui réunit trois outils dans une seule interface :

1. **Convertir** — transformer plusieurs documents (PDF, DOCX, XLSX, CSV, HTML, EPUB, images, XML, JSON) en **un seul fichier Markdown** fusionné.
2. **Fusionner** — assembler plusieurs fichiers `.md` existants en un seul.
3. **Éditeur** — écrire du Markdown à la main avec aperçu live.

Ce bundle documente le **design de l'interface** (direction visuelle « Console », inspirée Vercel/Linear, minimalisme suisse). La logique de conversion réelle (parsing PDF, DOCX, etc.) n'est **pas** couverte ici — voir le plan technique d'origine pour la stack (Vite, pdfjs-dist, mammoth, xlsx, etc.). Ce document décrit **l'UI à recréer**.

## About the Design Files

Les fichiers de ce bundle sont des **références de design réalisées en HTML/React** (prototype montrant l'apparence et le comportement voulus) — **pas du code de production à copier tel quel**.

Le prototype est écrit en React via Babel in-browser (un seul fichier HTML + modules JSX). La tâche consiste à **recréer ce design dans l'environnement cible**. Le plan d'origine prévoit **Vanilla JS + Vite** ; adaptez donc les composants React documentés ici en modules Vanilla JS (ou conservez un framework léger si l'équipe préfère), en réutilisant les **tokens CSS** fournis tels quels (ils sont déjà en CSS pur, directement réutilisables).

## Fidelity

**High-fidelity (hifi).** Couleurs, typographie, espacements, rayons, ombres et micro-interactions sont définitifs. Recréez l'UI au pixel près à partir des tokens et mesures ci-dessous. Le fichier `proto/theme.css` est du **CSS pur réutilisable directement** — c'est la source de vérité des tokens.

---

## Design Tokens

Tous les tokens vivent dans `proto/theme.css` sous forme de variables CSS. **Réutilisez ce fichier tel quel.**

### Couleurs — thème clair (`:root`)
| Token | Valeur | Usage |
|---|---|---|
| `--accent` | `#d97757` | Terracotta, couleur d'action principale |
| `--accent-ink` | `#ffffff` | Texte sur fond accent |
| `--accent-bg` | `rgba(217,119,87,0.10)` | Fond accent ténu (pastilles, icônes) |
| `--bg-canvas` | `#f6f5f2` | Fond global de l'app |
| `--bg-surface` | `#ffffff` | Cartes, header |
| `--bg-inset` | `#fbfaf8` | Zones en creux (dropzone, en-têtes de panneau) |
| `--bg-soft` | `#f1efeb` | Fonds doux (segmented, badges) |
| `--ink` | `#1c1b1a` | Texte principal |
| `--sub` | `#76736d` | Texte secondaire |
| `--faint` | `#a4a09a` | Texte tertiaire / méta |
| `--line` | `#e9e7e2` | Bordures |
| `--line-strong` | `#ddd9d2` | Bordures appuyées, scrollbar |
| `--ok` | `#1f8a5b` | Indicateur « prêt / hors-ligne » |

### Couleurs — thème sombre (`[data-theme="dark"]`)
| Token | Valeur |
|---|---|
| `--accent` | `#e08862` |
| `--accent-ink` | `#1a1411` |
| `--bg-canvas` | `#100f0e` |
| `--bg-surface` | `#1a1816` |
| `--bg-inset` | `#211e1b` |
| `--bg-soft` | `#242120` |
| `--ink` | `#f1ede7` |
| `--sub` | `#9c968c` |
| `--faint` | `#6a655d` |
| `--line` | `#2b2825` |
| `--line-strong` | `#36322e` |

Le toggle de thème pose `data-theme="light|dark"` sur `<html>`. L'accent est légèrement éclairci en sombre (fonction `lighten()` dans `app.jsx`) et `--accent-bg` est recalculé à l'opacité 0.18 (vs 0.11 en clair).

### Ombres
| Token | Valeur |
|---|---|
| `--shadow` | `0 1px 2px rgba(20,18,16,0.05)` |
| `--shadow-pop` | `0 8px 28px rgba(20,18,16,0.14), 0 0 0 1px rgba(0,0,0,0.04)` (toasts/popovers) |
| Bouton primaire | `0 1px 2px rgba(217,119,87,0.4)` |

### Rayons & densité
Trois densités via `[data-density="compact|regular|comfy"]`. Valeurs en **regular** (défaut) :
| Token | compact | regular | comfy |
|---|---|---|---|
| `--radius` | 8px | **10px** | 13px |
| `--radius-sm` | 6px | **7px** | 9px |
| `--gap` | 11px | **16px** | 22px |
| `--pad` | 12px | **16px** | 22px |
| `--row-pad` | 7px | **10px** | 14px |

### Typographie
| Token | Stack |
|---|---|
| `--sans` | `"Hanken Grotesk", system-ui, -apple-system, sans-serif` |
| `--mono` | `"JetBrains Mono", ui-monospace, "SF Mono", monospace` |

Google Fonts chargées : **Hanken Grotesk** (400/500/600/700) et **JetBrains Mono** (400/500/600).
La mono sert systématiquement à la **donnée technique** : noms de fichiers, tailles, formats, séparateurs, comptes.

Échelle de texte observée :
- Titre de carte / H1 aperçu : 23px / 700 / letter-spacing -0.02em
- H2 aperçu : 17px / 700
- Corps : 13–14px / 1.65
- Labels d'option (mono) : 10.5px / letter-spacing 0.06em / majuscules
- Méta (mono) : 10–12px

---

## Layout global (shell)

`app.jsx` → composant `App`. Structure verticale plein écran (`100vh`, `overflow:hidden`) :

1. **Header** (hauteur **56px**, `--bg-surface`, bordure basse `--line`, padding latéral 20px, gap 16px) :
   - **Logo** : carré 25×25, `--radius` 7px, fond `--ink`, lettre « M » mono 13px/700 en `--bg-surface` ; suivi du wordmark « MDFusion » (15px / 700 / -0.02em).
   - **Nav segmentée** (fond `--bg-soft`, bordure `--line`, `--radius-sm`, padding 3px, gap 2px) : 3 onglets **Convertir / Fusionner / Éditeur**, chacun avec icône 14px + label 13px. Onglet actif : fond `--bg-surface`, poids 600, `--shadow` ; inactif : transparent, `--sub`, poids 500.
   - **Statut** (à droite) : pastille ronde 7px `--ok` + « Hors-ligne · prêt » (12.5px `--sub`).
   - **Bouton thème** : 34×34, bordure `--line`, icône lune/soleil 16px.
2. **Main** (`flex:1`, scroll, padding `--gap`) : conteneur centré `max-width:1320px`, contient la vue active.
3. **Toasts** : `position:fixed`, bas-centre, empilés.
4. **Tweaks panel** (overlay, voir plus bas).

Navigation : état `view ∈ {convert, merge, editor}`. Les états des 3 vues sont **persistés indépendamment** (remontés dans `App`) pour survivre au changement d'onglet.

---

## Screens / Views

### 1. Convertir (`view-convert.jsx`)
**Purpose** : ajouter N documents, régler les options, générer 1 Markdown fusionné.

**Layout** : grille 2 lignes `auto 1fr`, gap `--gap`.
- **Ligne 1 — Pipeline strip** (détail signature) : 3 cartes reliées par des flèches `→` (icône 17px `--faint`). Chaque carte : titre 13.5px/600 + sous-ligne mono 10px. Cartes : `[N sources / liste formats]` → `[Fusion / libellé séparateur]` → `[1 Markdown / resultat.md · ~taille]`. La **3e carte** est mise en avant : bordure `--accent`, fond `--accent-bg`, texte accent.
- **Ligne 2 — grille 2 colonnes `1.05fr 1fr`**, gap `--gap` :
  - **Colonne gauche** (flex column, gap `--gap`) :
    - **Dropzone** (voir composant).
    - **FileList** (voir composant) — `flex:1`.
    - **Options** (row, gap 20, wrap) : `SÉPARATEUR` → segmented `--- / # Nom / Aucun` ; `TITRES` → toggle + « Imbriquer sous le document ».
    - **Actions** (row, gap 10) : bouton primaire pleine largeur **« Convertir & fusionner »** (icône éclair) + bouton ghost **« Copier »** (icône copy) + bouton ghost **« .md »** (icône download).
  - **Colonne droite** : **PreviewPane** (voir composant), nom `resultat.md`.

**Génération du Markdown** (`buildMarkdown`) :
- Bloc par fichier = son `.md` (titres décalés +1 si toggle « imbriquer » actif, via `offsetHeadings`).
- Si séparateur `# Nom` : préfixer chaque bloc de `# <nom-sans-extension>`.
- Jointure : `\n\n---\n\n` si séparateur `---`, sinon `\n\n`.
- Recalculé en live (`useMemo`) à chaque changement de fichiers/options.

**Action « Convertir »** : passe tous les fichiers en statut `run`, puis les bascule en `ok` un par un toutes les 160ms (animation séquentielle), puis toast « Conversion terminée ».

État par défaut : 6 fichiers d'exemple déjà en statut `ok`, séparateur `---`, imbrication off.

### 2. Fusionner (`view-merge.jsx`)
**Purpose** : assembler des `.md` dans un ordre choisi.

**Layout** : grille 2 colonnes `1.05fr 1fr`.
- **Gauche** : 
  - **Carte d'intro** : icône calques 34×34 (fond `--accent-bg`/accent) + titre « Fusion de fichiers Markdown » + sous-texte + compteur mono à droite (`N fichiers → X Ko`).
  - **Dropzone compacte** (hint « fichiers **.md** uniquement », pas de liste de formats).
  - **FileList** (`flex:1`, titre « Markdown »).
  - **Options** : `SÉPARATEUR` (segmented identique) + `NIVEAUX DE TITRE` → **Stepper** (− / valeur / +, plage −2…+3, signe affiché, accent si ≠ 0).
  - **Actions** : primaire « Fusionner & exporter » (icône merge) + ghost « Copier ».
- **Droite** : PreviewPane, nom `fusion.md`.

**Génération** (`buildMerge`) : identique à Convertir mais l'offset de titres est **numérique** (le stepper) au lieu d'un booléen.

État par défaut : 4 fichiers `.md` d'exemple, séparateur `---`, offset 0.

### 3. Éditeur (`view-editor.jsx`)
**Purpose** : écrire du Markdown avec aperçu live.

**Layout** : flex column, gap `--gap`.
- **Barre d'outils** (carte, padding 6px 8px) : 8 boutons icône 32×30 (Titre, Gras, Italique, Code, Liste, Citation, Lien, Tableau) ; séparateur vertical ; compteur « N mots » (mono 11px) ; à droite segmented **Édition / Partagé / Aperçu**.
- **Zone** : grille `1fr 1fr` en mode Partagé, sinon `1fr`.
  - **Éditeur** : carte avec en-tête (`icône edit + document.md`) puis `<textarea>` mono 13px / line-height 1.7, padding 20px 24px, fond transparent, `resize:none`, `tabSize:2`.
  - **Aperçu** : carte avec en-tête (`icône eye + aperçu` + bouton « Copier ») puis rendu `.md-body`.

**Toolbar** : chaque bouton applique une transformation sur la sélection du textarea (wrap `**`/`*`/`` ` ``, préfixe de ligne `# `/`- `/`> `, insertion de bloc tableau, lien `[texte](url)`). Le curseur est repositionné après insertion.

---

## Composants réutilisables (`ui.jsx`)

### Btn
Variantes `primary | ghost | soft | quiet`, tailles `md (h38) | sm`. Icône optionnelle (15px) + label 13.5px/600. Primary = fond accent + ombre accent ; ghost = surface + bordure `--line` (hover `--line-strong`).

### Segmented
Pistes sur fond `--bg-soft`, bordure `--line`, `--radius-sm`, padding 3px. Item actif : fond `--bg-surface`, `--shadow`, poids 600. Option `mono` pour libellés monospace (ex. `---`).

### Toggle
38×22, rond. Off : `--line-strong`. On : `--accent`. Pastille 18px blanche, transition `left .16s cubic-bezier(.2,.7,.3,1)`.

### StatusPill
Pastille arrondie (radius 20) mono 10.5px. États :
- `ok` → « Converti », texte `--accent`, fond `--accent-bg`.
- `run` → « En cours » + spinner 8px (border + rotation `spin .7s linear infinite`), `--sub` / `--bg-soft`.
- `wait` → « En attente », `--faint` / `--bg-soft`.
- `err` → « Erreur », `#cf4b3b` / `rgba(207,75,59,0.12)`.

### FmtBadge
Badge mono 10px du format (PDF, DOCX…), `min-width:44px`, fond `--bg-canvas`, bordure `--line`, radius 5px.

### Kbd
Touche clavier : mono 11px, bordure `--line` (bas 2px), radius 5px.

### Card
Surface `--bg-surface`, bordure `--line`, `--radius`, `--shadow`, padding `--pad` (ou `flush` pour 0).

### DropZone
Bordure **dashed 1.5px** `--line-strong` (→ `--accent` au survol/drag), fond `--bg-inset` (→ `--accent-bg`). Contenu centré : icône upload 19px dans carré 40×40 arrondi (`--accent-bg`/accent) ; « Déposez ou **parcourez** » (14px/600, parcourez en accent) ; hint « ou collez avec ⌘ V » (kbd) ; ligne de formats mono 9.5px `--faint` (masquée en mode `compact`). Tous les textes en `white-space:nowrap`. Cliquable + handlers `dragover/drop`.

### FileList
Carte `flush`. En-tête : « <titre> · N » + « glisser pour réordonner » (mono `--faint`). Lignes (hauteur `34px + --row-pad`, bordure basse `--line`) :
`[poignée grip 15px --faint] [FmtBadge] [nom flex:1 ellipsis] [taille mono 11px --faint nowrap] [StatusPill] [bouton × au hover]`.
**Réordonnable par drag natif** (`draggable`, `onDragStart/Over/Drop`) : la ligne tirée passe à `opacity:0.4`, la cible reçoit un liseré haut `inset 0 2px 0 --accent`. Bouton × retire la ligne. Apparition de ligne : classe `row-in` (translation seule).

### PreviewPane
Carte `flush`, hauteur 100%. En-tête (`--bg-inset`) : 3 pastilles « feu tricolore » (10px, `#e0584a/#e3b341/#3ea76a`) + nom de fichier mono 12px + segmented **Rendu / Source** (sm) à droite. Corps scrollable padding 22px 26px : `.md-body` (HTML rendu) ou `.md-source` (texte brut mono). État vide : icône fichier + message centré.

### Moteur Markdown (`engine.jsx`)
`mdToHtml(md)` : parseur maison gérant titres `#`–`######`, **gras** `**`, *italique* `*`, `` `code` ``, liens `[t](u)`, listes `-`/`1.`, tableaux `| … |`, citations `>`, blocs ``` ``` ``` (avec label de langage), `---`. `offsetHeadings(md, n)` décale les niveaux. `wordCount(md)`. Le style du rendu est dans `theme.css` (`.md-body …`).

---

## Interactions & Behavior

- **Navigation** : clic onglet → bascule `view`, transition d'entrée `view-in` (translation `translateY(8px)→0`, .26s).
- **Ajout de fichier** : clic sur la dropzone (ou drop) → ajoute le prochain doc d'exemple non utilisé + toast « Fichier ajouté ».
- **Réordonnancement** : drag natif des lignes (voir FileList).
- **Suppression** : bouton × sur la ligne.
- **Options → aperçu** : tout changement (séparateur, imbrication, offset, ordre, ajout/retrait) **régénère l'aperçu en direct**.
- **Conversion** : animation séquentielle des statuts (160ms/fichier) + toast final.
- **Copier** : `navigator.clipboard.writeText(md)` + toast.
- **Éditeur** : frappe → aperçu live ; boutons toolbar → transformation de sélection.
- **Thème** : toggle header → `data-theme` clair/sombre, transition `background/color .25s`.
- **Toasts** : apparaissent en bas-centre, auto-disparition après 2600ms. Icône + message ; variante `warn` en rouge.

### ⚠️ Règle d'animation importante
Les animations d'entrée (`view-in`, `row-in`) **n'animent que `transform`, jamais l'opacité**, et les keyframes opacité sont gateées sous `@media (prefers-reduced-motion: no-preference)`. Raison : une animation `opacity:0→1` figée (onglet en arrière-plan / rendu throttlé) laissait le contenu **invisible**. Conservez ce principe : l'état de base doit toujours être visible.

## State Management

State remonté dans `App` :
- `view` : onglet actif.
- `convert` : `{ files[], sep, nest }`.
- `merge` : `{ files[], sep, offset }`.
- `editor` : `{ doc }`.
- `toasts[]` : file de notifications (hook `useToasts`).
- Tweaks (via `useTweaks`) : `{ accent, font, density, dark }` — appliqués en effet de bord sur `:root` (data-attrs + variables CSS).

Un fichier = `{ id, name, ext, size, md, st? }` où `st ∈ {ok, run, wait, err}`.

## Tweaks (panneau de réglages)

`proto/tweaks-panel.jsx` (scaffold). Contrôles exposés :
- **Accent** : nuancier `#d97757` (défaut), `#2a6fdb`, `#1f8a5b`, `#7a5ae0`.
- **Police** : Hanken Grotesk / Helvetica / Système.
- **Densité** : compact / regular / comfy.
- **Mode sombre** : toggle.

Dans une implémentation Vanilla, ce panneau peut devenir un simple panneau de préférences ; l'essentiel est que les 4 réglages pilotent les mêmes variables CSS.

## Assets

- **Aucune image externe.** Toutes les icônes sont des **SVG inline** (stroke, `currentColor`) définies dans `proto/icons.jsx` — réutilisez votre librairie d'icônes maison équivalente (upload, copy, download, grip, x, plus, arrow, moon/sun, layers, edit, file, eye, code, bold, italic, h1, list, table, link, quote, bolt, spinner).
- **Fonts** : Hanken Grotesk + JetBrains Mono (Google Fonts) — ou équivalents de votre design system.

## Files

| Fichier | Rôle |
|---|---|
| `MDFusion — Prototype.html` | Point d'entrée, ordre de chargement des scripts |
| `proto/theme.css` | **Tokens + styles (source de vérité, CSS pur réutilisable)** |
| `proto/engine.jsx` | Moteur Markdown + helpers de fusion |
| `proto/data.jsx` | Fichiers d'exemple + leur conversion |
| `proto/icons.jsx` | Jeu d'icônes SVG inline |
| `proto/ui.jsx` | Primitives (Btn, Segmented, Toggle, StatusPill, Card, DropZone, FileList, PreviewPane…) |
| `proto/view-convert.jsx` | Vue Convertir |
| `proto/view-merge.jsx` | Vue Fusionner |
| `proto/view-editor.jsx` | Vue Éditeur |
| `proto/app.jsx` | Shell : header, nav, thème, toasts, tweaks |
| `proto/tweaks-panel.jsx` | Scaffold du panneau de réglages |

Pour visualiser le design : ouvrir `MDFusion — Prototype.html` dans un navigateur.
