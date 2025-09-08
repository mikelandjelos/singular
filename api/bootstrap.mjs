import { readFileSync, existsSync } from 'node:fs';

const secretFile = process.env.JWT_SECRET_FILE || '/run/secrets/jwt_secret';
if (!process.env.JWT_SECRET && existsSync(secretFile)) {
  process.env.JWT_SECRET = readFileSync(secretFile, 'utf8').trim();
}

import('./dist/main.js');
