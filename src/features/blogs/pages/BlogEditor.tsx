import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { blogService } from '../services/blog.service'
import { BlogPostRequest, BlogStatus } from '../types/blog.types'
import { RichTextEditor } from '../components/editor/RichTextEditor'
import { BlogPreviewModal } from '../components/BlogPreviewModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  ArrowLeft,
  UploadCloud,
  X,
  Image as ImageIcon,
  Sparkles,
  Save,
  Send,
  Loader2,
  Tag,
  Folder,
  User,
  Link2,
  Trash2,
  CheckCircle,
} from 'lucide-react'

const CATEGORIES = [
  'Voice AI & Speech Tech',
  'Productivity & Workflow',
  'Writing Tips & Guides',
  'Product Updates',
  'Mobile Dictation',
  'Tutorials',
  'Case Studies',
]

export function BlogEditor() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id && id !== 'new')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(isEdit)
  const [savingAction, setSavingAction] = useState<BlogStatus | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [coverImageCaption, setCoverImageCaption] = useState('')
  const [status, setStatus] = useState<BlogStatus>('DRAFT')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [authorName, setAuthorName] = useState('TBYT')
  const [authorEmail, setAuthorEmail] = useState('admin@expn-ai.com')
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState('/app-logo.png')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing post if editing
  useEffect(() => {
    if (isEdit && id) {
      setLoading(true)
      blogService
        .getById(Number(id))
        .then((post) => {
          setTitle(post.title || '')
          setSlug(post.slug || '')
          setSlugManual(true)
          setExcerpt(post.excerpt || '')
          setContent(post.content || '')
          setCoverImageUrl(post.coverImageUrl || '')
          setCoverImageCaption(post.coverImageCaption || '')
          setStatus(post.status || 'DRAFT')
          setCategory(post.category || CATEGORIES[0])
          setAuthorName(post.authorName || 'TBYT')
          setAuthorEmail(post.authorEmail || 'admin@expn-ai.com')
          setAuthorAvatarUrl(post.authorAvatarUrl || '/app-logo.png')
          if (post.tags) {
            setTags(post.tags.split(',').map((t) => t.trim()).filter(Boolean))
          }
        })
        .catch((err) => {
          console.error('Failed to load blog', err)
          toast.error('Failed to load blog post')
          navigate('/blogs')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id, isEdit, navigate])

  // Slug generator helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugManual) {
      setSlug(generateSlug(val))
    }
  }

  // Cover image upload
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    try {
      setUploadingCover(true)
      const res = await blogService.uploadImage(file)
      setCoverImageUrl(res.url)
      toast.success('Cover image uploaded!')
    } catch (err: any) {
      toast.error('Failed to upload cover: ' + err.message)
    } finally {
      setUploadingCover(false)
    }
  }

  // Tag management
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const clean = tagInput.trim().replace(/^#|,/g, '')
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Save handler
  const handleSave = async (targetStatus?: BlogStatus) => {
    if (!title.trim()) {
      toast.error('Please enter an article title')
      return
    }

    if (!content.trim()) {
      toast.error('Please write some content before saving')
      return
    }

    const finalStatus = targetStatus || status
    const payload: BlogPostRequest = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      excerpt: excerpt.trim() || undefined,
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || undefined,
      coverImageCaption: coverImageCaption.trim() || undefined,
      status: finalStatus,
      authorName: authorName.trim() || 'TBYT',
      authorEmail: authorEmail.trim() || 'admin@expn-ai.com',
      authorAvatarUrl: authorAvatarUrl.trim() || '/app-logo.png',
      category: category.trim() || undefined,
      tags: tags.join(','),
    }

    try {
      setSavingAction(finalStatus)
      if (isEdit && id) {
        await blogService.update(Number(id), payload)
        toast.success(
          finalStatus === 'PUBLISHED'
            ? 'Article published successfully!'
            : 'Draft updated successfully!'
        )
      } else {
        const created = await blogService.create(payload)
        toast.success(
          finalStatus === 'PUBLISHED'
            ? 'Article published successfully!'
            : 'Draft saved successfully!'
        )
        navigate(`/blogs/edit/${created.id}`)
      }
    } catch (err: any) {
      console.error('Save failed', err)
      toast.error(err.message || 'Failed to save blog post')
    } finally {
      setSavingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading article editor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Fixed Sticky Header Actions */}
      <div className="sticky -top-4 sm:-top-6 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 bg-background border-b shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/blogs')}
            className="gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
          <div className="h-4 w-px bg-border" />
          <Badge
            variant={status === 'PUBLISHED' ? 'default' : 'secondary'}
            className={
              status === 'PUBLISHED'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white text-xs'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-xs'
            }
          >
            {isEdit ? `${status}` : 'NEW ARTICLE'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Preview Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="gap-1.5 text-xs font-medium shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Live Preview
          </Button>

          {/* Save as Draft */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={savingAction !== null}
            onClick={() => handleSave('DRAFT')}
            className="gap-1.5 text-xs font-medium shadow-xs"
          >
            {savingAction === 'DRAFT' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </Button>

          {/* Publish Button */}
          <Button
            type="button"
            size="sm"
            disabled={savingAction !== null}
            onClick={() => handleSave('PUBLISHED')}
            className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {savingAction === 'PUBLISHED' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Publish Post
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Title, Excerpt, Rich Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Photo Dropzone */}
          <div className="rounded-xl border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                Featured Cover Image
              </Label>
              {coverImageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCoverImageUrl('')}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Remove Cover
                </Button>
              )}
            </div>

            {coverImageUrl ? (
              <div className="relative rounded-lg overflow-hidden border bg-muted/40 group">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="h-56 w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                </div>
                <Input
                  placeholder="Optional image caption or credit..."
                  value={coverImageCaption}
                  onChange={(e) => setCoverImageCaption(e.target.value)}
                  className="mt-2 text-xs border-0 bg-transparent text-muted-foreground text-center"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all text-center"
              >
                {uploadingCover ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-xs font-medium">Uploading cover photo...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      Upload featured cover image
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WebP up to 10MB (recommended 16:9 ratio)
                    </span>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCoverUpload(e.target.files[0])
                }
              }}
            />
          </div>

          {/* Article Title */}
          <div className="space-y-2">
            <Textarea
              placeholder="Article Title..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              rows={2}
              className="resize-none font-serif text-2xl sm:text-3xl font-bold tracking-tight border-0 shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/50 leading-tight"
            />
          </div>

          {/* Excerpt / Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="excerpt" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Short Summary / Excerpt
            </Label>
            <Textarea
              id="excerpt"
              placeholder="A captivating 1-2 sentence preview for cards and search engines..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="text-sm resize-none rounded-xl"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Article Content & Story
            </Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              minHeightClassName="min-h-[460px]"
            />
          </div>
        </div>

        {/* Right 1 Col: Publishing Settings & Metadata */}
        <div className="space-y-6">
          {/* Post Settings Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-3">
                <Folder className="h-4 w-4 text-primary" />
                Post Settings
              </h3>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-medium flex items-center justify-between">
                  <span>URL Slug</span>
                  {slugManual && (
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManual(false)
                        setSlug(generateSlug(title))
                      }}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Reset auto
                    </button>
                  )}
                </Label>
                <div className="flex items-center rounded-lg border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  <span className="shrink-0 text-muted-foreground/70">/blog/</span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugManual(true)
                      setSlug(generateSlug(e.target.value))
                    }}
                    placeholder="post-slug"
                    className="w-full bg-transparent font-mono outline-none text-foreground"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-medium">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tags" className="text-xs font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3 text-primary" /> Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="Type tag & press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="text-xs"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="text-xs gap-1 py-0.5 px-2 bg-muted hover:bg-muted font-normal"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-destructive transition-colors ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Author Details Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b pb-3">
                <User className="h-4 w-4 text-primary" />
                Author Attribution
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="author-name" className="text-xs font-medium">
                  Author Name
                </Label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="TBYT"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="author-email" className="text-xs font-medium">
                  Author Email
                </Label>
                <Input
                  id="author-email"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="admin@expn-ai.com"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="author-avatar" className="text-xs font-medium">
                  Author Avatar / Logo URL
                </Label>
                <Input
                  id="author-avatar"
                  value={authorAvatarUrl}
                  onChange={(e) => setAuthorAvatarUrl(e.target.value)}
                  placeholder="https://expn-ai.com/assets/tbyt-logo.png"
                  className="text-sm font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Publish CTA card */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle className="h-4 w-4" /> Ready to share?
              </div>
              <p className="text-xs text-muted-foreground">
                When you publish, your article will immediately become readable by visitors on the public web portal.
              </p>
              <Button
                type="button"
                onClick={() => handleSave('PUBLISHED')}
                disabled={savingAction !== null}
                className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {savingAction === 'PUBLISHED' ? 'Publishing...' : 'Publish Article Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Preview Modal */}
      <BlogPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        post={{
          title,
          excerpt,
          content,
          coverImageUrl,
          coverImageCaption,
          category,
          tags: tags.join(','),
          authorName,
          authorAvatarUrl,
        }}
      />
    </div>
  )
}
