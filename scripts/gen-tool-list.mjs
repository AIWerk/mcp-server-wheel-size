#!/usr/bin/env node
// Generates the tool list in README.md from the live server registry.
// Reads dist/src/server.js — run `npm run build` first.
// Replaces content between <!-- TOOLS:START --> and <!-- TOOLS:END --> markers.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const { createServer } = await import(join(root, 'dist/src/server.js'));
const server = createServer();

const tools = Object.entries(server._registeredTools)
  .filter(([, t]) => t.enabled !== false)
  .map(([name, t]) => ({ name, description: t.description ?? '' }))
  .sort((a, b) => a.name.localeCompare(b.name));

const header = '| Name | Description |\n|---|---|';
const rows = tools.map(({ name, description }) => {
  const shortDesc = description.split('\n')[0].replace(/\s+/g, ' ').trim();
  return `| \`${name}\` | ${shortDesc} |`;
});
const block = [header, ...rows].join('\n');

const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf-8');

const startMarker = '<!-- TOOLS:START -->';
const endMarker = '<!-- TOOLS:END -->';
const startIdx = readme.indexOf(startMarker);
const endIdx = readme.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('README.md is missing <!-- TOOLS:START --> or <!-- TOOLS:END --> markers');
  process.exit(1);
}

const before = readme.slice(0, startIdx + startMarker.length);
const after = readme.slice(endIdx);
const updated = `${before}\n${block}\n${after}`;

writeFileSync(readmePath, updated);
console.log(`README.md tool list updated: ${tools.length} tools`);
