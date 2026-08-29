import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlogPostRequest } from '../types/blog.types'
import { cn } from '@/lib/utils'
import {
  Smartphone,
  Monitor,
  Clock,
  User,
  Calendar,
  Share2,
  Bookmark,
  Sparkles,
} from 'lucide-react'

interface BlogPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Partial<BlogPostRequest>
}

export function BlogPreviewModal({
  open,
  onOpenChange,
  post,
}: BlogPreviewModalProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop')

  const tagsList = post.tags
    ? post.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Header with Device Switcher */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-3 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            Live Reader Preview
          </DialogTitle>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/60 p-1 mr-6 shadow-2xs">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                deviceView === 'desktop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                deviceView === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
        </DialogHeader>

        {/* Preview Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-8 flex justify-center">
          <div
            className={`w-full bg-background transition-all duration-300 rounded-2xl border shadow-sm ${
              deviceView === 'mobile'
                ? 'max-w-[400px] px-5 py-6'
                : 'max-w-[760px] px-8 sm:px-12 py-10'
            }`}
          >
            {/* Read time */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readTimeMinutes || 3} min read
              </span>
            </div>

            {/* Title */}
            <h1
              className={`font-serif font-bold tracking-tight text-foreground leading-[1.2] mb-4 ${
                deviceView === 'mobile' ? 'text-2xl' : 'text-3xl sm:text-4xl'
              }`}
            >
              {post.title || 'Untitled Blog Post'}
            </h1>

            {/* Excerpt / Subtitle */}
            {post.excerpt && (
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Author Meta Row */}
            <div className="flex items-center justify-between border-y border-border/60 py-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden text-primary font-bold text-sm">
                  <img
                    src={post.authorAvatarUrl || '/app-logo.png'}
                    alt={post.authorName || 'TBYT'}
                    onError={(e) => {
                      e.currentTarget.src = '/app-logo.png'
                    }}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {post.authorName || 'TBYT'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formattedDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <button
                  type="button"
                  aria-label="Bookmark preview"
                  className="rounded-full p-2 hover:bg-muted transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Share preview"
                  className="rounded-full p-2 hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="mb-8 overflow-hidden rounded-xl border bg-muted/40">
                <img
                  src={post.coverImageUrl}
                  alt={post.title || 'Cover'}
                  className="h-auto w-full object-cover max-h-[420px]"
                />
                {post.coverImageCaption && (
                  <p className="px-4 py-2 text-center text-xs text-muted-foreground italic border-t">
                    {post.coverImageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Rich HTML Content */}
            <div
              className="prose dark:prose-invert max-w-none text-foreground font-sans leading-relaxed text-[16px]"
              dangerouslySetInnerHTML={{
                __html:
                  post.content ||
                  '<p class="italic text-muted-foreground">No article content written yet...</p>',
              }}
            />

            {/* Tags */}
            {tagsList.length > 0 && (
              <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
                {tagsList.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-2.5 py-1">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
