# Dev Anand — Video Editor Portfolio + CMS

A production-quality full-stack portfolio for video editor Dev Anand, fully driven by a custom admin CMS. All public content comes from the database via the API — zero hardcoded projects or copy in React.

## Stack

- **Client**: React 18 + Vite + Tailwind CSS v4 + Framer Motion
- **Server**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: bcrypt hashing, express-session with HTTP-only secure cookies
- **Storage**: Local filesystem (default) or Cloudinary (configurable)

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) running locally

### 1. Create the database

```sql
CREATE DATABASE dev_anand_portfolio;
```

### 2. Configure environment

```bash
# Copy example env files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set your database URL, admin credentials, and session secret.

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run migrations & seed

```bash
cd server
npm run migrate    # Creates all tables
npm run seed       # Seeds admin user, about, settings, services, sample project
```

### 5. Start development

```bash
# Terminal 1 — Server (port 5000)
cd server && npm run dev

# Terminal 2 — Client (port 5173)
cd client && npm run dev
```

- **Portfolio**: http://localhost:5173
- **Admin CMS**: http://localhost:5173/admin
- **API**: http://localhost:5000/api

### Default Admin Login

- Email: `admin@devanand.com` (or configured in `ADMIN_EMAIL`)
- Password: `garry@2004` (configured in `ADMIN_PASSWORD`)

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `SESSION_SECRET` | Session encryption secret | — |
| `ADMIN_EMAIL` | Initial admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial admin password | — |
| `CLIENT_URL` | CORS allowed origin | `http://localhost:5173` |
| `STORAGE_PROVIDER` | `local` or `cloudinary` | `local` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |

### Client (`client/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | API base URL | `http://localhost:5000/api` |

## Project Structure

```
├── client/                     # React frontend
│   ├── src/
│   │   ├── admin/              # Admin CMS pages
│   │   ├── components/         # Shared components (Nav, Footer)
│   │   ├── contexts/           # Auth context
│   │   ├── lib/                # API client
│   │   └── pages/              # Public site pages
│   └── index.html
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # Database config
│   │   ├── db/                 # Migrations & seed
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── routes/             # API routes
│   │   └── services/storage/   # Storage adapters
│   └── uploads/                # Local file storage
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Admin login |
| `POST` | `/api/auth/logout` | No | Admin logout |
| `GET` | `/api/auth/me` | No | Check session |
| `GET` | `/api/projects` | No | Published projects |
| `GET` | `/api/projects/:slug` | No | Single project |
| `GET` | `/api/projects/admin/all` | Yes | All projects |
| `GET` | `/api/projects/admin/stats` | Yes | Dashboard stats |
| `POST` | `/api/projects` | Yes | Create project |
| `PUT` | `/api/projects/:id` | Yes | Update project |
| `DELETE` | `/api/projects/:id` | Yes | Delete project |
| `PATCH` | `/api/projects/:id/publish` | Yes | Toggle publish |
| `PATCH` | `/api/projects/:id/feature` | Yes | Toggle featured |
| `PUT` | `/api/projects/admin/reorder` | Yes | Reorder projects |
| `POST` | `/api/projects/:id/duplicate` | Yes | Duplicate project |
| `GET/POST` | `/api/before-after` | Mixed | Before/After CRUD |
| `GET/PUT` | `/api/showreel` | Mixed | Showreel (singleton) |
| `GET/POST` | `/api/services` | Mixed | Services CRUD |
| `GET/PUT` | `/api/about` | Mixed | About (singleton) |
| `GET/PUT` | `/api/settings` | Mixed | Settings (singleton) |
| `GET/POST` | `/api/media` | Mixed | Media library |
| `DELETE` | `/api/media/:id` | Yes | Delete media (in-use check) |

## Storage Provider Setup

### Local (default)
Files are saved to `server/uploads/` and served via Express static middleware. No configuration needed.

### Cloudinary
1. Create a [Cloudinary](https://cloudinary.com/) account
2. Set in `server/.env`:
   ```
   STORAGE_PROVIDER=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Deploying to Netlify

This project is configured to deploy as a **Netlify site** with the Express backend running as a **Netlify Function**.

### Prerequisites

