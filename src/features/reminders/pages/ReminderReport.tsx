import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Send,
  Sparkles,
  Link2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { reminderService } from "../services/reminder.service"
import { ReminderReport } from "../types/reminder"

export function ReminderReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<ReminderReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const loadReport = async () => {
      try {
        setLoading(true)
        const data = await reminderService.getReport(Number(id))
        setReport(data)
      } catch (err: any) {
        toast.error(err.message || "Failed to load report")
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-muted-foreground">Loading campaign report...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campaign report not found.</p>
        <Button variant="outline" onClick={() => navigate("/reminders")} className="mt-4">
          Back to Campaigns
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/reminders")}
          className="h-8 px-2.5"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Campaign Delivery Report
          </h1>
          <p className="text-xs text-muted-foreground">
            Analytics and delivery metrics for this broadcast notification.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Targeted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {report.recipientCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Users in audience</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dispatched & Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {report.successCount}
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-1">
              {report.deliveryRate}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inbox Reads / Opens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {report.readCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ~{report.openRate}% engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Failed / Invalid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {report.failureCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Expired tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Message Overview</CardTitle>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {report.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Title</div>
            <div className="text-sm font-semibold text-foreground">{report.title}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Body</div>
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">
              {report.body}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Audience Group</div>
              <div className="text-xs font-medium text-foreground">{report.targetAudience}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Sent Timestamp</div>
              <div className="text-xs font-medium text-foreground">
                {report.sentAt ? new Date(report.sentAt).toLocaleString() : "—"}
              </div>
            </div>

            {report.deepLink && (
              <div className="space-y-1 sm:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase">In-App Route</div>
                <div className="text-xs font-mono text-primary flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" />
                  {report.deepLink}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
