<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->


# Frontend Engineering Standard

Stack baseline: Vue 3.5 (`<script setup>`), VueUse, Tailwind.

**When rules conflict, resolve in this order:** boundaries → type contracts → state ownership → idioms → naming → style.

These rules prevent *drift*. Each targets a default that's plausibly wrong and, if wrong, gets copied. Follow the principle; examples illustrate syntax, they are not the rule.

**Learn from the codebase first.** Before writing, read how the project already uses its tools (data fetching, state, routing, styling) and follow those conventions. Match existing patterns over introducing your own. Default to what a good web application would do.

## Architecture & boundaries

- **Group by feature, split by responsibility.** A folder per feature owns its components; within it, components are split by their role (primitive / domain / presentational). Never dump components flat into `components/`.
- **`ui/` is an in-repo UI library.** Primitives with zero domain knowledge, driven only by props/slots — droppable into a *completely different project* as-is. Extend with a new `variant`, never hand-roll or fork an equivalent.
- **Component roles:**
  - **Primitives (`ui/`)** — pure UI, no domain knowledge.
  - **Domain components** — connect data and logic to the UI. The data itself may be owned by a composable or store; the component wires it to the presentational and primitive components that render it. Keep them thin.
  - **Presentational components** — props/slots only, no domain knowledge, but too feature-specific for `ui/`.
- **Primitive purity covers names + values, not just logic.** No domain-flavoured `variant`s (`sprout`); use semantic names (`success`, `accent`). A primitive consumes only the **semantic token layer** (`--primary`, `--border`, `--muted`…), never the raw brand palette — it must survive a completely different palette.
- **Reuse drives extraction; over-abstraction is the enemy, not pre-generalisation.** Anything that might *sensibly* be reused later — even a year later — earns its own component/function. Extract for plausible reuse; don't contort an API for reuse that will never come.
- **The app root is a shell, not a screen.** It wires layout + global elements only (header, nav, global overlays). No domain state at the root.

## Type safety & contracts

- **Types flow up from children, never down.** A component's types come from its own definitions and the exported types of the children it consumes — never from its parent or the backend. A subcomponent importing a backend-generated global type is a violation: redefine what it needs, or reuse a child's exported type.
- **At a backend boundary, the component owns the type locally** to send or receive — here it may import a generated type or a shared type file for simplicity, rather than redefining.
- **Export types prefixed with the component name.** In `SupplierRegistration.vue`: `export type SupplierRegistrationUser`. The child defines the contract; the parent abides by it.
- **`type`, never `interface`.** Compose with `&` and unions, not `extends`.

## Ownership

