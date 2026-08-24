import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { announcementService } from "../services/announcement.service"
import { AnnouncementRequest, AnnouncementStatus, AnnouncementDisplayType } from "../types/announcement"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ArrowLeft,
  Save,
  Sparkles,
  Megaphone,
  Upload,
  Image as ImageIcon,
  Radio,
  Repeat,
  CheckCircle2,
  HelpCircle,
  Eye,
  ArrowRight,
  X,
} from "lucide-react"

export function AnnouncementEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState<AnnouncementRequest>({
    title: "",
    content: "",
    badge: "What's New",
    displayType: "ONE_TIME",
    status: "PUBLISHED",
    coverImageUrl: "",
    actionText: "Got it",
    actionUrl: "",
    priority: 0,
  })

  useEffect(() => {
    if (!isEdit || !id) return
    const loadItem = async () => {
      try {
        setFetching(true)
        const res = await announcementService.getById(Number(id))
        setFormData({
          title: res.title || "",
          content: res.content || "",
          badge: res.badge || "What's New",
          displayType: res.displayType || "ONE_TIME",
          status: res.status || "DRAFT",
          coverImageUrl: res.coverImageUrl || "",
          actionText: res.actionText || "Got it",
          actionUrl: res.actionUrl || "",
          priority: res.priority || 0,
          startDate: res.startDate,
          endDate: res.endDate,
        })
      } catch (err: any) {
        toast.error("Failed to load announcement details")
        navigate("/announcements")
      } finally {
        setFetching(false)
      }
    }
    loadItem()
  }, [id, isEdit, navigate])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const res = await announcementService.uploadImage(file)
      setFormData((prev) => ({ ...prev, coverImageUrl: res.url }))
      toast.success("Image uploaded successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    try {
      setLoading(true)
      if (isEdit && id) {
        await announcementService.update(Number(id), formData)
        toast.success("Announcement updated successfully")
      } else {
        await announcementService.create(formData)
        toast.success("Announcement created successfully")
      }
      navigate("/announcements")
    } catch (err: any) {
      toast.error(err.message || "Failed to save announcement")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground text-sm">Loading announcement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/announcements")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEdit ? "Edit Announcement" : "Create Announcement"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure mobile popup message and display behavior (TBYT Theme).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/announcements")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : isEdit ? "Update Announcement" : "Save Announcement"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">General Information</CardTitle>
              <CardDescription className="text-xs">
                Title, badge label, and main message content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Announcement Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. New AI Voice Features in Version 2.5!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="badge" className="text-xs font-semibold">
                    Badge Tag Label
                  </Label>
                  <Input
                    id="badge"
                    placeholder="e.g. What's New, Notice, Update"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priority" className="text-xs font-semibold">
                    Priority (Higher shows first)
                  </Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority ?? 0}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) || 0 })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs font-semibold">
                  Announcement Message / Description
                </Label>
                <Textarea
                  id="content"
                  rows={5}
                  placeholder="Describe the new features, announcements, updates, or maintenance details here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="text-sm leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground">
                  Tip: Multi-line text and bullet points are preserved on mobile.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Behavior Selection Card (Always vs One-Time) */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500" />
                Display Rule & Behavior
              </CardTitle>
              <CardDescription className="text-xs">
                Control how often this popup is shown to users on their mobile app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* One Time Show Option */}
                <div
                  onClick={() => setFormData({ ...formData, displayType: "ONE_TIME" })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.displayType === "ONE_TIME"
                      ? "border-blue-500 bg-blue-500/5 shadow-sm"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className={`h-4 w-4 ${formData.displayType === "ONE_TIME" ? "text-blue-500" : "text-muted-foreground"}`} />
                      <span className="font-semibold text-sm text-foreground">One-Time Show</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Displays only once for each user after login. Once dismissed, it will never show again for that user.
                  </p>
                </div>

                {/* Always Show Option */}
                <div
                  onClick={() => setFormData({ ...formData, displayType: "ALWAYS" })}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.displayType === "ALWAYS"
                      ? "border-purple-500 bg-purple-500/5 shadow-sm"
                      : "border-border hover:border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat className={`h-4 w-4 ${formData.displayType === "ALWAYS" ? "text-purple-500" : "text-muted-foreground"}`} />
                      <span className="font-semibold text-sm text-foreground">Always Show</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                      Persistent
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Displays every time the user enters the app/first screen until the admin changes the status or archives it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banner Image & Actions Card */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Media & Action Button</CardTitle>
              <CardDescription className="text-xs">
                Optional cover banner image and call-to-action button settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image upload */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Cover Banner Image (Optional)</Label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 w-full space-y-1.5">
                    <Input
                      placeholder="https://... image URL"
                      value={formData.coverImageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shrink-0">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingImage ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.coverImageUrl && (
                  <div className="relative mt-2 w-full h-32 rounded-lg border border-border overflow-hidden bg-muted">
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImageUrl: "" })}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button Label & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="actionText" className="text-xs font-semibold">
                    Action Button Label
                  </Label>
                  <Input
                    id="actionText"
                    placeholder="e.g. Got it, Explore Now, Learn More"
                    value={formData.actionText}
                    onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="actionUrl" className="text-xs font-semibold">
                    Action Deep-Link / URL (Optional)
                  </Label>
                  <Input
                    id="actionUrl"
                    placeholder="e.g. /(protected)/(blog) or https://..."
                    value={formData.actionUrl || ""}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <Label htmlFor="status" className="text-xs font-semibold">
                  Publishing Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AnnouncementStatus })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="PUBLISHED">Published (Live to Mobile Users)</option>
                  <option value="DRAFT">Draft (Not Visible)</option>
                  <option value="ARCHIVED">Archived (Retired)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Mobile Preview Device Mockup (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Live Mobile Mockup Preview (TBYT Theme)
            </span>
            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Live Interactive
            </Badge>
          </div>

          {/* Smartphone Frame Mockup */}
          <div className="relative mx-auto w-full max-w-[340px] rounded-[36px] border-4 border-slate-800 bg-slate-950 p-2 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-3.5 w-24 bg-slate-800 rounded-full z-20" />

            {/* Screen Inner */}
            <div className="relative w-full min-h-[520px] max-h-[580px] bg-slate-900 rounded-[28px] overflow-hidden flex flex-col justify-end p-3">
              {/* Dimmed Background Mobile App representation */}
              <div className="absolute inset-0 bg-slate-950 opacity-90 flex flex-col p-4 space-y-3 pointer-events-none">
                <div className="h-6 w-24 bg-slate-800 rounded-md" />
                <div className="h-32 w-full bg-slate-800/60 rounded-xl" />
                <div className="h-20 w-full bg-slate-800/40 rounded-xl" />
              </div>

              {/* The "What's New / Announcement" Popup Card (TBYT Theme) */}
              <div className="relative z-10 w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[480px]">
                {/* Cover Image or Gradient Header */}
                {formData.coverImageUrl ? (
                  <div className="relative w-full h-32 bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src={formData.coverImageUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="relative w-full h-24 bg-gradient-to-br from-emerald-500/30 via-emerald-600/15 to-transparent flex items-center justify-center shrink-0 border-b border-slate-800">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-2.5 overflow-y-auto">
                  <div className="flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3" />
                      {formData.badge || "What's New"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formData.displayType === "ONE_TIME" ? "One-time" : "Always show"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {formData.title || "Announcement Title"}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {formData.content || "Here is where the announcement message will appear on the first screen after login."}
                  </p>

                  <div className="pt-2 space-y-1.5">
                    <button
                      type="button"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-colors"
                    >
                      <span>{formData.actionText || "Got it"}</span>
                      {formData.actionUrl && <ArrowRight className="w-3 h-3" />}
                    </button>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-400">Dismiss</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
