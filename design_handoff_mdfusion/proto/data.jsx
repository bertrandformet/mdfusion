// proto/data.jsx — fichiers d'exemple + leur conversion Markdown.

const FORMATS = {
  pdf: { label: 'PDF', lazy: true },
  docx: { label: 'DOCX', lazy: true },
  xlsx: { label: 'XLSX', lazy: true },
  csv: { label: 'CSV', lazy: false },
  html: { label: 'HTML', lazy: false },
  epub: { label: 'EPUB', lazy: true },
  png: { label: 'IMG', lazy: false },
  xml: { label: 'XML', lazy: false },
  json: { label: 'JSON', lazy: false },
  pptx: { label: 'PPTX', lazy: false, unsupported: true },
};

// Banque de documents pour la vue Convertir (cliquer la dropzone en ajoute).
const SAMPLE_DOCS = [
  {
    id: 'd1', name: 'rapport-trimestriel.pdf', ext: 'pdf', size: '2,4 Mo',
    md: `# Rapport trimestriel\n\nSynthèse des résultats du troisième trimestre, consolidée à partir des sources fournies.\n\n## Indicateurs clés\n\n| Trimestre | Revenu | Marge |\n| --- | --- | --- |\n| T1 | 1,2 M€ | 18 % |\n| T2 | 1,5 M€ | 21 % |\n| T3 | 1,9 M€ | 24 % |\n\n> La croissance reste portée par l'acquisition organique.`,
  },
  {
    id: 'd2', name: 'contrat-prestation.docx', ext: 'docx', size: '184 Ko',
    md: `# Contrat de prestation\n\nEntre les **soussignés**, il a été convenu ce qui suit pour la période couvrant l'exercice en cours.\n\n## Article 1 — Objet\n\nLe prestataire s'engage à fournir les livrables décrits en *annexe A*.\n\n## Article 2 — Durée\n\n- Début : 1er janvier 2026\n- Fin : 31 décembre 2026`,
  },
  {
    id: 'd3', name: 'budget-2026.xlsx', ext: 'xlsx', size: '412 Ko',
    md: `# Budget 2026\n\n| Poste | Prévu | Réalisé |\n| --- | --- | --- |\n| Salaires | 820 k€ | 790 k€ |\n| Marketing | 240 k€ | 268 k€ |\n| R&D | 510 k€ | 502 k€ |`,
  },
  {
    id: 'd4', name: 'inventaire.csv', ext: 'csv', size: '28 Ko',
    md: `# Inventaire\n\n| Référence | Stock | Statut |\n| --- | --- | --- |\n| RF-001 | 142 | OK |\n| RF-002 | 0 | Rupture |\n| RF-003 | 57 | OK |`,
  },
  {
    id: 'd5', name: 'landing-page.html', ext: 'html', size: '64 Ko',
    md: `# Page d'accueil\n\nConvertissez n'importe quel document en Markdown, **100 % hors-ligne**.\n\n- Aucune donnée n'est envoyée\n- Fonctionne dans le navigateur\n- Installable comme application\n\n[Commencer maintenant](#)`,
  },
  {
    id: 'd6', name: 'schema-api.json', ext: 'json', size: '12 Ko',
    md: `# Schéma API\n\n\`\`\`json\n{\n  "endpoint": "/convert",\n  "method": "POST",\n  "accepts": ["pdf", "docx", "xlsx"],\n  "returns": "text/markdown"\n}\n\`\`\``,
  },
  {
    id: 'd7', name: 'notes-reunion.epub', ext: 'epub', size: '320 Ko',
    md: `# Notes de réunion\n\n## Présents\n\n- Direction produit\n- Équipe ingénierie\n\n## Décisions\n\n1. Lancer la bêta hors-ligne en mars\n2. Prioriser la conversion PDF`,
  },
  {
    id: 'd8', name: 'capture-tableau.png', ext: 'png', size: '1,1 Mo',
    md: `# capture-tableau.png\n\n*Métadonnées EXIF extraites :*\n\n| Champ | Valeur |\n| --- | --- |\n| Dimensions | 1920 × 1080 |\n| Appareil | Capture écran |\n| Date | 2026-02-14 |`,
  },
];

// Fichiers Markdown pour la vue Fusionner.
const SAMPLE_MD = [
  {
    id: 'm1', name: 'chapitre-01-introduction.md', ext: 'md', size: '4 Ko',
    md: `# Introduction\n\nCe guide décrit l'architecture hors-ligne de l'application.\n\n## Contexte\n\nLes utilisateurs travaillent souvent sans connexion fiable.`,
  },
  {
    id: 'm2', name: 'chapitre-02-installation.md', ext: 'md', size: '6 Ko',
    md: `# Installation\n\nL'application s'installe comme une PWA depuis le navigateur.\n\n## Prérequis\n\n- Un navigateur récent\n- 50 Mo d'espace disque`,
  },
  {
    id: 'm3', name: 'chapitre-03-utilisation.md', ext: 'md', size: '9 Ko',
    md: `# Utilisation\n\n## Convertir\n\nGlissez vos fichiers, ajustez les options, exportez.\n\n## Fusionner\n\nAssemblez plusieurs Markdown en un seul.`,
  },
  {
    id: 'm4', name: 'annexe-glossaire.md', ext: 'md', size: '3 Ko',
    md: `# Annexe — Glossaire\n\n| Terme | Définition |\n| --- | --- |\n| PWA | Application web installable |\n| MD | Markdown |`,
  },
];

const EDITOR_SAMPLE = `# Bienvenue dans l'éditeur

Écrivez du **Markdown** à gauche, l'aperçu se met à jour à droite.

## Ce que vous pouvez faire

- Mettre en *italique* ou en **gras**
- Insérer du \`code\` en ligne
- Créer des listes et des tableaux

| Raccourci | Action |
| --- | --- |
| Ctrl B | Gras |
| Ctrl I | Italique |

> Tout fonctionne hors-ligne, sans serveur.

\`\`\`js
export function convertir(fichier) {
  return versMarkdown(fichier);
}
\`\`\`
`;

Object.assign(window, { FORMATS, SAMPLE_DOCS, SAMPLE_MD, EDITOR_SAMPLE });
