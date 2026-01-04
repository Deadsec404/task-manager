/**
 * Automatically switch Prisma schema based on DATABASE_URL
 * This script detects SQLite (file:) vs PostgreSQL (postgresql://) and switches accordingly
 */

const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(schemaDir, 'schema.prisma');
const sqliteSchema = path.join(schemaDir, 'schema.sqlite.prisma');
const postgresqlSchema = path.join(schemaDir, 'schema.postgresql.prisma');

// Load .env file to check DATABASE_URL
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL || '';

try {
  let targetSchema;
  let provider;
  
  if (databaseUrl.startsWith('file:') || databaseUrl.startsWith('sqlite:')) {
    // SQLite detected
    targetSchema = sqliteSchema;
    provider = 'SQLite';
    console.log('🔍 Detected SQLite database URL');
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    // PostgreSQL detected
    targetSchema = postgresqlSchema;
    provider = 'PostgreSQL';
    console.log('🔍 Detected PostgreSQL database URL');
  } else {
    // Default to PostgreSQL for production safety
    console.warn('⚠️  Could not detect database type from DATABASE_URL, defaulting to PostgreSQL');
    targetSchema = postgresqlSchema;
    provider = 'PostgreSQL';
  }

  if (!fs.existsSync(targetSchema)) {
    console.error(`❌ Source schema file not found: ${targetSchema}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(targetSchema, 'utf8');
  fs.writeFileSync(mainSchema, schemaContent, 'utf8');
  
  console.log(`✅ Schema switched to ${provider}`);
  console.log(`📝 Active schema: ${mainSchema}`);
} catch (error) {
  console.error('❌ Error switching schema:', error.message);
  process.exit(1);
}

