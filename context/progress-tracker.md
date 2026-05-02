# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 03: Auth — complete

## Completed

- Feature 01: Design System — shadcn/ui initialized (Tailwind v4), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added, lucide-react installed, lib/utils.ts cn() helper created, globals.css updated with dark-only theme tokens.
- Feature 02: Editor Chrome — components/editor/editor-navbar.tsx (toggle PanelLeftOpen/PanelLeftClose, three layout regions), components/editor/project-sidebar.tsx (floating overlay, Tabs with My Projects/Shared, New Project footer button), dialog styling pattern added to globals.css (@layer components: dialog-overlay, dialog-content, dialog-title, dialog-description, dialog-footer).
- Feature 03: Auth — @clerk/ui installed, proxy.ts at root (Next.js 16 Node.js middleware), ClerkProvider wraps root layout with dark theme + CSS variable overrides, /sign-in and /sign-up two-panel pages, app/page.tsx redirects authenticated→/editor unauthenticated→/sign-in, UserButton added to editor navbar right section, app/editor/page.tsx + editor-shell.tsx created.

## In Progress

- None.

## Next Up

- Feature 04 (TBD).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- globals.css serves as single source of truth for all color tokens; shadcn vars are wired directly to project design tokens so no dark-mode class toggle is needed.

## Session Notes

- Add context needed to resume work in the next session.
- Accessibility and layering follow-up for editor chrome: the project sidebar now toggles `aria-hidden` + `inert` when off-canvas, the navbar toggle now exposes `aria-expanded`/`aria-controls`, and dialog shell classes use `z-60` so modals stack above the sidebar.
