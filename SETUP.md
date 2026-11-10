# InclusiLab — Οδηγός δημιουργίας repo στο GitHub

## 1. Δημιούργησε το repository

1. Πήγαινε στο [github.com/new](https://github.com/new)
2. **Repository name:** `inclusilab` (ή `akinclusilab.github.io`)
3. Visibility: **Public** (απαιτείται για GitHub Pages δωρεάν)
4. ❌ ΜΗΝ βάλεις README / .gitignore / license (θα τα φορτώσουμε εμείς)
5. Κλικ **Create repository**

## 2. Ανέβασε τον κώδικα

Άνοιξε terminal στον φάκελο `inclusilab/` και τρέξε:

```bash
git init
git add .
git commit -m "Initial InclusiLab site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inclusilab.git
git push -u origin main
```

> Αντικατάστησε `YOUR_USERNAME` με το GitHub username σου.

## 3. Ενεργοποίησε GitHub Pages

1. Settings → **Pages**
2. Source: **GitHub Actions**
3. Αποθήκευσε

Μετά από κάθε `git push` στο `main`, το site χτίζεται αυτόματα σε ~2 λεπτά.

## 4. URL

Το site θα είναι διαθέσιμο στο:
`https://YOUR_USERNAME.github.io/inclusilab/`

Αν θέλεις custom domain (π.χ. `inclusilab.gr`), δες: Settings → Pages → Custom domain.

---

## Δομή αρχείων

```
inclusilab/
├── .github/workflows/deploy.yml   ← GitHub Actions (auto deploy)
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PageLayout.astro
│   ├── pages/
│   │   └── index.astro            ← Αρχική σελίδα
│   ├── styles/
│   │   └── global.css
│   └── content/                   ← MDX αρχεία (άρθρα, φύλλα κ.λπ.)
├── astro.config.mjs
└── package.json
```
