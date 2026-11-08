import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error('Unable to locate npm. Start the development servers with `npm run dev`.');
  process.exit(1);
}

const workspaces = ['@ak-kagaz/frontend', '@ak-kagaz/backend'];
const children = workspaces.map((workspace) =>
  spawn(process.execPath, [npmCli, 'run', 'dev', `--workspace=${workspace}`], {
    cwd: rootDir,
    stdio: 'inherit',
  }),
);

let stopping = false;

const stopAll = (exitCode) => {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  children.forEach((child) => child.kill());
};

children.forEach((child) => {
  child.on('error', (error) => {
    console.error('Failed to start a development server:', error.message);
    stopAll(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stopAll(code ?? 1);
  });
});

process.on('SIGINT', () => stopAll(130));
process.on('SIGTERM', () => stopAll(143));
