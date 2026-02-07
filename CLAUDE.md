# MHersztowski UI - 3D Scene Editor Library

## Project Structure
- Monorepo managed with pnpm workspaces
- `packages/core` - 3D scene core (Three.js, scene graph, serialization, rendering)
- `packages/ui-core` - Headless layer (types, hooks, context providers, utilities)
- `packages/ui-components` - UI components (MUI + CSS Modules + custom SVG icons)
- `examples/demo-app` - Example application (Vite + React 18.2.0)

## Tech Stack
- **Core:** React 18.2.0 (exact), TypeScript 5.9.3, Three.js 0.182.0
- **3D React bindings:** @react-three/fiber 8.x, @react-three/drei 9.x
- **UI framework:** MUI 7.x (@mui/material, @mui/icons-material) + Emotion
- **Layout:** Allotment (resizable split panes)
- **Build:** tsup 8.x (library packages, dual ESM+CJS), Vite 7.x + @vitejs/plugin-react (demo-app)
- **Styling:** CSS Modules with CSS custom properties for theming
- **Monorepo:** pnpm 10.x workspaces, Node >=20
- **TypeScript config:** ES2022 target, bundler module resolution, react-jsx, strict mode, composite + project references for IDE

## Key Commands
- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages (respects dependency order)
- `pnpm dev` - Start demo-app dev server
- `pnpm clean` - Remove all dist folders
- `pnpm typecheck` - Type-check all packages

## Architecture Decisions
- **Three-layer package split:** core (pure Three.js) → ui-core (headless React: types, hooks, context) → ui-components (MUI + CSS Modules)
- ui-core is purely headless: no CSS, no UI components, only types/hooks/context
- ui-components depends on ui-core for types and context, on core for 3D functionality
- **Theming:** CSS variables injected at runtime by ConfigProvider (ui-core); CSS Modules reference them via `var(--mhersztowski-*)`
- **Peer dependencies:** React and React DOM are peerDependencies in library packages, not bundled
- **MUI + custom components:** ui-components uses MUI for complex widgets (menus, accordions, sliders) alongside custom CSS Modules components (Button, Input, Dialog)
- **Custom SVG icons:** dedicated icon components instead of relying solely on @mui/icons-material
- Packages use `workspace:*` protocol for inter-package references
- All library packages produce dual ESM+CJS output via tsup; ui-components additionally exports `styles.css`
- **TypeScript:** root tsconfig.json uses project references (`composite`); each package has `tsconfig.build.json` (without composite) for tsup DTS generation
- **Scene data flow:** SceneGraph (core) is the source of truth; SimpleViewer syncs Three.js objects from it; editors manage SceneGraph state and pass it down

## Functionality

### packages/core
- **Scene graph** — hierarchical node system (SceneNode, SceneGraph) with parent-child relationships, traverse, find by ID
- **Node types** — MeshNode (7 primitives: box, sphere, cylinder, cone, plane, torus + custom BufferGeometry), LightNode (ambient, directional, point, spot), CameraNode, GroupNode
- **Rendering** — RenderEngine (WebGL via Three.js, MeshStandardMaterial) + RenderLoop (requestAnimationFrame with delta-time callbacks)
- **Serialization** — SceneSerializer / SceneDeserializer for JSON save/load
- **File I/O** — GLTFImporter (GLTF/GLB import), GeometryLoader (OBJ text parsing, GLTF buffer parsing)
- **React integration** — SimpleViewer component (react-three/fiber + drei) with OrbitControls, TransformControls (translate/rotate/scale gizmo), grid helper, node selection with emissive highlight

### packages/ui-core
- **Theme system** — ThemeConfig with Material Design-inspired tokens (colors, spacing, typography, shadows, border-radius), defaultTheme, DeepPartial utility
- **ConfigProvider** — context provider that converts ThemeConfig to CSS custom properties (`--mhersztowski-*`)
- **Hooks** — useConfig, useTheme, useDefaults, useDialog (open/close state), useToast (info/success/warning/error notifications with auto-dismiss), useToggle
- **Types** — prop interfaces for all UI components (ButtonProps, InputProps, DialogProps, SceneTreePanelProps, PropertiesPanelProps, ToolbarProps, SimpleEditorProps, RichEditorProps, RichViewerProps, etc.)

### packages/ui-components
- **Basic components** — Button (filled/outlined/text/elevated/tonal, 3 sizes, loading state), Input (text/number/password/email, label, error/helper), Dialog (overlay, escape-to-close, sm/md/lg)
- **SceneTreePanel** — hierarchical tree view with expand/collapse, node type icons, context menu (add geometry/lights/groups, import mesh, rename, cut/copy/paste/duplicate, delete), inline rename, drag & drop reparenting, visibility toggle
- **PropertiesPanel** — inspector for selected node: transform editor (position/rotation/scale XYZ), material section (color picker, opacity slider, wireframe toggle), light section (type, color, intensity slider)
- **SimpleEditor** — two-pane layout (viewport + properties), toolbar (add box/sphere, delete), status bar
- **RichEditor** — full-featured scene editor: four-pane layout (hierarchy | viewport | properties), menu bar (file open/save as JSON), toolbar (move/rotate/scale mode, grid toggle), clipboard (cut/copy/paste), 3D model import (OBJ, GLTF, GLB), default scene with sample geometry and lights
- **RichViewer** — read-only 3D viewer wrapper around SimpleViewer
- **Toolbar** — icon/text buttons with tooltips, separators, active states
- **Custom icons** — SVG icons for geometry (cube, sphere, cylinder, cone, plane, torus), transforms (move, rotate, scale), lights (point, directional, ambient), scene (camera, folder), actions (delete, grid)

### examples/demo-app
- Vite + React app showcasing RichEditor as a complete 3D scene editor
