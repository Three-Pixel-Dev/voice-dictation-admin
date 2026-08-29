import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { blogService } from '../services/blog.service'
import { BlogPost, BlogStats, BlogStatus } from '../types/blog.types'
import { BlogPreviewModal } from '../components/BlogPreviewModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  FileClock,
  Clock,
  Sparkles,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Heart,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function BlogList() {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | BlogStatus>('ALL')

  // Preview & Delete State
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      const res = await blogService.getStats()
      setStats(res)
    } catch (err) {
      console.error('Failed to load stats', err)
    }
  }, [])

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true)
      const filterPayload: any = {}
      if (search.trim()) filterPayload.title = search.trim()
      if (statusFilter !== 'ALL') filterPayload.status = statusFilter

      const res = await blogService.getAll(page, 10, filterPayload, 'createdAt', 'desc')
      const items = res.content || res.items || []
      setBlogs(items)
      setTotalPages(res.totalPages || 1)
      setTotalItems(res.totalItems || 0)
    } catch (err: any) {
      console.error('Failed to load blogs', err)
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadBlogs()
  }, [loadBlogs])

  const handleStatusToggle = async (post: BlogPost) => {
    const nextStatus: BlogStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      await blogService.updateStatus(post.id, nextStatus)
      toast.success(
        nextStatus === 'PUBLISHED'
          ? 'Post published successfully!'
          : 'Post moved to drafts'
      )
      loadBlogs()
      loadStats()
    } catch (err: any) {
      toast.error('Failed to update status: ' + err.message)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      setDeleting(true)
      await blogService.delete(deleteTargetId)
      toast.success('Blog post deleted')
      setDeleteTargetId(null)
      loadBlogs()
      loadStats()
    } catch (err: any) {
      toast.error('Failed to delete post: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write rich articles, publish updates, and share voice dictation guides with readers.
          </p>
        </div>
        <Button
          onClick={() => navigate('/blogs/new')}
          className="gap-2 shadow-sm font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {/* Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Card className="border-border bg-card/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalPosts}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Published
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.publishedCount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Drafts
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {stats.draftCount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileClock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                  {(stats.totalViews || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60 shadow-xs col-span-2 sm:col-span-1">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Likes
                </p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {(stats.totalLikes || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Heart className="h-5 w-5 fill-rose-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
            <Button
              key={st}
              type="button"
              variant={statusFilter === st ? 'default' : 'ghost'}
              size="sm"
              className="text-xs font-medium rounded-lg h-8"
              onClick={() => {
                setStatusFilter(st)
                setPage(0)
              }}
            >
              {st === 'ALL' ? 'All Posts' : st.charAt(0) + st.slice(1).toLowerCase() + 's'}
            </Button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Blog Posts List */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/40 p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading posts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/40 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No blog posts found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your filters or search keywords.'
                : 'Get started by creating your very first rich blog article.'}
            </p>
          </div>
          <Button onClick={() => navigate('/blogs/new')} className="gap-2 mt-2">
            <Plus className="h-4 w-4" /> Create New Post
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden border-border bg-card hover:border-primary/40 transition-all shadow-xs"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                {/* Left: Thumbnail & Title & Excerpt */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {post.coverImageUrl ? (
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-20 w-28 shrink-0 rounded-lg object-cover border bg-muted"
                    />
                  ) : (
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-muted-foreground">
                      <BookOpen className="h-8 w-8 opacity-40" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          post.status === 'PUBLISHED'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : post.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : ''
                        }`}
                      >
                        {post.status}
                      </Badge>

                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTimeMinutes || 3} min read
                      </span>
                    </div>

                    <Link
                      to={`/blogs/edit/${post.id}`}
                      className="block text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>

                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground pt-0.5">
                      <span>By {post.authorName || 'TBYT'}</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Eye className="h-3.5 w-3.5" />
                        {post.viewCount || 0} views
                      </span>
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                        <Heart className="h-3.5 w-3.5 fill-rose-500/20" />
                        {post.likesCount || 0} likes
                      </span>
                      <span>
                        {post.publishedAt
                          ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                          : `Created ${post.masterData?.createdAt ? new Date(post.masterData.createdAt).toLocaleDateString() : ''}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    onClick={() => setPreviewPost(post)}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Preview
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-medium"
                    onClick={() => navigate(`/blogs/edit/${post.id}`)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusToggle(post)}>
                        {post.status === 'PUBLISHED' ? (
                          <>
                            <FileClock className="mr-2 h-4 w-4" /> Revert to Draft
                          </>
                        ) : (
                          <>
                            <FileCheck className="mr-2 h-4 w-4 text-emerald-600" /> Publish Post
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTargetId(post.id)}
                        className="text-destructive font-medium"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Showing Page <strong className="text-foreground">{page + 1}</strong> of{' '}
            <strong className="text-foreground">{totalPages}</strong> ({totalItems} total posts)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1 text-xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPost && (
        <BlogPreviewModal
          open={!!previewPost}
          onOpenChange={(isOpen) => !isOpen && setPreviewPost(null)}
          post={previewPost}
        />
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this blog post and remove it from the public blog reader.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
