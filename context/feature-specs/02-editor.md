Implement the base editor chrome shared by all editor screens: a top navbar and a left project sidebar shell. These primitives will be reused and extended in later chapters.

## 1) Editor Navbar

Create: `components/editor/editor-navbar.tsx`

### Requirements
- Fixed-height top navbar.
- Three layout regions: left, center, and right.
- Left region contains the sidebar toggle button.
- Toggle icon switches by sidebar state:
  - `PanelLeftOpen` when sidebar is closed
  - `PanelLeftClose` when sidebar is open
- Right region remains intentionally empty for now (reserved for future actions).
- Dark background with a subtle bottom border.

## 2) Project Sidebar

Create: `components/editor/project-sidebar.tsx`

### Requirements
- Sidebar is a floating overlay above the editor canvas.
- Opening the sidebar must not shift or resize the canvas content.
- Sidebar slides in from the left.
- Component accepts an `isOpen` prop.
- Header includes:
  - `Projects` title
  - Close button
- Body uses shadcn `Tabs` with:
  - `My Projects`
  - `Shared`
- Both tabs render empty placeholder states for now.
- Footer includes a full-width `New Project` button with `Plus` icon.

## 3) Dialog Pattern (Foundation Only)

Prepare a reusable dialog styling pattern using existing color tokens from `globals.css`.

### Pattern must support
- Title
- Description
- Footer action row

Do not build concrete product dialogs in this step.

## Done Checklist
- New components compile with no TypeScript errors.
- No lint errors are introduced.
- Dialog styling pattern is ready for future dialog implementations.
