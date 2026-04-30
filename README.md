# LoveLink Studio | Digital Memory Page Creator

LoveLink Studio is a full-stack web application that allows users to create personalized digital memory pages with photos, videos, messages, animations, interactive scenes, and private shareable links.

This project was built to practice real-world full-stack web development, authentication, database handling, cloud image uploads, OTP email verification, responsive UI design, and production deployment.

## Live Demo

🔗 [View Live Demo](https://lovelink-studio.vercel.app)

## GitHub Repository

💻 [View Source Code](https://github.com/adithaanusara/lovelink-studio)

## Key Features

- Email and password authentication
- Forgot password flow with email OTP verification
- Personalized digital memory page creation
- Photo and background image uploads
- Animated scenes and interactive UI
- Private shareable memory page links
- Responsive modern interface
- Cloud image upload support with Cloudinary
- PostgreSQL database integration with Prisma
- Public deployment with Vercel

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL / Neon
- Cloudinary
- Nodemailer
- Vercel

## Project Purpose

The main goal of this project was to improve my practical skills in full-stack web development.

Through this project, I worked on:

- Frontend development with Next.js and React
- Responsive UI design with Tailwind CSS
- API routes and backend logic
- Authentication and password reset flow
- Email OTP verification using Nodemailer
- Database modeling with Prisma
- PostgreSQL database integration
- Cloud image uploads using Cloudinary
- Production deployment using Vercel

## Important Routes

### Public Routes

- `/` - Landing page
- `/login` - User login page
- `/signup` - User signup page
- `/create` - Digital memory page builder
- `/[slug]` - Public shared memory page

### API Routes

- `POST /api/auth/signup` - Create user account
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Send OTP email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password
- `POST /api/upload` - Upload image to Cloudinary
- `POST /api/memories` - Create memory project
- `GET /api/memories` - List created memory projects

## Database Models

### User

Stores registered user account details.

### PasswordResetOtp

Stores OTP records for password reset verification.

### MemoryProject

Stores digital memory page data such as title, message, recipient, theme, media, animations, and slug.

### GalleryImage

Stores uploaded gallery images linked to a memory project.

## Installation and Setup

Clone the repository:

```bash
git clone https://github.com/adithaanusara/lovelink-studio.git