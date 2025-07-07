# Database Branching with Neon - Setup Guide

Since you're using Neon, you have access to the best database branching solution available. This guide will help you set up automatic database branching for your Vercel deployments.

## 🌟 Why Neon + Vercel is Perfect

- **Automatic Database Branching**: Each Vercel preview deployment gets its own database branch
- **Production Data Copy**: Preview branches start with a copy of your production data
- **Zero Configuration**: Works automatically once set up
- **Cost Efficient**: Only pay for what you use
- **Instant Setup**: No manual database copying required

## 🚀 Setup Steps

### 1. Install Neon Vercel Integration

1. **Go to Vercel Dashboard**:
   - Open your project in Vercel
   - Go to Settings → Integrations
   - Search for "Neon" and install the integration

2. **Connect Your Neon Database**:
   - The integration will guide you through connecting your Neon project
   - Grant necessary permissions for database branching

### 2. Configure Environment Variables

In your Vercel project settings, you should have these environment variables:

```env
# Production (automatically set by Neon integration)
saski_DATABASE_URL="postgresql://[username]:[password]@[host]/[database]"

# The integration will automatically create branch-specific URLs for previews
```

### 3. Update Your Build Configuration

Your current `package.json` build script should work perfectly:

```json
{
  "scripts": {
    "build": "prisma generate && node scripts/force-migrate.js && next build"
  }
}
```

### 4. Verify Integration

After setup, each time you:
1. **Push to main branch** → Uses production database
2. **Create/update PR** → Gets new database branch with production data copy
3. **Deploy preview** → Uses the branch-specific database

## 🔧 Advanced Configuration (Optional)

### Custom Branch Naming
You can customize how database branches are named in your Neon dashboard:
- Project Settings → Branching
- Configure branch naming patterns
- Set retention policies

### Environment-Specific Configurations
```env
# Development (local)
saski_DATABASE_URL="postgresql://[local-connection]"

# Production (Vercel main branch)
saski_DATABASE_URL="postgresql://[neon-main-branch]"

# Preview (Vercel preview deployments)
# Automatically managed by Neon integration
```

## 📊 How It Works

### Database Branch Lifecycle
1. **PR Created** → Neon creates new database branch from main
2. **Code Deployed** → Vercel uses branch-specific database URL
3. **PR Merged** → Branch database is cleaned up automatically
4. **Production Deploy** → Uses main database branch

### Data Flow
```
Production DB (main) 
    ↓ (copy on branch creation)
Preview DB (branch-abc123)
    ↓ (migrations applied during build)
Preview DB (ready for testing)
```

## 🧪 Testing Your Setup

### 1. Create a Test PR
```bash
git checkout -b test-db-branching
git commit --allow-empty -m "Test database branching"
git push origin test-db-branching
```

### 2. Check Vercel Deployment
- Go to your Vercel dashboard
- Find the preview deployment
- Check the environment variables - should see branch-specific database URL

### 3. Test Data Isolation
- Make changes in your preview environment
- Verify they don't affect production
- Check that preview starts with production data

## 🔍 Troubleshooting

### Common Issues

1. **Integration Not Working**:
   - Check Neon integration is properly installed in Vercel
   - Verify permissions are granted
   - Check environment variables are automatically set

2. **Database Migrations Failing**:
   - Ensure your migration scripts handle branch databases
   - Check that `prisma migrate deploy` works in build process

3. **Data Not Copying**:
   - Verify branch creation settings in Neon dashboard
   - Check that main database has data to copy

### Debug Commands

```bash
# Check current database connection
npx prisma db execute --stdin <<< "SELECT current_database();"

# List all migrations
npx prisma migrate status

# Check database schema
npx prisma db pull
```

## 🎯 Benefits You'll Get

### For Development
- **Safe Testing**: Each PR gets isolated database
- **Real Data**: Start with production data copy
- **No Conflicts**: Multiple developers can work simultaneously

### For Production
- **Zero Downtime**: Database changes are pre-tested
- **Rollback Safety**: Easy to revert if needed
- **Cost Control**: Only pay for active branches

### For Your Sitemap System
- **Consistent Testing**: Same data structure across environments
- **SEO Validation**: Test sitemap generation with real data
- **Safe Experiments**: Try new features without affecting production

## 📈 Monitoring

### Neon Dashboard
- Monitor branch creation/deletion
- Track database usage per branch
- Set up alerts for unusual activity

### Vercel Dashboard
- Check deployment logs for database connection
- Monitor build times
- Track environment variable usage

## 🔄 Migration Strategy

### Current Setup → Neon Branching
1. **Install Integration** (5 minutes)
2. **Test with PR** (verify it works)
3. **Update team workflow** (optional)
4. **Clean up old scripts** (remove manual DB copy scripts)

### Rollback Plan
If you need to disable branching:
1. Remove Neon integration from Vercel
2. Set manual database URLs in environment variables
3. Use your existing build process

## 💡 Best Practices

1. **Branch Cleanup**: Set retention policies to avoid unnecessary costs
2. **Migration Testing**: Always test migrations in preview before production
3. **Data Seeding**: Consider seeding specific test data for certain branches
4. **Monitoring**: Set up alerts for database usage spikes

## 🚀 Next Steps

1. **Install the Neon Vercel Integration** (primary recommendation)
2. **Create a test PR** to verify everything works
3. **Update your team documentation** about the new workflow
4. **Remove manual database scripts** (they're no longer needed)

This setup will give you the most robust, automated database branching solution available, perfectly suited for your sitemap system and overall application development workflow. 