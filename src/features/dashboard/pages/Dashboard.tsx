import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCog, FileText } from "lucide-react"
import { dashboardService, DashboardStats } from "../services/dashboard.service"

const statConfig = [
  {
    title: "Total Users",
    icon: Users,
    key: "totalUsers" as const,
  },
  {
    title: "Member Levels",
    icon: UserCog,
    key: "memberLevels" as const,
  },
  {
    title: "Voice Notes",
    icon: FileText,
    key: "voiceNotes" as const,
  },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard stats")
        console.error("Failed to fetch dashboard stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your system.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {statConfig.map((stat) => {
          const Icon = stat.icon
          const value = stats ? stats[stat.key].toLocaleString() : "-"
          
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isLoading ? "opacity-50" : ""}`}>
                  {value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
