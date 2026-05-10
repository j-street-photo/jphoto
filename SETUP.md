# jphoto — Setup Guide

A step-by-step guide to get the site live. Takes about 1–2 hours total, mostly waiting for things to connect.

---

## What you're setting up

| Component | What it does |
|---|---|
| GitHub | Stores the site files (free) |
| Hugo + nicokaiser/hugo-theme-gallery | Builds the site |
| Cloudflare Pages | Hosts and serves the site (free) |
| Decap CMS | Web UI for uploading photos |

---

## Step 1 — GitHub account

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Create a new **public** repository named `jphoto`
3. Note your GitHub username — you'll need it shortly

---

## Step 2 — Upload the site files

The `jphoto/` folder provided contains all the site config files.

1. Download and install [GitHub Desktop](https://desktop.github.com/) — avoids needing to use Git on the command line
2. Clone your new `jphoto` repository to your Mac
3. Copy all files from the provided `jphoto/` folder into the cloned repository folder
4. In GitHub Desktop, commit all files with a message like `initial setup` and push to main

---

## Step 3 — Add the theme

The theme is pulled in as a Git submodule (a link to the theme's own repository). The `.gitmodules` file is already configured — you just need to initialise it.

Open Terminal and run:

```bash
cd ~/path/to/your/jphoto/folder
git submodule update --init --recursive
git add .
git commit -m "add theme submodule"
git push
```

Replace `~/path/to/your/jphoto/folder` with the actual path where you cloned the repo.

---

## Step 4 — Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and create a free account
2. In the sidebar, go to **Workers & Pages → Pages**
3. Click **Connect to Git** → connect your GitHub account → select the `jphoto` repository
4. Build settings:
   - **Build command:** `hugo --minify`
   - **Build output directory:** `public`
   - **Environment variable:** `HUGO_VERSION` = `0.124.0`
5. Click **Save and Deploy**

Cloudflare will attempt a first build. It may fail on the first run if the submodule isn't fully resolved — if so, trigger a retry from the Pages dashboard.

### Claim your subdomain

In your Pages project settings → **Custom domains** — your default URL will be `jphoto.pages.dev`. If that name is taken, Cloudflare will tell you and you can pick another.

---

## Step 5 — Update config.yml with your GitHub username

Open `static/admin/config.yml` and replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/jphoto   # ← change this
  branch: main
```

Commit and push this change.

---

## Step 6 — Set up Decap CMS authentication

Decap CMS uses GitHub as its login — you'll authenticate via GitHub OAuth.

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** jphoto CMS
   - **Homepage URL:** `https://jphoto.pages.dev`
   - **Authorization callback URL:** `https://api.netlify.com/auth/done`
4. Save — note the **Client ID** and generate a **Client Secret**

Then in Netlify (free account needed just for auth — your site still hosts on Cloudflare):

1. Go to [app.netlify.com](https://app.netlify.com) and create a free account
2. Go to **Site configuration → Access & security → OAuth**
3. Add GitHub as a provider using your Client ID and Client Secret

> **Why Netlify for auth?** Decap CMS needs a small OAuth relay for the GitHub login flow. Netlify provides this for free. Your site and images stay on Cloudflare — Netlify just handles the login handshake.

---

## Step 7 — Test the CMS

1. Go to `https://jphoto.pages.dev/admin`
2. Click **Login with GitHub**
3. You should land in the Decap CMS interface

---

## Step 8 — EXIF stripping (do this before any upload)

Install ExifTool on your Mac:

```bash
brew install exiftool
```

If you don't have Homebrew: [brew.sh](https://brew.sh)

To strip identifying EXIF from a photo before uploading:

```bash
exiftool -gps:all= -SerialNumber= -OwnerName= -Author= -overwrite_original yourphoto.jpg
```

To process a whole folder at once:

```bash
exiftool -gps:all= -SerialNumber= -OwnerName= -Author= -overwrite_original /path/to/folder/
```

---

## Daily use — adding a photo

1. Strip EXIF (Step 8 above)
2. Go to `jphoto.pages.dev/admin`
3. Click **Photos → New Photo**
4. Fill in:
   - **Gallery** — type the folder name (e.g. `uncategorised`, or `street-auckland` for a new gallery)
   - **Photo** — upload the image file
   - **Caption** — optional
5. Click **Publish**

The site rebuilds automatically. Live in ~60 seconds.

---

## Adding a new gallery

1. Go to `jphoto.pages.dev/admin`
2. Click **Galleries → New Gallery**
3. Fill in:
   - **Gallery Name** — the display name (e.g. "Street — Auckland")
   - **Description** — optional text shown at the top of the gallery page
4. The folder name (used when uploading photos) will be the slug version of the name (e.g. `street-auckland`)
5. Click **Publish**

---

## Image resolution

Images are served at full resolution as uploaded. If you want to cap display resolution (recommended — serves a 2400px max rather than your full master file), Cloudinary can be added later as a free image CDN layer. This is straightforward to add once the site is running.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails on Cloudflare | Check that the theme submodule was pushed correctly. Re-trigger build from Pages dashboard. |
| `/admin` shows blank page | Check browser console for errors. Usually a config.yml issue. |
| Photos not appearing after publish | Wait 60–90 seconds for rebuild. Check Pages dashboard for build status. |
| Subdomain `jphoto.pages.dev` taken | Choose a different name in Cloudflare Pages settings and update `baseURL` in `hugo.toml` |

---

## File structure reference

```
jphoto/
├── hugo.toml                  # Site config
├── .gitmodules                # Theme submodule link
├── content/
│   ├── _index.md              # Homepage
│   └── photos/
│       └── uncategorised/     # Default gallery folder
│           └── _index.md
├── static/
│   └── admin/
│       ├── index.html         # CMS entry point
│       └── config.yml         # CMS field definitions
├── layouts/
│   └── partials/
│       └── protect.html       # Right-click/drag protection
└── themes/
    └── hugo-theme-gallery/    # Theme (added via submodule)
```
