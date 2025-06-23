# Deploying Saski AI Website to Heroku

This guide will help you deploy your Saski AI website to Heroku with PostgreSQL database.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Ensure your project is in a Git repository

## Step 1: Login to Heroku

```bash
heroku login
```

## Step 2: Create a Heroku App

```bash
heroku create your-app-name
# Replace 'your-app-name' with your desired app name
```

## Step 3: Add PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:essential-0
```

## Step 4: Set Environment Variables

```bash
# The DATABASE_URL is automatically set by Heroku Postgres
# Add any other environment variables you need:
heroku config:set NODE_ENV=production
```

## Step 5: Deploy to Heroku

```bash
# Add all files to git
git add .
git commit -m "Prepare for Heroku deployment"

# Push to Heroku
git push heroku main
```

## Step 6: Run Database Migrations

```bash
heroku run npx prisma migrate deploy
```

## Step 7: Seed the Database (Optional)

```bash
heroku run npx tsx prisma/seed.ts
```

## Step 8: Open Your App

```bash
heroku open
```

## Troubleshooting

### View Logs
```bash
heroku logs --tail
```

### Check App Status
```bash
heroku ps
```

### Restart App
```bash
heroku restart
```

### Database Issues
```bash
# Connect to database
heroku pg:psql

# Reset database (CAUTION: This will delete all data)
heroku pg:reset DATABASE_URL
heroku run npx prisma migrate deploy
heroku run npx tsx prisma/seed.ts
```

## Environment Variables

Your app will need these environment variables:
- `DATABASE_URL` - Automatically set by Heroku Postgres
- `NODE_ENV` - Set to "production"

## Features Included

✅ **Next.js 15** with App Router
✅ **PostgreSQL** database with Prisma ORM
✅ **Responsive design** with Tailwind CSS
✅ **Admin panel** for content management
✅ **Dynamic favicon** and site settings
✅ **Features section** with Lucide icons
✅ **CTA buttons** with icon support
✅ **SEO optimized** with meta tags
✅ **Framer Motion** animations

## Admin Panel Access

After deployment, access your admin panel at:
```
https://your-app-name.herokuapp.com/admin-panel
```

## Database Schema

The app includes these main tables:
- `site_settings` - Logo, favicon, and site configuration
- `pages` - Dynamic page content
- `features` - Feature cards with icons
- `cta_buttons` - Call-to-action buttons
- `header_config` - Navigation and header settings
- `home_page_hero` - Hero section content

## Support

For issues or questions:
1. Check the Heroku logs: `heroku logs --tail`
2. Verify environment variables: `heroku config`
3. Test database connection: `heroku pg:info` 