import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Link as LinkIcon, Unlink } from 'lucide-react'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialUrl?: string
  initialText?: string
  onSetLink: (url: string, targetBlank: boolean) => void
  onUnlink?: () => void
}

export function LinkDialog({
  open,
  onOpenChange,
  initialUrl = '',
  initialText = '',
  onSetLink,
  onUnlink,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [openInNewTab, setOpenInNewTab] = useState(true)

  useEffect(() => {
    setUrl(initialUrl || '')
  }, [initialUrl, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      if (onUnlink) onUnlink()
    } else {
      let formatted = url.trim()
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://') && !formatted.startsWith('mailto:')) {
        formatted = 'https://' + formatted
      }
      onSetLink(formatted, openInNewTab)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            {initialUrl ? 'Edit Link' : 'Insert Link'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {initialText && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Selected Text</Label>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-foreground">
                {initialText}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="link-url">URL / Web Link</Label>
            <Input
              id="link-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="new-tab" className="text-sm font-medium">
                Open in new tab
              </Label>
              <p className="text-xs text-muted-foreground">Adds target="_blank" and rel="noopener"</p>
            </div>
            <Switch
              id="new-tab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {initialUrl && onUnlink && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="mr-auto gap-1"
                onClick={() => {
                  onUnlink()
                  onOpenChange(false)
                }}
              >
                <Unlink className="h-4 w-4" />
                Remove Link
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Apply Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
