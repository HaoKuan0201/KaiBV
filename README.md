# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Deployment (GitHub Pages)

This project is set up to deploy the built `dist` folder to GitHub Pages using GitHub Actions.

- Site URL: `https://HaoKuan0201.github.io/KaiGO/`
- Vite `base` is set to `/KaiGO/` in `vite.config.ts` so assets and router paths resolve correctly.

Quick steps to publish from your machine:

1. Install Git for Windows if you don't have it: https://git-scm.com/download/win
2. (Optional) Install GitHub CLI: https://cli.github.com/
3. From project root in PowerShell:

```powershell
cd E:\Project\KaiGo
git init
git add .
git commit -m "chore: add .gitignore and GitHub Pages workflow"
git branch -M main
# Using gh CLI to create private repo and push (recommended):
gh auth login
gh repo create HaoKuan0201/KaiGO --private --source=. --remote=origin --push
# Or create repo on GitHub web, then:
# git remote add origin https://github.com/HaoKuan0201/KaiGO.git
# git push -u origin main
```

4. After pushing, GitHub Actions will build and deploy. Wait a few minutes and visit the site URL above.

Notes:
- Keep Supabase `service_role` keys out of the repo. Use GitHub Secrets (`Settings → Secrets → Actions`) for any server keys.
- If you use vue-router history mode, deep-links may 404 on GitHub Pages. Consider using `createWebHashHistory()` or configure fallback to `index.html`.
