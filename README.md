# LoveLink Studio

LoveLink Studio is a premium web app for creating beautiful personalized surprise pages with photos, emotional text, animations, and a shareable public URL.

## Core idea
Users can:
- upload photos,
- write a custom message,
- choose a visual theme,
- publish the page,
- send the generated URL to someone special.

When the recipient opens the link, they see a stunning surprise page designed with motion, imagery, and heartfelt content.

---

## Tech stack
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Animations:** Framer Motion
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Image hosting:** Cloudinary
- **Deployment:** Vercel

---

## Recommended GitHub repository setup
Create a repository named:

```bash
lovelink-studio
```

### Industry-level branch strategy
- `main` → production-ready branch
- `develop` → active integration branch
- `feature/<name>` → new features
- `fix/<name>` → bug fixes

Example:
```bash
git checkout -b feature/create-memory-builder
```

---

## Local setup

### 1. Create the Next.js app folder
This starter already contains the project code. If building manually:

```bash
npx create-next-app@latest lovelink-studio --typescript --tailwind --app
cd lovelink-studio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Copy environment file
```bash
cp .env.example .env
```

### 4. Update `.env`
Set your values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lovelink_studio?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 5. Setup PostgreSQL database
Create the database:

```sql
CREATE DATABASE lovelink_studio;
```

### 6. Run Prisma migration
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 7. Start development server
```bash
npm run dev
```

Open:
```bash
http://localhost:3000
```

---

## Database design

### `MemoryProject`
Stores the surprise page data.

Fields:
- `id`
- `slug`
- `title`
- `recipient`
- `sender`
- `occasion`
- `message`
- `accentText`
- `musicUrl`
- `eventDate`
- `theme`
- `coverImage`
- `createdAt`
- `updatedAt`

### `GalleryImage`
Stores page gallery images linked to a memory project.

Fields:
- `id`
- `imageUrl`
- `altText`
- `sortOrder`
- `projectId`
- `createdAt`

---

## Important routes

### Public routes
- `/` → landing page
- `/create` → memory page builder
- `/p/[slug]` → public surprise page

### API routes
- `POST /api/upload` → uploads image to Cloudinary
- `POST /api/memories` → creates a memory project
- `GET /api/memories` → lists created projects

---

## Suggested production upgrades
For version 2, add:
- authentication with Clerk or NextAuth
- dashboard for each user
- private/unlisted pages
- view counter analytics
- password protected surprise pages
- scheduled publish date
- page templates
- background music player
- Stripe premium templates
- mobile app with React Native or Flutter

---

## How to push to GitHub

### 1. Initialize git
```bash
git init
```

### 2. Add files
```bash
git add .
git commit -m "feat: initial LoveLink Studio MVP"
```

### 3. Create GitHub repository
Create a new repository on GitHub named `lovelink-studio`.

### 4. Connect remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/lovelink-studio.git
```

### 5. Push code
```bash
git branch -M main
git push -u origin main
```

---

## Suggested folder structure

```bash
lovelink-studio/
├── app/
│   ├── api/
│   │   ├── memories/route.ts
│   │   └── upload/route.ts
│   ├── create/page.tsx
│   ├── p/[slug]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CreateMemoryForm.tsx
│   ├── FeatureGrid.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── MemoryCard.tsx
│   └── Navbar.tsx
├── lib/
│   ├── cloudinary.ts
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Deployment on Vercel
1. Push repo to GitHub
2. Import project into Vercel
3. Add all environment variables in Vercel project settings
4. Use a hosted PostgreSQL database (Neon, Supabase, Railway, or Render)
5. Use Cloudinary production credentials
6. Redeploy

---

## Best database option for you
For this project, I recommend:
- **PostgreSQL on Neon** for production
- **Cloudinary** for image storage
- **Vercel** for hosting

This combination is modern, cheap to start, and scalable.

---

## App conversion path later
Since you want to build this into an app later, the best path is:

1. Build the web MVP first using this repo
2. Move shared business logic into reusable modules
3. Build a mobile app using:
   - React Native + Expo, or
   - Flutter
4. Reuse the same PostgreSQL-backed API

---

## MVP completion checklist
- [x] Landing page
- [x] Create page form
- [x] Image uploads
- [x] PostgreSQL schema
- [x] Shareable public page
- [x] GitHub-ready structure
- [x] Production-friendly stack

