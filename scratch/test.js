import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This mimics server.js which is inside the server/ folder.
// Since test.js is in scratch/, its path to server.js's __dirname will be mock-simulated:
const serverDir = path.join(__dirname, '../server');
const clientBuildPath = path.join(serverDir, '../client/dist');

console.log('--- DIAGNOSTICS REPORT ---');
console.log('Server directory:', serverDir);
console.log('Client build directory:', clientBuildPath);
console.log('Directory exists:', fs.existsSync(clientBuildPath));

if (fs.existsSync(clientBuildPath)) {
  console.log('Files in build directory:', fs.readdirSync(clientBuildPath));
  const assetsPath = path.join(clientBuildPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    console.log('Files in assets directory:', fs.readdirSync(assetsPath));
  } else {
    console.log('Assets directory does not exist!');
  }
}
console.log('---------------------------');
