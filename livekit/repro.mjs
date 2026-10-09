// Repro for livekit/components-js#1428. Run from a folder where the package is installed:
//   node repro.mjs
// Simulates any environment that has a global AMD loader (define.amd).
globalThis.define = Object.assign(() => {}, { amd: {} });
try {
  await import('@livekit/components-react');
  console.log('OK: imported');
} catch (e) {
  console.log('THROWS:', e.message.split('\n')[0]);
  process.exitCode = 1;
}
