/// <reference types="vite/client" />

// CSS-only font packages ship no type declarations.
declare module "@fontsource-variable/*";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
