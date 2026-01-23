import { Link, useLocation, useNavigate } from "react-router-dom"
import { authService } from "@/features/auth/services/auth.service"
import { profileService } from "@/features/profile/services/profile.service"
import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UserCog,
  LogOut,
  Mic,
  Key
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Voice Notes",
    icon: Mic,
    href: "/voice-notes",
  },
  {
    title: "Member Levels",
    icon: UserCog,
    href: "/member-levels",
  },
  {
    title: "Member Level Codes",
    icon: Key,
    href: "/member-level-codes",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [profileName, setProfileName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      const user = authService.getUser()
      if (!user?.userId) return

      try {
        const profile = await profileService.getByUserId(user.userId)
        setProfileName(profile.name || "")
        setEmail(user.email || "")
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }

    loadProfile()
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate("/signin")
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-semibold">Voice Dictation</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          // For voice-notes, also check if pathname starts with /voice-notes
          const isActive = item.href === "/voice-notes" 
            ? location.pathname.startsWith("/voice-notes")
            : location.pathname === item.href
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={profileName} />
                <AvatarFallback>{profileName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{profileName}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
