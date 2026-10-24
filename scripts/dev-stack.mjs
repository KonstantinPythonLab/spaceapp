import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const STACK_DIR = '.dev-stack';
const SECRETS_DIR = join(STACK_DIR, 'secrets');

function setup() {
  if (!existsSync(SECRETS_DIR)) {
    mkdirSync(SECRETS_DIR, { recursive: true, mode: 0o700 });
    writeFileSync(join(SECRETS_DIR, 'setup-token'), randomBytes(16).toString('hex'), { mode: 0o600 });
    writeFileSync(join(SECRETS_DIR, 'session-secret'), randomBytes(32).toString('hex'), { mode: 0o600 });
    writeFileSync(join(SECRETS_DIR, 'database-url'), 'postgres://spaceapp:devpassword@127.0.0.1:5432/spaceapp', { mode: 0o600 });
    writeFileSync(join(SECRETS_DIR, 'postgres-password'), 'devpassword', { mode: 0o600 });
  }
}

const cmd = process.argv[2];
if (cmd === 'down') {
  execSync('docker compose -p spaceapp-dev down', { stdio: 'inherit' });
} else if (cmd === 'reset') {
  execSync('docker compose -p spaceapp-dev down -v', { stdio: 'inherit' });
  execSync(`rm -rf ${STACK_DIR}`, { stdio: 'inherit' });
} else {
  setup();
  console.log('Starting SpaceApp dev stack...');
  execSync('docker compose -p spaceapp-dev up -d postgres temporal', { stdio: 'inherit' });
  console.log('Stack ready. Run npm run dev:api, dev:web, dev:worker in separate terminals.');
}