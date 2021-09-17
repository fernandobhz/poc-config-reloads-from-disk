import dedent from "dedent";
import { join, dirname } from "path";
import { writeFileSync } from "fs";
import { createRequire } from "module";

const { log, error: consoleError } = console;
const require = createRequire(import.meta.url);

const die = (...args) => {
  consoleError(...args);
  process.exit(1);
};

async function importFresh(modulePath) {
  const cacheBustingModulePath = `file://${modulePath}?update=${Date.now()}`;
  return (await import(cacheBustingModulePath)).default;
}

setInterval(async () => {
  const config = require("config");

  const a = config.get(`a`);
  console.log({ a });
}, 1000);

setInterval(() => {
  const localYamlPath = join(`config`, `local.yaml`);
  const localYamlContent = dedent`
    a: ${Math.random().toString(36).slice(-5)}
    b: ${Math.random().toString(36).slice(-5)}
    c: ${Math.random().toString(36).slice(-5)}
  `;
  writeFileSync(localYamlPath, localYamlContent);

  const [, scriptPath] = process.argv;
  const projectPath = dirname(scriptPath);
  delete require.cache[join(projectPath, `node_modules`, `config`, `lib`, `config.js`)];

  // nuclear bomb to kill a bug
  // Object.keys(require.cache).forEach(key => delete require.cache[key]);

  console.log(`local.yaml contents changed successfully`);
}, 3000);

setTimeout(process.exit, 60_000, 0);