1. **Cloud PostgreSQL** — [Neon](https://neon.tech/) (free tier) is recommended
2. **Cloudinary account** — for media storage (serverless has no filesystem)
3. **GitHub repo** — push this project to a GitHub repository

### Step 1: Set up Neon (free Postgres)

1. Go to [neon.tech](https://neon.tech/) and create a project
2. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
3. Run migrations against Neon:
   ```bash
   DATABASE_URL="your-neon-connection-string" npm run migrate --prefix server
   DATABASE_URL="your-neon-connection-string" npm run seed --prefix server
   ```

### Step 2: Set up Cloudinary

1. Create a [Cloudinary](https://cloudinary.com/) account (free tier: 25GB storage)
2. Copy your Cloud Name, API Key, and API Secret from the dashboard

### Step 3: Deploy to Netlify

1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com/) → **Add new site** → **Import from Git**
3. Select your repository
4. Netlify will auto-detect `netlify.toml` — the build settings are already configured
5. Add these **Environment Variables** in Netlify → Site settings → Environment Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `SESSION_SECRET` | A long random string (32+ chars) |
| `NODE_ENV` | `production` |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Your admin password |
| `CLIENT_URL` | Your Netlify site URL (e.g. `https://devAnand.netlify.app`) |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

6. Click **Deploy site**

### How it works

```
Client (React)          → Netlify static hosting (client/dist/)
/api/* requests         → Netlify redirect → /.netlify/functions/api
Express server          → Netlify Function (serverless-http wrapper)
Database                → Neon PostgreSQL (cloud)
Media uploads           → Cloudinary (cloud)
```

### Custom Domain

In Netlify → Domain settings → Add a custom domain. Netlify provides free SSL.

## Local Development

```bash
# Start both servers locally (uses local Postgres + local file storage)
cd server && npm run dev    # Port 5000
cd client && npm run dev    # Port 5173
```

The Vite dev server proxies `/api` requests to `localhost:5000`, so everything works seamlessly.

## Admin Panel & Credentials

- **Admin Login URL:** `http://localhost:5173/admin/login` (or `/admin/login` on production)
- **Default Email:** `admin@devanand.com`
- **Default Password:** `garry@2004`

### Changing Admin Credentials

You can change your admin password in two ways:
1. **Via Admin Panel UI:** Navigate to `/admin/settings` → **Admin Security & Password** section, enter your current password and your new password.
2. **Via Command Line:**
```bash
# Update server/.env then re-run seed:admin
ADMIN_EMAIL=new@email.com ADMIN_PASSWORD=new-strong-password npm run seed:admin --prefix server
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- In-app password rotation endpoint (`PUT /api/auth/password`) with current password verification
- HTTP-only secure session cookies
- Auth middleware on all admin routes
- Server-side input validation with Joi
- File type/size limits on upload (500MB max)
- CORS locked to configured origins with defensive hostname parsing
- Rate limiting on login (5 attempts / 15 min)
- Helmet security headers
- No secrets in the client bundle

---

## 🚀 Hosting on GitHub Pages (100% Free)

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) to automatically build and deploy your React frontend to **GitHub Pages** completely for free.

### Step 1: Create a GitHub Repository & Push
Run the included PowerShell helper script or execute these commands:
```powershell
# Automated helper:
.\deploy-to-github.ps1
```
Or manually:
```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The deployment workflow will trigger automatically whenever you push to `main`!

### Step 3: Configure Production API (Optional Backend)
In your repository's **Settings** → **Secrets and variables** → **Actions**, add:
- `VITE_API_URL`: Your backend API URL (e.g. `https://your-backend.onrender.com/api` or `https://your-site.netlify.app/.netlify/functions/api`)

---

## ⚡ Using GitHub as a Free CDN for Videos & Media

Never pay for video or image hosting. You can host up to 2GB videos and fast global assets for free using GitHub:

1. **Large Videos (up to 2 GB per video)**:
   - Go to your repository → **Releases** → **Draft a new release**.
   - Create tag `v1.0.0-media` and attach your `.mp4`/`.webm`/`.mov` files.
   - Click **Publish release**.
   - Copy the direct asset link: `https://github.com/<user>/<repo>/releases/download/v1.0.0-media/<filename>.mp4`
   - Paste directly into your Admin Panel for Showreel or Projects! The universal player streams it instantly with HTTP range request support.

2. **High-Res Images via jsDelivr CDN**:
   - Place images in the [`media/`](file:///c:/Users/USER/Projects/video%20editing%20portfolio/media) folder and push to GitHub.
   - Use the high-speed jsDelivr CDN URL:
     `https://cdn.jsdelivr.net/gh/<user>/<repo>@main/media/<filename>.jpg`



