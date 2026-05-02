import { Cpu, Users, FileText } from "lucide-react"

const features = [
  {
    icon: Cpu,
    title: "AI Architecture Generation",
    description:
      "Describe your system in plain English. Ghost AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col px-16 py-12 border-r border-surface-border bg-base">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M10 3L17 7V13L10 17L3 13V7L10 3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="text-base"
            />
          </svg>
        </div>
        <span className="text-base font-semibold text-copy-primary tracking-tight">
          Ghost AI
        </span>
      </div>

      {/* Headline */}
      <div className="flex-1 flex flex-col justify-center max-w-md">
        <h1 className="text-[2.75rem] font-bold text-copy-primary leading-[1.1] tracking-tight mb-4">
          Design systems at the speed of thought.
        </h1>
        <p className="text-base text-copy-muted leading-relaxed mb-14">
          Describe your architecture in plain English. Ghost AI maps it to a
          shared canvas your whole team can refine in real time.
        </p>

        {/* Feature list */}
        <div className="flex flex-col">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div key={title}>
              {i > 0 && (
                <div className="h-px bg-surface-border my-5" />
              )}
              <div className="flex items-start gap-4">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-elevated border border-surface-border flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-copy-primary mb-0.5">
                    {title}
                  </p>
                  <p className="text-sm text-copy-muted leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-copy-faint">
        © {new Date().getFullYear()} Ghost AI. All rights reserved.
      </p>
    </div>
  )
}
