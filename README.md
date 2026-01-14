# PRNI Political Party Website

A modern, secure, and maintainable website for a political party built with Next.js 14, featuring public pages and an admin portal.

## 🚀 Features

### Public Pages
- **Home**: Hero section, mission statement, latest announcements, upcoming events, manifesto highlights
- **Announcements**: Paginated list with category filtering and search, slug-based detail pages
- **Events**: Calendar view (month) + list view, event details with iCal export
- **Manifesto**: Structured sections with table of contents and anchor links
- **About**: Party description and team member cards
- **Contact**: Form with spam protection (honeypot + rate limiting)

### Admin Portal
- Single admin account with secure authentication
- CRUD for announcements, events, manifesto sections, and team members
- Markdown editor with live preview
- Draft/publish workflow

### Technical Features
- Designer-friendly theming with CSS variables (2 built-in themes)
- Secure Markdown rendering with XSS protection
- Rate limiting on forms and login
- Server-side authorization on all admin routes
- Audit logging for admin actions
- Accessibility: semantic HTML, ARIA, keyboard navigation
- SEO metadata and OpenGraph tags

## 📋 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **UI Components**: shadcn/ui-style components
- **Database**: Prisma ORM + PostgreSQL (SQLite for local dev)
- **Authentication**: NextAuth.js (Credentials provider)
- **Validation**: Zod

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd prni
npm install
```

### 2. Configure Environment Variables

Copy `env.example.txt` to `.env.local`:

```bash
cp env.example.txt .env.local
```

Edit `.env.local` with your values:

```env
# For SQLite (local development):
DATABASE_URL="file:./dev.db"

# For PostgreSQL:
# DATABASE_URL="postgresql://user:pass@localhost:5432/prni"

NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Admin account (used by seed script)
ADMIN_EMAIL="admin@prni.org"
ADMIN_PASSWORD="your-secure-password"

# Theme: "classic" or "modern"
NEXT_PUBLIC_THEME="classic"
```

### 3. Set Up Database

For SQLite (easiest for local dev), update your `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit:
- Public site: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

Default admin credentials (from seed):
- Email: admin@prni.org
- Password: change-this-password-immediately

## 🔐 Creating the Admin Account

### Option 1: Using Seed Script (Recommended for Development)

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`, then run:

```bash
npm run db:seed
```

### Option 2: Manual Creation (Production)

Generate a password hash:

```bash
node -e "require('bcryptjs').hash('your-secure-password', 12).then(h => console.log(h))"
```

Then insert directly into the database or create a migration.

## 🎨 Switching Themes

Two themes are included: **Classic** (traditional, serif fonts) and **Modern** (contemporary, sans-serif).

### Method 1: Environment Variable

Set in `.env.local`:

```env
NEXT_PUBLIC_THEME="modern"
```

### Method 2: Direct in Code

Edit `app/layout.tsx` and change the `theme` variable:

```typescript
const theme = "modern"; // or "classic"
```

### Customizing Themes

All theme tokens are in `app/globals.css`. Modify the CSS variables under `:root` or `[data-theme="modern"]` to customize:

- Colors (primary, secondary, background, etc.)
- Typography (font families, sizes)
- Spacing and border radius
- Shadows

See the **Designer Guide** section below for details.

## 📝 Designer Guide

### Where to Change Styling

| Element | Location |
|---------|----------|
| Colors | `app/globals.css` - CSS variables under `:root` |
| Fonts | `app/globals.css` - `--font-sans`, `--font-heading` |
| Spacing | `app/globals.css` - `--section-spacing`, `--container-padding` |
| Border radius | `app/globals.css` - `--radius` |
| Shadows | `app/globals.css` - `--shadow-card`, `--shadow-elevated` |
| Button styles | `components/ui/button.tsx` |
| Header/Footer | `components/layout/header.tsx`, `components/layout/footer.tsx` |
| Component variants | `components/ui/*.tsx` - using `class-variance-authority` |

### Adding a New Theme

1. Add a new `[data-theme="your-theme"]` block in `app/globals.css`
2. Define all CSS variables (copy from existing theme)
3. Set `NEXT_PUBLIC_THEME="your-theme"` in environment

### Typography Scale

The theme uses a custom typography scale defined as CSS variables:

```css
--text-display-xl: 4.5rem;  /* Hero headlines */
--text-display-lg: 3.5rem;  /* Page titles */
--text-display: 2.5rem;     /* Section headings */
```

## 🔒 Security Notes

### Password Security
- Passwords are hashed with bcrypt (12 rounds)
- Rate limiting on login attempts (5 attempts per 15 minutes)

### Input Validation
- All inputs validated with Zod schemas
- Server-side validation on all API routes

### XSS Prevention
- Markdown rendered with `rehype-sanitize`
- Strict allowlist for HTML elements
- No raw HTML allowed in Markdown

### Authorization
- All admin routes protected by NextAuth middleware
- Server-side authorization checks on every API handler
- CSRF protection via NextAuth

### Contact Form Protection
- Honeypot field for bot detection
- Rate limiting (5 submissions per 15 minutes per IP)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secure random string
- `NEXTAUTH_URL` - Your production URL

Optional:
- `NEXT_PUBLIC_THEME` - Theme selection
- `RESEND_API_KEY` - For contact form emails
- `CONTACT_EMAIL` - Recipient for contact form

### Database Setup

For production, use PostgreSQL:

1. Create a PostgreSQL database (Vercel Postgres, Supabase, etc.)
2. Update `DATABASE_URL` in environment
3. Ensure schema uses `postgresql` provider
4. Run migrations: `npx prisma migrate deploy`

## 📁 Project Structure

```
prni/
├── app/
│   ├── (public)/           # Public routes
│   │   ├── announcements/
│   │   ├── events/
│   │   ├── manifesto/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/              # Admin routes
│   │   ├── (dashboard)/
│   │   │   ├── announcements/
│   │   │   ├── events/
│   │   │   ├── manifesto/
│   │   │   ├── team/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── login/
│   ├── api/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── calendar/
│   │   └── contact/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── admin/              # Admin-specific components
│   ├── layout/             # Header, Footer
│   ├── ui/                 # UI primitives
│   └── markdown-renderer.tsx
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── utils.ts            # Utility functions
│   └── validations.ts      # Zod schemas
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── ...config files
```

## 📄 API Routes

### Public
- `POST /api/contact` - Contact form submission
- `GET /api/calendar/feed` - iCal feed for all events

### Admin (Protected)
- `GET/POST /api/admin/announcements`
- `GET/PATCH/DELETE /api/admin/announcements/[id]`
- `GET/POST /api/admin/events`
- `GET/PATCH/DELETE /api/admin/events/[id]`
- `GET/POST /api/admin/manifesto`
- `GET/PATCH/DELETE /api/admin/manifesto/[id]`
- `GET/POST /api/admin/team`
- `GET/PATCH/DELETE /api/admin/team/[id]`

## 📜 License

MIT License - feel free to use this for your own political party or organization.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
