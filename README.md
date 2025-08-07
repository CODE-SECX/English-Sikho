# English Learning Web Application

A professional web application for managing English vocabulary and learning notes with a clean, responsive design.

## Features

### Core Functionality
- **Vocabulary Management**: Add, edit, and search English words with meanings, context, and memory aids
- **Sikho (Learning) Section**: Organize learning notes by categories with timestamps
- **Category Management**: Create and manage categories with custom colors
- **Admin Dashboard**: Overview of learning progress with statistics

### Design Features
- Professional, responsive design optimized for all devices
- Clean typography and intuitive navigation
- Smooth animations and micro-interactions
- Modern glassmorphism design elements

## Database Schema

The application uses Supabase with the following tables:

### Categories
- `id` (uuid, primary key)
- `name` (text, unique)
- `description` (text)
- `color` (text, for UI theming)
- `created_at` (timestamp)

### Vocabulary
- `id` (uuid, primary key)
- `word` (text, unique)
- `meaning` (text)
- `context` (text)
- `moment_of_memory` (text)
- `date` (date)
- `created_at` (timestamp)

### Sikho
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `moment_of_memory` (text)
- `category_id` (uuid, foreign key to categories)
- `date` (date)
- `created_at` (timestamp)

## Setup Instructions

1. **Supabase Setup**:
   - Create a new Supabase project
   - Run the provided SQL migration file to set up the database schema
   - Get your project URL and anon key

2. **Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Technologies Used

- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Supabase for database and backend
- Lucide React for icons
- Date-fns for date formatting

## No Authentication Required

This application is designed for personal use without authentication. All data is publicly accessible through the Supabase RLS policies.

## Deployment

The application is ready for deployment to static hosting providers like Netlify or Vercel. Build the project with:

```bash
npm run build
```

The built files will be in the `dist` folder.