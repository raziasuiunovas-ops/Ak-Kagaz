import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  console.error('Unable to locate npm. Start the development servers with `npm run dev`.');
  process.exit(1);
}

const children = [];
let stopping = false;

const stopAll = (exitCode) => {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  children.forEach((child) => {
    try {
      child.kill();
    } catch (err) {
      // Process might already be dead
    }
  });
};

/**
 * Check if Backend is ready by polling /api/health
 */
async function waitForBackend(maxAttempts = 80, intervalMs = 1000) {
  console.log('⏳ Waiting for Backend to be ready...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Backend is ready! (${data.data?.status || 'ok'})`);
        return true;
      }
    } catch (err) {
      // Backend not ready yet, continue polling
    }
    
    if (attempt % 10 === 0) {
      console.log(`   Still waiting... (${attempt}/${maxAttempts})`);
    }
    
    await sleep(intervalMs);
  }
  
  console.error('❌ Backend failed to start within timeout period');
  return false;
}

/**
 * Start a workspace development server
 */
function startWorkspace(workspace) {
  const child = spawn(process.execPath, [npmCli, 'run', 'dev', `--workspace=${workspace}`], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  children.push(child);

  child.on('error', (error) => {
    console.error(`Failed to start ${workspace}:`, error.message);
    stopAll(1);
  });

  child.on('exit', (code) => {
    if (!stopping) {
      console.log(`${workspace} exited with code ${code}`);
      stopAll(code ?? 1);
    }
  });

  return child;
}

/**
 * Main startup sequence
 */
async function main() {
  console.log('🚀 Starting AK KAGAZ Development Servers...\n');
  
  // Step 1: Start Backend first
  console.log('📦 Starting Backend (NestJS)...');
  startWorkspace('@ak-kagaz/backend');
  
  // Step 2: Wait for Backend to be ready
  const backendReady = await waitForBackend();
  
  if (!backendReady) {
    console.error('\n❌ Cannot start Frontend without Backend. Shutting down...');
    stopAll(1);
    return;
  }
  
  // Step 3: Start Frontend
  console.log('\n🎨 Starting Frontend (Vite)...');
  startWorkspace('@ak-kagaz/frontend');
  
  console.log('\n✨ Development servers are running!\n');
}

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down development servers...');
  stopAll(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down development servers...');
  stopAll(143);
});

main().catch((err) => {
  console.error('Startup failed:', err);
  stopAll(1);
});
