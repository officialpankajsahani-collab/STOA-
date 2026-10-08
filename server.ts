import { spawn } from 'node:child_process';
import process from 'node:process';

// Check if tsx loader is active
const isTsx =
  process.execArgv.some((arg) => arg.includes('tsx')) ||
  process.env._STOA_RUNTIME_TSX === '1' ||
  Boolean((globalThis as any).__tsx);

if (!isTsx) {
  // Spawn with tsx loader so TypeScript files, enums, and path resolution work in Node
  const child = spawn(process.execPath, ['--import', 'tsx', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, _STOA_RUNTIME_TSX: '1' },
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
} else {
  // Running with tsx: dynamically import the full server implementation
  await import('./server/app.js');
}
