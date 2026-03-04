const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

// Compile the repository's TS in memory, with isolated dependencies per test.
// This avoids a test-only bundler and lets API tests replace external services.
exports.loadTs = function loadTs(entry, mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
    }).outputText;
    function resolve(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (!id.startsWith("@/") && !id.startsWith(".")) return require(id);
      const base = id.startsWith("@/") ? path.join(root, id.slice(2)) : path.resolve(path.dirname(file), id);
      const target = [base, `${base}.ts`, `${base}.tsx`].find((name) => fs.existsSync(name) && fs.statSync(name).isFile());
      if (!target) throw new Error(`Cannot load ${id}`);
      return load(target);
    }
    new Function("require", "module", "exports", "window", "fetch", source)(resolve, module, module.exports, globals.window, globals.fetch || global.fetch);
    return module.exports;
  }
  return load(path.join(root, entry));
};
