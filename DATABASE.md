# Database Schema Documentation

This document outlines the database schema and migration procedures for the Riva application.

## Tables

### settings
Stores system-wide configuration settings.

```sql
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  config JSONB NOT NULL DEFAULT '{
    "allowNewSignups": true,
    "requireEmailVerification": true,
    "defaultUserRole": "user",
    "maxLeadsPerUser": 100,
    "enableEmailNotifications": true,
    "defaultLeadStatus": "new",
    "autoAssignLeads": false,
    "leadAssignmentStrategy": "round_robin"
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## Migration Instructions

### Development Setup

1. Install dependencies:
   ```bash
   npm install knex pg --save-dev
   ```

2. Create a `.env` file in the project root with your database connection string:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database
   ```

3. Run migrations:
   ```bash
   npx knex migrate:latest
   ```

### Production Deployment

1. Set up environment variables in your hosting platform:
   - `DATABASE_URL`: Your production database connection string

2. Run migrations during deployment:
   ```bash
   npx knex migrate:latest --env production
   ```

## Available Scripts

- `npm run migrate:make <name>`: Create a new migration file
- `npm run migrate:latest`: Run all pending migrations
- `npm run migrate:rollback`: Rollback the last batch of migrations
- `npm run migrate:status`: List all migrations and their status

## Creating New Migrations

1. Create a new migration:
   ```bash
   npm run migrate:make add_new_feature
   ```

2. Edit the generated migration file in the `migrations` directory.

3. Test the migration locally:
   ```bash
   npm run migrate:latest
   ```
