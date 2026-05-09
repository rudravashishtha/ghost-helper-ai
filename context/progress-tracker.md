# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 12: Shape Panel — complete

## Completed

- Feature 01: Design System — shadcn/ui initialized (Tailwind v4), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added, lucide-react installed, lib/utils.ts cn() helper created, globals.css updated with dark-only theme tokens.
- Feature 02: Editor Chrome — components/editor/editor-navbar.tsx (toggle PanelLeftOpen/PanelLeftClose, three layout regions), components/editor/project-sidebar.tsx (floating overlay, Tabs with My Projects/Shared, New Project footer button), dialog styling pattern added to globals.css (@layer components: dialog-overlay, dialog-content, dialog-title, dialog-description, dialog-footer).
- Feature 03: Auth — @clerk/ui installed, proxy.ts at root (Next.js 16 Node.js middleware), ClerkProvider wraps root layout with dark theme + CSS variable overrides, /sign-in and /sign-up two-panel pages, app/page.tsx redirects authenticated→/editor unauthenticated→/sign-in, UserButton added to editor navbar right section, app/editor/page.tsx + editor-shell.tsx created.
- Feature 04: Project Dialogs & Editor Home — hooks/use-project-dialogs.ts (dialog/form/loading state, mock project data, slug generation), editor home screen (heading + description + New Project button), Create/Rename/Delete dialogs in components/editor/dialogs/, sidebar updated with project items + owned-only rename/delete actions + mobile backdrop scrim, all wired through editor-shell.tsx.
- Feature 05: Prisma Schema & Data Layer — prisma/models/project.prisma (Project + ProjectCollaborator models with indexes and cascade delete), lib/prisma.ts (singleton, pg-adapter for postgres:// URLs, accelerateUrl for prisma+postgres:// URLs), migration applied to Prisma Postgres at db.prisma.io, client generated to generated/prisma/ via the Prisma 7 `prisma-client` generator. Packages added: prisma, @prisma/client, @prisma/adapter-pg, pg, @prisma/extension-accelerate, dotenv.
- Feature 06: Project APIs — app/api/projects/route.ts (GET list, POST create with "Untitled Project" default), app/api/projects/[projectId]/route.ts (PATCH rename, DELETE — both enforce owner-only with 403 for non-owners), 401 on all unauthenticated requests. lib/prisma.ts typed as PrismaClient to resolve Accelerate union overload error.
- Feature 07: Wire Editor Home — lib/projects.ts (getOwnedProjects, getSharedProjects server helpers), lib/types.ts (shared Project interface for client components), hooks/use-project-actions.ts (create with slug+suffix roomId → POST → navigate; rename PATCH + refresh; delete DELETE + redirect/refresh; create dialog preview shows the actual generated suffix before submit), app/editor/page.tsx converted to async server component fetching real data via Clerk auth, editor-shell.tsx accepts project lists as props, project-sidebar.tsx split into ownedProjects/sharedProjects props, all dialogs use real Project type, create dialog shows room ID preview. POST /api/projects now accepts optional id for aligned project+Liveblocks room ID.
- Feature 08: Editor Workspace Shell — lib/project-access.ts (getCurrentIdentity for Clerk userId+email, getProjectWithAccess checks owner then collaborator), components/editor/access-denied.tsx (lock icon, centered layout, link back to /editor), app/editor/[roomId]/page.tsx (server component: unauthenticated→/sign-in, no access→AccessDenied, renders WorkspaceShell), app/editor/[roomId]/workspace-shell.tsx (full-viewport: navbar with project name + share + AI toggle, ProjectSidebar with currentRoomId highlighting, canvas placeholder, AI sidebar placeholder). EditorNavbar extended with optional projectName/onShare/isAIOpen/onToggleAI props; ProjectSidebar extended with optional currentRoomId for active-room highlighting.
- UI Redesign: Robotic & Futuristic — Added `glass-panel`, `glow`, and `bg-grid` tokens to `globals.css`. Redesigned `EditorNavbar` with glassmorphism and technical typography. Overhauled `ProjectSidebar` as a "Control Panel" with grid backgrounds and mono-font technical details. Transformed `/editor` into a "System Initializer" landing workspace. Redesigned `/editor/[roomId]` workspace with technical canvas decorations and a "Neural Unit" AI sidebar placeholder. All existing project management functionality (create, rename, delete, sidebar toggle) preserved.
- Feature 09: Share Dialog — app/api/projects/[projectId]/collaborators/route.ts (GET: list collaborators enriched with Clerk name/avatar, POST: invite by email — owner only), app/api/projects/[projectId]/collaborators/[email]/route.ts (DELETE: remove collaborator — owner only), components/editor/share-dialog.tsx (copy-link with Copied! feedback, owner invite form with error state, collaborator list with Clerk avatars/names, owner-only remove button). WorkspaceShell wired with shareOpen state and isOwner prop; page.tsx derives isOwner from project.ownerId === userId.
- Feature 10: Scalable Collaborator Loading — Updated `app/api/projects/[projectId]/collaborators/route.ts` with cursor-based pagination and email-based search. Optimized Clerk profile enrichment to only batch-fetch for the current page. Updated `components/editor/share-dialog.tsx` with debounced search input, "Load more" pagination button, and optimized loading states.
- Feature 10: Liveblocks Setup — `liveblocks.config.ts` defines Presence (cursor + isThinking) and UserMeta (id, name, avatar, color). Lazy cached `getLiveblocksClient()` in `lib/liveblocks.ts` with deterministic `getUserColor()` from a fixed 10-color palette. `POST /api/liveblocks-auth` requires Clerk auth, verifies project access via existing helper, creates room if needed, returns access token session with name/avatar/color. `@liveblocks/node` added.

## In Progress

- None.

## Next Up

- TBD.

## Completed (continued)

- Feature 11: Base Canvas — `types/canvas.ts` defines `CanvasNodeData`, `CanvasNode`, `CanvasEdge`. `components/editor/canvas/canvas-wrapper.tsx` sets up `LiveblocksProvider` + `RoomProvider` with initial presence, `ErrorBoundary`, and `ClientSideSuspense`. `components/editor/canvas/canvas.tsx` uses `useLiveblocksFlow` (suspense, empty nodes/edges) wired into `ReactFlow` with `Cursors`, `MiniMap`, and dot `Background`. Workspace shell canvas placeholder replaced with `CanvasWrapper`. `react-error-boundary` installed. Build passes.
- Feature 12: Shape Panel — `types/canvas.ts` extended with all 6 `NodeShape` values, `NODE_SHAPES`, `NODE_COLORS` (8 pairs), `DEFAULT_NODE_COLOR`, and `textColor` on `CanvasNodeData`. `components/editor/canvas/canvas-node.tsx` renders custom nodes as simple bordered rectangles with centered label and 4-sided connection handles. `components/editor/canvas/shape-panel.tsx` is a floating pill toolbar at bottom-center with draggable buttons for all 6 shapes; drag payload carries shape name + default size. `canvas.tsx` registers `canvasNode` type, captures `screenToFlowPosition` via an inner `FlowPositionCapture` panel, and handles `dragover`/`drop` on the wrapper div — converting screen position to canvas coordinates and inserting new nodes via `onNodesChange([{ type: "add", item }])`. Node IDs use `{shape}-{timestamp}-{counter}` format. Build passes.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- globals.css serves as single source of truth for all color tokens; shadcn vars are wired directly to project design tokens so no dark-mode class toggle is needed.

## Session Notes

- Add context needed to resume work in the next session.
- Accessibility and layering follow-up for editor chrome: the project sidebar now toggles `aria-hidden` + `inert` when off-canvas, the navbar toggle now exposes `aria-expanded`/`aria-controls`, and dialog shell classes use `z-60` so modals stack above the sidebar.
- Auth route protection hardening: `proxy.ts` now falls back to `/sign-in` and `/sign-up` when Clerk public route env vars are unset, preventing matcher failures such as `undefined(.*)` and redirect lockout on auth pages.
- Prisma client generation fix: the generated Prisma 7 client now lives in top-level `generated/prisma/`, `lib/prisma.ts` imports from `generated/prisma/client`, and `npm run dev` now auto-runs `prisma generate` so Turbopack does not fail on a missing local client module.
- Share dialog loading fix: collaborator fetching no longer runs from a `useEffect`; `workspace-shell.tsx` now opens the dialog and explicitly triggers `ShareDialog.loadCollaborators()` via a ref so React 19’s set-state-in-effect warning is avoided without changing invite/remove behavior.
- Share dialog avatar fix: `next.config.ts` now allowlists `https://img.clerk.com` under `images.remotePatterns` so Clerk profile images render safely through `next/image` in the collaborator list.
