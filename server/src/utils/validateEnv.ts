/**
 * Validates required environment variables at startup.
 * Throws an error if any critical variables are missing.
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const REQUIRED_ENV_VARS: EnvConfig[] = [
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },
  { name: 'JWT_SECRET', required: true, description: 'Secret for signing JWT tokens (min 32 chars)' },
  { name: 'SESSION_SECRET', required: true, description: 'Secret for admin session cookies (min 32 chars)' },
  { name: 'OPENAI_API_KEY', required: true, description: 'OpenAI API key for AI features' },
];

const OPTIONAL_ENV_VARS: EnvConfig[] = [
  { name: 'FIREBASE_SERVICE_ACCOUNT', required: false, description: 'Firebase service account JSON' },
  { name: 'FIREBASE_SERVICE_ACCOUNT_BASE64', required: false, description: 'Firebase service account (base64)' },
  { name: 'POLAR_ACCESS_TOKEN', required: false, description: 'Polar.sh API token for billing' },
  { name: 'POLAR_WEBHOOK_SECRET', required: false, description: 'Polar.sh webhook secret' },
  { name: 'ADMIN_EMAIL', required: false, description: 'Admin panel login email' },
  { name: 'ADMIN_PASSWORD', required: false, description: 'Admin panel login password' },
  { name: 'ADMIN_EMAILS', required: false, description: 'Comma-separated list of admin user emails (for API admin actions)' },
];

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const env of REQUIRED_ENV_VARS) {
    if (!process.env[env.name]) {
      missing.push(`  - ${env.name}: ${env.description}`);
    }
  }

  // Validate secret lengths
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('  - JWT_SECRET should be at least 32 characters');
  }

  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    warnings.push('  - SESSION_SECRET should be at least 32 characters');
  }

  // Check optional but recommended
  const hasFirebase = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!hasFirebase) {
    warnings.push('  - Firebase not configured (FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_BASE64)');
  }

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    warnings.push('  - Admin credentials not set (ADMIN_EMAIL, ADMIN_PASSWORD) - admin panel will be inaccessible');
  }

  // Print warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment warnings:');
    warnings.forEach(w => console.warn(w));
    console.warn('');
  }

  // Fail if required vars missing
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(m => console.error(m));
    console.error('\nServer cannot start without these variables.\n');
    process.exit(1);
  }
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}
