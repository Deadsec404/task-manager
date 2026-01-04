/**
 * Script to switch between SQLite and PostgreSQL Prisma schemas
 * 
 * Usage:
 *   node scripts/switch-schema.js sqlite   - Switch to SQLite (local development)
 *   node scripts/switch-schema.js postgresql - Switch to PostgreSQL (production)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(schemaDir, 'schema.prisma');
const sqliteSchema = path.join(schemaDir, 'schema.sqlite.prisma');
const postgresqlSchema = path.join(schemaDir, 'schema.postgresql.prisma');

const target = process.argv[2];

if (!target || !['sqlite', 'postgresql'].includes(target)) {
  console.error('❌ Usage: node scripts/switch-schema.js [sqlite|postgresql]');
  process.exit(1);
}

try {
  let sourceSchema;
  if (target === 'sqlite') {
    sourceSchema = sqliteSchema;
    console.log('🔄 Switching to SQLite schema (local development)...');
  } else {
    sourceSchema = postgresqlSchema;
    console.log('🔄 Switching to PostgreSQL schema (production)...');
  }

  if (!fs.existsSync(sourceSchema)) {
    console.error(`❌ Source schema file not found: ${sourceSchema}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(sourceSchema, 'utf8');
  fs.writeFileSync(mainSchema, schemaContent, 'utf8');
  
  console.log(`✅ Schema switched to ${target.toUpperCase()}`);
  console.log(`📝 Active schema: ${mainSchema}`);
} catch (error) {
  console.error('❌ Error switching schema:', error.message);
  process.exit(1);
}
