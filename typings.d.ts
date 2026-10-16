// Allows us to import CSS Module files from Typescript without the compiler showing errors
// due to not knowing how to find one of these "modules". Normally it only knows how to
// find .ts and .tsx files as modules.
declare module "*.module.css";
// TypeScript 6 checks side-effect imports (noUncheckedSideEffectImports), so plain
// stylesheets such as the Blueprint CSS need a declaration too.
declare module "*.css";
