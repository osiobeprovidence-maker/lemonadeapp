import { execFileSync } from 'node:child_process';

process.env.CONVEX_DEPLOYMENT = 'prod:rosy-poodle-754';
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (command, args) => {
  if (process.platform === 'win32') {
    execFileSync('cmd.exe', ['/d', '/s', '/c', [command, ...args].join(' ')], {
      env: process.env,
      stdio: 'inherit',
    });
    return;
  }

  execFileSync(command, args, {
    env: process.env,
    stdio: 'inherit',
  });
};

execFileSync('node', ['scripts/sync-convex-env.mjs'], {
  env: process.env,
  stdio: 'inherit',
});

run(npxCommand, ['convex', 'deploy']);

process.env.VITE_CONVEX_URL = 'https://rosy-poodle-754.eu-west-1.convex.cloud';

run(npmCommand, ['run', 'build']);
