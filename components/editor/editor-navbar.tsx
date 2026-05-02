"use client"

import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  sidebarId?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  sidebarId = "project-sidebar",
}: EditorNavbarProps) {
  return (
    <header className="h-12 flex items-center px-3 bg-surface border-b border-surface-border shrink-0">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls={sidebarId}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="h-8 w-8 text-copy-muted hover:text-copy-primary"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  )
}
