import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
