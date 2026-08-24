import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Megaphone, CheckCircle2, ArrowRight, X } from "lucide-react"
import { Announcement } from "../types/announcement"

interface AnnouncementPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Partial<Announcement> | null
}

export function AnnouncementPreviewModal({
  open,
  onOpenChange,
  announcement,
}: AnnouncementPreviewModalProps) {
  if (!announcement) return null

  const isOneTime = announcement.displayType === "ONE_TIME"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl sm:rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Mobile Preview: {announcement.title || "Announcement"}</DialogTitle>
        </DialogHeader>

        {/* Mobile Mockup Card Container */}
        <div className="relative flex flex-col bg-background text-foreground max-h-[85vh] overflow-y-auto">
          {/* Header Gradient Accent / Cover Image */}
          {announcement.coverImageUrl ? (
            <div className="relative w-full h-48 sm:h-52 bg-muted overflow-hidden">
              <img
                src={announcement.coverImageUrl}
                alt={announcement.title || "Cover"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </div>
          ) : (
            <div className="relative w-full h-32 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/5 flex items-center justify-center border-b border-border/40">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center shadow-inner border border-emerald-500/30">
                <Megaphone className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Badges row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {announcement.badge || "What's New"}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  TBYT Announcement
                </span>
              </div>
              <Badge variant="outline" className="text-[11px] font-normal">
                {isOneTime ? "One-time popup" : "Always show"}
              </Badge>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {announcement.title || "Announcement Title"}
            </h2>

            {/* Content Body */}
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
              {announcement.content || "Here goes the description or details about the new feature, announcement, or updates to the users."}
            </div>

            {/* Action CTA Button */}
            <div className="pt-3 space-y-2">
              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-emerald-500/20 gap-2 text-base transition-all"
                onClick={() => onOpenChange(false)}
              >
                <span>{announcement.actionText || "Got it"}</span>
                {announcement.actionUrl && <ArrowRight className="w-4 h-4" />}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
