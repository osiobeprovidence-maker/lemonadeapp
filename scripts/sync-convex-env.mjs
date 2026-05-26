import { execFileSync } from 'node:child_process';

const convexEnvVars = ['PAYSTACK_SECRET_KEY'];
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

for (const name of convexEnvVars) {
  const value = process.env[name];

  if (!value || value.startsWith('YOUR_')) {
    console.warn(`[convex-env] ${name} is not set in the build environment; skipping.`);
    continue;
  }

  execFileSync(npxCommand, ['convex', 'env', 'set', name, value, '--prod'], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}
