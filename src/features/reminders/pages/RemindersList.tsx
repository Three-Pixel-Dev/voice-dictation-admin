import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Bell,
  Plus,
  Send,
  Copy,
  Trash2,
  XCircle,
  BarChart3,
  Calendar,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Radio,
  FileEdit,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { reminderService } from "../services/reminder.service"
import { Reminder, ReminderStatus, TestSendRequest } from "../types/reminder"

const STATUS_TABS: { id: ReminderStatus | ""; label: string }[] = [
  { id: "", label: "All Campaigns" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "SENT", label: "Sent" },
  { id: "DRAFT", label: "Drafts" },
  { id: "CANCELLED", label: "Cancelled" },
]

export function RemindersList() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ReminderStatus | "">("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog states
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)
  const [sendNowTarget, setSendNowTarget] = useState<Reminder | null>(null)
  const [testSendOpen, setTestSendOpen] = useState(false)
  const [testForm, setTestForm] = useState<TestSendRequest>({
    title: "Test Notification",
    body: "This is a test notification from Voice Dictation Admin.",
    targetEmail: "",
    targetToken: "",
    deepLink: "/(protected)/(home)",
  })
  const [sendingTest, setSendingTest] = useState(false)

  const loadReminders = async () => {
    try {
      setLoading(true)
      const res = await reminderService.getAll(activeTab, page, 20)
      setReminders(res.content || res.items || [])
      setTotalPages(res.totalPages || 1)
    } catch (err: any) {
      toast.error(err.message || "Failed to load push notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [activeTab, page])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await reminderService.delete(deleteTarget.id)
      toast.success("Campaign deleted successfully")
      setDeleteTarget(null)
      loadReminders()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign")
    }
  }

  const handleSendNow = async () => {
    if (!sendNowTarget) return
    try {
      await reminderService.sendNow(sendNowTarget.id)
      toast.success("Campaign broadcast dispatched successfully!")
      setSendNowTarget(null)
      loadReminders()
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch campaign")
    }
  }

  const handleDuplicate = async (id: number) => {
    try {
      await reminderService.duplicate(id)
      toast.success("Campaign duplicated as draft")
      loadReminders()
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate campaign")
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await reminderService.cancel(id)
      toast.success("Scheduled campaign cancelled")
      loadReminders()
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel campaign")
    }
  }

  const handleSendTestPush = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testForm.title.trim() || !testForm.body.trim()) {
      toast.error("Title and message body are required")
      return
    }
    if (!testForm.targetEmail && !testForm.targetToken) {
      toast.error("Please provide either a user email or device token")
      return
    }

    try {
      setSendingTest(true)
      await reminderService.testSend(testForm)
      toast.success("Test push notification dispatched!")
      setTestSendOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to send test notification")
    } finally {
      setSendingTest(false)
    }
  }

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case "SENT":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 border-amber-300 dark:border-amber-800 dark:text-amber-400">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        )
      case "DRAFT":
        return (
          <Badge variant="outline" className="text-muted-foreground border-border">
            Draft
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "ALL":
        return <span className="text-xs font-medium text-blue-600 dark:text-blue-400">All Users</span>
      case "ACTIVE":
        return <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active (7d)</span>
      case "INACTIVE":
        return <span className="text-xs font-medium text-slate-500">Inactive</span>
      case "MEMBER_LEVEL":
        return <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Member Level</span>
      default:
        return <span className="text-xs font-medium text-muted-foreground">{audience}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-primary" />
            Push Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast messages, announcements, and reminders to mobile app users via Firebase & Expo Push.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setTestSendOpen(true)}
            className="flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-emerald-600" />
            Test Push
          </Button>
          <Button
            onClick={() => navigate("/reminders/new")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setPage(0)
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[300px]">Campaign & Message</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timing / Sent</TableHead>
              <TableHead className="text-right">Recipients</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  Loading campaigns...
                </TableCell>
              </TableRow>
            ) : reminders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Bell className="w-8 h-8 text-muted-foreground/50" />
                    <span className="text-sm font-medium text-foreground">No campaigns found</span>
                    <p className="text-xs text-muted-foreground">
                      Create a new broadcast campaign to engage your mobile users.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reminders.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="align-top py-3.5">
                    <div className="font-semibold text-sm text-foreground">{r.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5 max-w-sm">
                      {r.body}
                    </div>
                    {r.deepLink && (
                      <div className="text-[11px] font-mono text-primary/80 mt-1">
                        Link: {r.deepLink}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top py-3.5">
                    {getAudienceBadge(r.targetAudience)}
                  </TableCell>
                  <TableCell className="align-top py-3.5">
                    <Badge variant="outline" className="text-[11px] uppercase font-mono">
                      {r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top py-3.5">{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="align-top py-3.5">
                    {r.sentAt ? (
                      <div className="text-xs text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {new Date(r.sentAt).toLocaleString()}
                      </div>
                    ) : r.scheduledAt ? (
                      <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(r.scheduledAt).toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Draft</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top py-3.5 text-right font-mono text-xs">
                    {r.status === "SENT" ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {r.successCount} sent
                        </div>
                        {r.failureCount > 0 && (
                          <div className="text-[10px] text-destructive">
                            {r.failureCount} failed
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === "DRAFT" || r.status === "SCHEDULED" ? (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => setSendNowTarget(r)}
                            className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/reminders/${r.id}/edit`)}
                            className="h-7 px-2 text-xs"
                          >
                            <FileEdit className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/reminders/${r.id}/report`)}
                          className="h-7 px-2 text-xs"
                        >
                          <BarChart3 className="w-3.5 h-3.5 mr-1" />
                          Report
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicate(r.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {r.status === "SCHEDULED" && (
                            <DropdownMenuItem onClick={() => handleCancel(r.id)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Schedule
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(r)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Send Now Confirmation Dialog */}
      <AlertDialog open={!!sendNowTarget} onOpenChange={() => setSendNowTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign Now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately broadcast <strong>"{sendNowTarget?.title}"</strong> to all users in the{" "}
              <strong>{sendNowTarget?.targetAudience}</strong> audience group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendNow}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm & Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Push Modal */}
      <Dialog open={testSendOpen} onOpenChange={setTestSendOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              Send Test Push Notification
            </DialogTitle>
            <DialogDescription>
              Send an instant test push to your own registered device token or admin email to verify FCM delivery.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendTestPush} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="test-title">Title</Label>
              <Input
                id="test-title"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-body">Message Body</Label>
              <Input
                id="test-body"
                value={testForm.body}
                onChange={(e) => setTestForm({ ...testForm, body: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-email">Recipient Email</Label>
              <Input
                id="test-email"
                placeholder="admin@expn-ai.com"
                value={testForm.targetEmail || ""}
                onChange={(e) => setTestForm({ ...testForm, targetEmail: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Dispatches to all active device tokens associated with this email.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-link">Deep Link Route</Label>
              <Input
                id="test-link"
                placeholder="/(protected)/(home)"
                value={testForm.deepLink || ""}
                onChange={(e) => setTestForm({ ...testForm, deepLink: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTestSendOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendingTest}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                {sendingTest ? "Sending..." : "Dispatch Test"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
