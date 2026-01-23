import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { useSidebar } from "@/lib/sidebar-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isOpen } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden">
      {isOpen && (
        <div className="w-64 border-r overflow-hidden">
          <Sidebar />
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
