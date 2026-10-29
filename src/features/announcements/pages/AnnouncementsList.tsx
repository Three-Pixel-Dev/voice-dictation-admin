import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { announcementService } from "../services/announcement.service"
import { Announcement, AnnouncementStats, AnnouncementStatus, AnnouncementDisplayType } from "../types/announcement"
import { AnnouncementPreviewModal } from "../components/AnnouncementPreviewModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { toast } from "sonner"
import {
  Plus,
  Search,
  Megaphone,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Radio,
  Repeat,
  CheckCircle2,
  AlertCircle,
  Archive,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const STATUS_TABS: { id: "ALL" | AnnouncementStatus; label: string }[] = [
  { id: "ALL", label: "All Announcements" },
  { id: "PUBLISHED", label: "Published" },
  { id: "DRAFT", label: "Drafts" },
  { id: "ARCHIVED", label: "Archived" },
]

export function AnnouncementsList() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState<AnnouncementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | AnnouncementStatus>("ALL")
  const [displayTypeFilter, setDisplayTypeFilter] = useState<"ALL" | AnnouncementDisplayType>("ALL")

  // Preview & Delete State
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      const res = await announcementService.getStats()
      setStats(res)
    } catch (err) {
      console.error("Failed to load stats", err)
    }
  }, [])

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const filterPayload: any = {}
      if (search.trim()) filterPayload.title = search.trim()
      if (statusFilter !== "ALL") filterPayload.status = statusFilter
      if (displayTypeFilter !== "ALL") filterPayload.displayType = displayTypeFilter

      const res = await announcementService.getAll(page, 10, filterPayload, "createdAt", "desc")
      const items = res.content || res.items || []
      setAnnouncements(items)
      setTotalPages(res.totalPages || 1)
      setTotalItems(res.totalItems || 0)
    } catch (err: any) {
      console.error("Failed to load announcements", err)
      toast.error("Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, displayTypeFilter])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const handleStatusToggle = async (id: number, currentStatus: AnnouncementStatus) => {
    const nextStatus: AnnouncementStatus =
      currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
    try {
      await announcementService.updateStatus(id, nextStatus)
      toast.success(`Announcement marked as ${nextStatus.toLowerCase()}`)
      loadAnnouncements()
      loadStats()
    } catch (err: any) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      setDeleting(true)
      await announcementService.delete(deleteTargetId)
      toast.success("Announcement deleted successfully")
      setDeleteTargetId(null)
      loadAnnouncements()
      loadStats()
    } catch (err: any) {
      toast.error("Failed to delete announcement")
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-"
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-emerald-500" />
            Announcements & What's New
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage mobile popups shown to users on login/app startup (TBYT Theme).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/announcements/new")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalAnnouncements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active & Live</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.activeAnnouncements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Sparkles className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Drafts</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.draftAnnouncements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Archived</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.archivedAnnouncements}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Archive className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id)
                setPage(0)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search announcements by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="pl-9 bg-card border-border/80 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={displayTypeFilter}
              onChange={(e) => {
                setDisplayTypeFilter(e.target.value as any)
                setPage(0)
              }}
              aria-label="Filter by Display Type"
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Display Types</option>
              <option value="ONE_TIME">One-Time Show</option>
              <option value="ALWAYS">Always Show</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[350px]">Announcement</TableHead>
                <TableHead>Display Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="h-16 text-center text-muted-foreground animate-pulse">
                      Loading announcements...
                    </TableCell>
                  </TableRow>
                ))
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Megaphone className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No announcements found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/announcements/new")}
                        className="text-xs"
                      >
                        Create your first announcement
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((item) => {
                  const isPublished = item.status === "PUBLISHED"
                  const isOneTime = item.displayType === "ONE_TIME"

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.coverImageUrl ? (
                            <img
                              src={item.coverImageUrl}
                              alt=""
                              className="h-11 w-11 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Megaphone className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground truncate block max-w-[240px]">
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">
                              {item.content || "No description"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isOneTime ? (
                          <Badge variant="outline" className="text-xs font-medium border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5 gap-1">
                            <Radio className="w-3 h-3" />
                            One-Time Show
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs font-medium border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5 gap-1">
                            <Repeat className="w-3 h-3" />
                            Always Show
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={isPublished ? "default" : item.status === "DRAFT" ? "secondary" : "outline"}
                          className={`text-xs font-medium ${
                            isPublished
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : item.status === "DRAFT"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {item.priority ?? 0}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(item.masterData?.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setPreviewItem(item)}
                            title="Preview Mobile Popup"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/announcements/${item.id}/edit`)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setPreviewItem(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Preview Modal</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusToggle(item.id, item.status)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>{isPublished ? "Set as Draft" : "Publish Now"}</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTargetId(item.id)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
            <p className="text-xs text-muted-foreground">
              Showing page <span className="font-semibold text-foreground">{page + 1}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} items)
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(o) => !o && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will remove this announcement popup from all mobile devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Delete Announcement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Live Preview Modal */}
      <AnnouncementPreviewModal
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
        announcement={previewItem}
      />
    </div>
  )
}
