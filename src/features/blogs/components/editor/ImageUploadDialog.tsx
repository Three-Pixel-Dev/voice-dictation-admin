import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { blogService } from '../../services/blog.service'
import { toast } from 'sonner'
import { UploadCloud, Link as LinkIcon, Loader2, Image as ImageIcon, Check } from 'lucide-react'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertImage: (attrs: { src: string; alt?: string; title?: string }) => void
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onInsertImage,
}: ImageUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setImageUrl('')
    setAltText('')
    setCaption('')
    setPreviewSrc(null)
    setUploading(false)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP, GIF)')
      return
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      // Generate temporary preview
      const localPreview = URL.createObjectURL(file)
      setPreviewSrc(localPreview)

      const result = await blogService.uploadImage(file)
      setImageUrl(result.url)
      setPreviewSrc(result.url)
      toast.success('Image uploaded successfully!')
    } catch (err: any) {
      console.error('Upload failed', err)
      toast.error(err?.message || 'Failed to upload image. Please try again.')
      setPreviewSrc(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = () => {
    const finalUrl = activeTab === 'upload' ? previewSrc || imageUrl : imageUrl
    if (!finalUrl || !finalUrl.trim()) {
      toast.error('Please provide an image URL or upload a file')
      return
    }

    onInsertImage({
      src: finalUrl.trim(),
      alt: altText.trim() || undefined,
      title: caption.trim() || undefined,
    })

    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetState()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Insert Image
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'upload' | 'url')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              From Web URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 pt-3">
            <div
              onDragEnter={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0])
                  }
                }}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-foreground">Uploading image...</p>
                  <p className="text-xs text-muted-foreground">Uploading to cloud storage</p>
                </div>
              ) : previewSrc ? (
                <div className="relative flex flex-col items-center gap-2">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="max-h-[140px] w-auto rounded-lg object-contain shadow-sm"
                  />
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Uploaded ready
                  </span>
                  <p className="text-xs text-muted-foreground">Click or drop another to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 pt-3">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image Web URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            {imageUrl && (
              <div className="flex justify-center rounded-lg border bg-muted/20 p-2">
                <img
                  src={imageUrl}
                  alt="URL Preview"
                  className="max-h-[140px] rounded object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="alt-text" className="text-xs">
              Alt Text (Accessibility)
            </Label>
            <Input
              id="alt-text"
              placeholder="Descriptive text for screen readers"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="caption" className="text-xs">
              Caption / Title (Optional)
            </Label>
            <Input
              id="caption"
              placeholder="Photo caption shown below image"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetState()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={uploading || (activeTab === 'upload' ? !previewSrc : !imageUrl)}
            onClick={handleSubmit}
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
