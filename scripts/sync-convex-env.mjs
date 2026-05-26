import { execFileSync } from 'node:child_process';

const convexEnvVars = ['PAYSTACK_SECRET_KEY'];

for (const name of convexEnvVars) {
  const value = process.env[name];

  if (!value || value.startsWith('YOUR_')) {
    console.warn(`[convex-env] ${name} is not set in the build environment; skipping.`);
    continue;
  }

  execFileSync('npx', ['convex', 'env', 'set', name, value, '--prod'], {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: process.platform === 'win32',
  });
}
