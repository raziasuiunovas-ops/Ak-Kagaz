# Prisma Configuration for AK KAGAZ

## Database: Neon PostgreSQL

This directory contains the Prisma schema configuration for the AK KAGAZ project.

## ⚠️ IMPORTANT NOTES

### Current Status
- **Configuration only** - no database tables created yet
- **No migrations** - schema design pending
- **No production connection** - awaiting Neon project setup

### Before Creating Database Schema

The following must be completed and approved:

1. **ER Diagram** - Complete entity-relationship diagram
2. **Business Rules** - Confirmed pricing, warehouse, order workflows
3. **Technical Requirements** - Finalized data structure requirements
4. **Neon Project** - Separate development/staging/production databases

### Environment Variables Required

Copy `.env.example` to `.env` and configure:

\`\`\`env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"
\`\`\`

**How to get these values:**

1. Create a Neon project at https://neon.tech
2. Navigate to your project dashboard
3. Find "Connection Details"
4. Copy the connection string for:
   - **DATABASE_URL**: Use the pooled connection (recommended for app queries)
   - **DIRECT_URL**: Use the direct connection (required for migrations)

### Neon PostgreSQL Configuration

**Pooled Connection (DATABASE_URL)**:
- Uses connection pooling
- Optimized for application queries
- Format: `postgresql://user:password@host-pooler/database?sslmode=require`

**Direct Connection (DIRECT_URL)**:
- Direct database connection
- Required for Prisma migrations
- Format: `postgresql://user:password@host/database?sslmode=require`

### Future Steps

When ready to create the schema:

1. Design complete ER diagram
2. Update `schema.prisma` with all entities
3. Create initial migration:
   ```bash
   npm run prisma:migrate --workspace=@ak-kagaz/backend -- --name init
   ```
4. Generate Prisma Client:
   ```bash
   npm run prisma:generate --workspace=@ak-kagaz/backend
   ```

### Security Reminders

- ✅ Never commit `.env` files
- ✅ Never commit connection strings to version control
- ✅ Use separate databases for dev/staging/production
- ✅ Keep DATABASE_URL and DIRECT_URL secure
- ✅ Rotate credentials regularly

### Useful Commands

```bash
# Format schema
npm run prisma:format --workspace=@ak-kagaz/backend

# Validate schema
npx prisma validate

# Open Prisma Studio (GUI for database)
npm run prisma:studio --workspace=@ak-kagaz/backend

# Generate Prisma Client
npm run prisma:generate --workspace=@ak-kagaz/backend

# Create and apply migration
npm run prisma:migrate --workspace=@ak-kagaz/backend

# Deploy migrations to production
npm run prisma:deploy --workspace=@ak-kagaz/backend

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Resources

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma with Neon](https://neon.tech/docs/guides/prisma)
