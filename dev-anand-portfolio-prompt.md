# Dev Anand — Video Editor Portfolio + CMS

Build a production-quality full-stack app: a cinematic public portfolio for video editor / motion designer Dev Anand (~1 yr experience), fully driven by a custom admin CMS. Dev manages all content — projects, media, copy — without touching code or redeploying.

## Stack
- **Client** (`/client`): React + Vite + Tailwind + Framer Motion
- **Server** (`/server`): Node.js + Express
- **DB**: PostgreSQL
- **Auth**: email/password, hashed (bcrypt/argon2), HTTP-only secure session cookies, auth middleware on every admin route — never trust client-side checks
- **Media**: storage abstraction (Cloudinary / Supabase / S3-compatible) configured via env vars — never store video blobs in Postgres

## Governing principles (apply throughout; don't restate per feature)
1. All public content comes from the DB via the API — zero hardcoded projects/copy in React.
2. Admin is the only way to change content; edits appear on the public site immediately after save.
3. Admin is visually/functionally distinct: clean, minimal, dark dashboard vs. cinematic, experimental public site.
4. Every list-type admin resource (projects, before/after, services) supports: create, edit, delete-with-confirm, drag-and-drop reorder (persists `displayOrder`), publish/unpublish.
5. Real content only. Never present placeholder media/copy as finished work; never fabricate client results or stats.
6. Where a requirement below is ambiguous, pick the simplest professional-grade solution, note the assumption, and keep building rather than stopping to ask.

## Brand concept — "YOU WATCH. I EDIT."
Cinematic and interactive, not a generic freelancer template. Hero (full-screen): large "DEV ANAND" / "VIDEO EDITOR · MOTION DESIGNER · VISUAL STORYTELLER", statement "YOU WATCH. / I EDIT.", CTA "PLAY SHOWREEL", status dot "● AVAILABLE FOR PROJECTS". Weave in subtle editor-UI motifs (timecode, playhead, REC indicator, timeline) — tasteful, not gimmicky. Empty states use in-voice copy, e.g. "THE TIMELINE IS EMPTY." / "MORE EXPERIMENTS COMING SOON." — never broken images or blank cards.

## Public site sections
Hero → Showreel (the one project marked active) → Selected Work (featured projects) → Before/After (raw vs. final comparison) → Editing Process → Services → Real Client Work → Editing Lab/Experiments → About → Toolkit → Contact.

**Performance & mobile** (applies to every video-heavy section): lazy-load video, poster images, no autoplay-everywhere, pause video when off-screen, respect `prefers-reduced-motion`, responsive video with optional 9:16 mobile source, lazy-loaded images. Admin must also work on mobile (sidebar → responsive drawer).

## Data model (core fields)
- **Project**: id, title, slug, category (Cinematic / Motion Graphics / Social Media / YouTube / Advertisement / Client Work / Personal Experiment), description, shortDescription, videoUrl, thumbnailUrl, mobileVideoUrl, tools[], clientName, projectYear, projectType, featured, published, displayOrder, timestamps. Client Work adds: clientDescription, devRole, servicesProvided[].
- **BeforeAfter**: id, title, description, rawMediaUrl, finalMediaUrl, thumbnailUrl, displayOrder, published.
- **Showreel**: id, videoUrl, thumbnailUrl, title, description, active (enforce single active row).
- **Service**: id, name, description, displayOrder, published.
- **About**: name, role, bio, experience, location, availabilityStatus, profileImageUrl, socialLinks (jsonb).
- **Settings**: siteTitle, heroHeading, heroSubheading, availabilityStatus, accentColor, email, socialLinks, footerText, metaTitle, metaDescription, ogImageUrl.
- **Media**: id, url, filename, type, size, createdAt, usage refs (warn/block delete if a project still uses it).

## Admin panel (`/admin`)

| Route | Purpose |
|---|---|
| `/admin/login` | Email/password, show/hide password, loading + error states |
| `/admin` | Stat cards (total / published / draft / featured / client projects) + recent projects (thumbnail, title, category, status, date, edit/delete) + "New Project" |
| `/admin/projects` | Search, filter by category/status, sort (newest / display order), edit / delete / duplicate / publish-toggle / feature-toggle, drag-and-drop reorder |
| `/admin/projects/new`, `/admin/projects/:id/edit` | Full project form; drag-and-drop upload for video/thumbnail/mobile-video with progress, filename, size, status, preview, replace/remove — stream uploads, never buffer the whole file in memory; accept mp4/webm/mov; offer "generate thumbnail from video frame" if feasible; "Preview Project" rendering exactly as the public page, with Edit/Publish actions; Save Draft vs Publish |
| `/admin/before-after` | CRUD for before/after entries |
| `/admin/showreel` | Edit the showreel, set active/publish |
| `/admin/services` | CRUD + reorder (seed: Short-form Content, YouTube Editing, Motion Graphics, Cinematic Editing, Brand/Promotional Videos, Color Grading, Sound Design) |
| `/admin/about` | Edit About fields |
| `/admin/settings` | Edit Settings fields (site, SEO, social) |
| `/admin/media` | Library — preview, filename, type, size, date; search/filter by type; delete with in-use warning |

Sidebar: "Dev Anand" header → Dashboard → Content (Projects, Before/After, Showreel, Services, About, Media Library) → Settings → View Portfolio / Logout.

## API
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Projects: `GET/POST /api/projects`, `GET /api/projects/:slug`, `PUT/DELETE /api/projects/:id`, `POST /api/projects/:id/publish`, `POST /api/projects/:id/feature`
- Same CRUD shape for `/api/before-after` and `/api/services`
- Singleton `GET/PUT` for `/api/showreel`, `/api/about`, `/api/settings`
- Media: `GET/POST /api/media`, `DELETE /api/media/:id`
- All mutating routes require an authenticated session; validate input and file type/size server-side; return consistent error shapes.

## Security checklist
Hashed passwords · HTTP-only secure session cookies · auth middleware on every admin route · server-side authorization only · input validation & sanitization · file type/size limits on upload · CORS locked to known origins · rate limiting on `/api/auth/login` · no secrets in the client bundle.

## Seed data
Real info only: Dev Anand, ~1 yr experience, Video Editor & Motion Graphics Designer, tools = DaVinci Resolve / After Effects / Premiere Pro / Photoshop, one Client Work entry (Star Excellent Academy — real paid project, role Video Editor/Motion Graphics, no invented metrics). Everything else (video/image assets) ships as clearly labeled placeholders, never presented as finished work.

## Deliverables
`/client` + `/server` apps, Postgres schema + migrations, seed script, `.env.example` for both apps, and a README covering: install, env config, DB creation + migrations, first-admin creation, dev server, production build, storage-provider setup, deploying client/server, domain config, changing admin credentials.

## Suggested build order
1. DB schema + migrations + seed script
2. Auth (hashing, sessions, middleware) + protected API skeleton
3. Media upload/storage abstraction
4. Admin CRUD screens — projects first, then the simpler singleton modules
5. Public site wired to the live API — Hero/Showreel/Selected Work first, then the rest
6. Polish pass — animation, empty states, mobile, performance, `prefers-reduced-motion`

Confirm the schema and API contract before building UI on top of it. Quality bar: this should read as a bespoke cinematic portfolio and a purpose-built CMS, not a generic CRUD admin — and Dev should never need to touch source code to update his portfolio.