- **Own your concern; don't reach into someone else's.** A component owns its internal concern and exposes it deliberately — a Button owns its styling as `variant`s. Properties that are *not* the component's concern (layout: margin, positioning) legitimately come from outside. Don't take the lazy override; put each decision where it belongs. This is also what keeps the UI consistent. (Convention, not an enforced barrier — don't build machinery to prevent reaching in.)
- **Reusable fallbacks belong in the component.** A sensible default/empty state is baked in so consumers get it free — don't make every caller re-supply it.

## State & data

- **Handle every state a data-driven component can be in:** loading, error, empty, success. Never render only the happy path.
  - **Loading → skeletons.** Error → a toast, unless it's tied to a specific input, then place it near that input.
  - **Unexpected errors** may be caught by a global boundary (useful for bug reporting); everything else is handled case-by-case the way that context normally handles errors. Do what a good web app does, and keep it consistent with the project.
- **Let the server-state layer be the source of server state**, not props-drilling or a store. Reach for a store only for genuine shared *client* state — server data is not client state.
- **Keep state where it belongs.** Local UI state stays local; shared state lifts to the right scope. Only lift/persist what genuinely needs it.
- **Never `provide`/`inject`.** Nothing guarantees the inject resolves and you can't say *who* provides it. Use a **composable** — where you declare the `ref`s decides scope:
  - **Inside the function** → fresh state per call. Use when every caller wants its own instance.
  - **At module scope** → one app-wide instance. Only for genuine app-global state, one concern each, never bundled.
- **One state, one concern — never conflate.** "Which screen is showing" and "is it open" are two refs, not one. A `v-model` exposes exactly *one* concern.
- **No writable `computed({ get, set })`.** A setter that mutates other state means conflated states or a faked two-way bind — use separate refs + an explicit function, or a real `defineModel`. Read-only derived computeds are encouraged.
- **Derive with `computed`; don't sync with `watch`.** A `watch` that just sets a ref is a `computed` in disguise. Prefer `watch` with explicit named sources; **don't use `watchEffect`** unless there's a genuinely compelling reason.

## Vue API & idioms

- **`defineProps` — destructure directly** (reactive props destructure), never `const props = defineProps()`. Inline defaults, not `withDefaults`. Forward the rest with a rest element + `v-bind`, not `reactiveOmit`:
```ts
  const { class: className, variant, ...forwarded } = defineProps<…>();
```
- **`defineEmits` — call-signature form**, never the labeled-tuple/array form:
```ts
  const emit = defineEmits<{ (e: "change", id: number): void }>();
```
- **Two-way binding:** prefer `defineModel`/`v-model` over manual `modelValue` + `update:modelValue`. Use it only when the child owns a value that *both* sides genuinely change — don't fall back to prop+emit just to avoid `v-model`, and don't reach for two-way binding when one-way would do.
- **Refs default to `undefined`, never `null`.** `const name = ref<string>()`, not `ref<string | null>(null)`.
- **Conditional classes use object/array `:class`, never `&&`.** `:class="{ 'rotate-90': isOpen }"`, never the React-ism `:class="isOpen && 'rotate-90'"`.
- **Immutable array methods** — `items.toSorted(byX)`, never `[...items].sort(byX)`. The source is often a cache or a prop; spread-then-mutate is a bug spelled the long way.
- **Event handlers call the function explicitly with the args it uses** — `@click="addItem(draft)"`, `@submit.prevent="onSubmit()"`. Never a bare reference, never a redundant arrow wrapper, never multiple statements. Bigger than one call → named function.
- **`:key` on a stable id, never the loop index.** Identify a list item by what it *is*, not its position.

## Accessibility

- **Interactive elements are real semantic elements** — `<button>`, `<a>`, `<input>`, never `<div @click>`. Compose `ui/` primitives (which carry focus/ARIA/keyboard) instead of re-implementing behaviour on raw elements.

## Slots vs props

- **Content/markup → slot; data/config → prop.** When a consumer needs to pass renderable content, expose a slot rather than a string/render prop.

## Naming

- **Booleans read as questions** — `is`/`are`/`has`/`can`/`should` (`isOpen`, not `open`).
- **Name functions by what they act on, never a bare verb** — `addItem`, not `add`.
- **No one-character names anywhere**, loop aliases included (`v-for="metric in metrics"`, not `m`); `_` only for a genuinely unused arg. Identify a unique item by value, not an opaque index.
- **Filenames:** Vue SFCs are `PascalCase.vue` (matching the component); every other file is `camelCase` (`useShell.ts`).

## Files & styling

- **Pure helpers in a shared lib.** Use the `@/` alias, never deep relative `../../..` paths.
- **Tailwind utilities in templates; `cn()` to merge conditional classes.** No bespoke per-component CSS files.
- **Semantic markup.** `<strong>`/`<em>` for importance/emphasis, never `<b>`/`<i>` (or `<u>`/`<small>`).

## Comments — explain *why*, never *what*/*how*

Names already say what the code does. Don't narrate (`// loop over items`). Comment only the rare non-obvious *why* — a constraint, gotcha, or decision a future reader would otherwise undo. A comment that restates the code → delete it.