import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Bell,
  Send,
  Save,
  Clock,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Calendar,
  Layers,
  Radio,
  Share2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { reminderService } from "../services/reminder.service"
import {
  AudienceType,
  NotificationType,
  ReminderCreateRequest,
} from "../types/reminder"

const QUICK_LINKS = [
  { label: "Home / Live Dictation", route: "/(protected)/(home)" },
  { label: "Blog & Stories", route: "/(protected)/(blog)" },
  { label: "History / Notes", route: "/(protected)/(history)" },
  { label: "Member Levels & Pricing", route: "/(protected)/(me)" },
  { label: "Settings", route: "/(protected)/(settings)" },
]

export function ReminderEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [type, setType] = useState<NotificationType>("SYSTEM")
  const [deepLink, setDeepLink] = useState("/(protected)/(home)")
  const [targetAudience, setTargetAudience] = useState<AudienceType>("ALL")
  const [sendImmediately, setSendImmediately] = useState(false)
  const [scheduledAt, setScheduledAt] = useState("")

  useEffect(() => {
    if (!isEditing || !id) return
    const loadCampaign = async () => {
      try {
        setLoading(true)
        const data = await reminderService.getById(Number(id))
        setTitle(data.title)
        setBody(data.body)
        setType(data.type)
        setDeepLink(data.deepLink || "/(protected)/(home)")
        setTargetAudience(data.targetAudience)
        if (data.scheduledAt) {
          setScheduledAt(data.scheduledAt.substring(0, 16))
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load campaign")
      } finally {
        setLoading(false)
      }
    }
    loadCampaign()
  }, [id, isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message body are required")
      return
    }

    try {
      setSubmitting(true)
      const payload: ReminderCreateRequest = {
        title: title.trim(),
        body: body.trim(),
        type,
        deepLink: deepLink.trim() || undefined,
        targetAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        sendImmediately: sendImmediately,
      }

      if (isEditing) {
        await reminderService.update(Number(id), payload)
        toast.success("Campaign updated successfully")
      } else {
        await reminderService.create(payload)
        toast.success(
          sendImmediately
            ? "Campaign broadcast dispatched successfully!"
            : "Campaign created and saved"
        )
      }
      navigate("/reminders")
    } catch (err: any) {
      toast.error(err.message || "Failed to save campaign")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-muted-foreground">Loading campaign details...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Push Campaign" : "Compose Push Campaign"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Create rich notifications and broadcasts delivered directly to user devices.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Notification Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. New AI Dictation Tips & Features 🚀"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                className="font-medium"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Keep it short and punchy for the mobile notification shade.</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-semibold">
                Message Body <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="body"
                placeholder="Write your announcement or reminder message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={400}
                rows={4}
                required
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Detailed notification content visible when expanded.</span>
                <span>{body.length}/400</span>
              </div>
            </div>

            {/* Campaign Category & Target Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Notification Type</Label>
                <Select
                  value={type}
                  onValueChange={(val: NotificationType) => setType(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM">System Announcement</SelectItem>
                    <SelectItem value="BLOG">Blog & Story Update</SelectItem>
                    <SelectItem value="REMINDER">Daily Reminder</SelectItem>
                    <SelectItem value="PROMOTION">Promotional Offer</SelectItem>
                    <SelectItem value="STREAK">Streak / Habit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Target Audience</Label>
                <Select
                  value={targetAudience}
                  onValueChange={(val: AudienceType) => setTargetAudience(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Mobile Users</SelectItem>
                    <SelectItem value="ACTIVE">Active Users (Last 7 days)</SelectItem>
                    <SelectItem value="INACTIVE">Inactive Users</SelectItem>
                    <SelectItem value="MEMBER_LEVEL">By Member Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deep Link Route */}
            <div className="space-y-2">
              <Label htmlFor="deepLink" className="text-sm font-semibold">
                Deep Link In-App Destination
              </Label>
              <Input
                id="deepLink"
                placeholder="/(protected)/(home)"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_LINKS.map((q) => (
                  <button
                    key={q.route}
                    type="button"
                    onClick={() => setDeepLink(q.route)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Timing */}
            <div className="pt-2 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">Send Immediately</div>
                  <p className="text-xs text-muted-foreground">
                    Broadcast this push notification as soon as you save.
                  </p>
                </div>
                <Switch
                  checked={sendImmediately}
                  onCheckedChange={(checked) => {
                    setSendImmediately(checked)
                    if (checked) setScheduledAt("")
                  }}
                />
              </div>

              {!sendImmediately && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt" className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    Schedule for Specific Date & Time
                  </Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leave blank to save as a Draft without scheduling.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/reminders")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className={
                sendImmediately
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
              }
            >
              {sendImmediately ? (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  {submitting ? "Dispatching..." : "Send Campaign Now"}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  {submitting ? "Saving..." : scheduledAt ? "Schedule Campaign" : "Save as Draft"}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Right Preview Mockup: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            Live Mobile Notification Preview
          </div>

          {/* Device Mockup Shell */}
          <div className="rounded-[28px] border-4 border-slate-800 bg-slate-950 p-4 shadow-xl text-slate-100 relative overflow-hidden">
            {/* Top Speaker & Camera Notch */}
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-950/80 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
            </div>

            {/* Time & Lock Screen Header */}
            <div className="text-center my-6">
              <div className="text-4xl font-light tracking-tight text-slate-100">
                09:41
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tuesday, August 25
              </div>
            </div>

            {/* Push Notification Banner Card */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md p-3.5 shadow-lg space-y-2 transition-all">
              {/* App Meta Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    VD
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide text-slate-200 uppercase">
                    Voice Dictation
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">now</span>
              </div>

              {/* Title & Body Preview */}
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-100 line-clamp-1">
                  {title.trim() || "Notification Title"}
                </div>
                <div className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {body.trim() || "Your message body preview will appear here as you type."}
                </div>
              </div>
            </div>

            {/* Bottom Swipe Bar */}
            <div className="mt-20 flex justify-center">
              <div className="w-28 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/60 p-3 text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Delivery Notes
            </div>
            <p>
              Notifications will be sent through Firebase Cloud Messaging (FCM) & Expo Push Services and automatically recorded into the recipient's in-app Notification Inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
