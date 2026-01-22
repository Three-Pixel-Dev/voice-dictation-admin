import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  ArrowLeft, Calendar, Loader2, Sparkles, FileText, 
  MoreVertical, Pencil, Check, X 
} from "lucide-react"
import { toast } from "sonner"
import { useJobStatus } from "../hooks/use-voice-transcription"
import { voiceNotesService } from "../services/voice-notes.service"
import type { VoiceNote } from "../types/voice-notes-list.types"
import type {SummaryStyle } from "../types/voice-notes.types"
import { VoiceNoteDetail } from "../types/voice-notes-list.types"

interface VoiceNoteDetailViewProps {
  note: VoiceNote | undefined
  details: VoiceNoteDetail[] | null
  isLoading: boolean
  onBack: () => void
  onRefresh: () => void
}

export function VoiceNoteDetailView({ note, details, isLoading, onBack, onRefresh }: VoiceNoteDetailViewProps) {
  const [summaryJobId, setSummaryJobId] = useState<string | null>(null)
  const [activeDetailId, setActiveDetailId] = useState<number | null>(null)
  const [showStyleDialog, setShowStyleDialog] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<SummaryStyle>("FORMAL")
  const { status: jobStatus, checkStatus } = useJobStatus(summaryJobId)

 useEffect(() => {
    if (!summaryJobId) return
    console.log("Starting polling for:", summaryJobId)
    const pollInterval = setInterval(async () => {
      const currentStatus = await checkStatus() 
      console.log("Poll result:", currentStatus) 
      if (currentStatus?.status === "COMPLETED") {
        clearInterval(pollInterval)
        toast.success("Summary generated!")
        setSummaryJobId(null)
        setActiveDetailId(null)
        onRefresh() 
      } else if (currentStatus?.status === "FAILED") {
        clearInterval(pollInterval)
        toast.error("Summarization failed")
        setSummaryJobId(null)
        setActiveDetailId(null)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [summaryJobId, checkStatus, onRefresh])

  const handleOpenSummarizeDialog = (id: number) => {
    setActiveDetailId(id)
    setShowStyleDialog(true)
  }

  const confirmSummarize = async () => {
    if (!activeDetailId) return
    
    try {
      setShowStyleDialog(false)
      const response = await voiceNotesService.summarizeText({
        voiceNoteDetailId: activeDetailId,
        style: selectedStyle
      })
      
      if (response?.jobId) {
      setSummaryJobId(response.jobId)
    }
      toast.info("Generating summary...")
    } catch (err) {
      toast.error("Failed to start summarization")
      setActiveDetailId(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date"
    return new Date(dateString).toLocaleDateString("en-US", { 
      month: "short", day: "numeric", hour: 'numeric', minute: 'numeric' 
    })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{note?.title || "Note Details"}</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-3 w-3" />
            <span>{note?.masterData?.createdAt ? formatDate(note.masterData.createdAt) : "Unknown Date"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : details && details.length > 0 ? (
          <div className="space-y-6">
            {details.map((detail) => (
              <DetailItem 
                key={detail.id} 
                detail={detail} 
                onSave={(id, text) => console.log(id, text)}
                onSummarize={handleOpenSummarizeDialog}
              />
            ))}
            
            {summaryJobId && (
               <Card className="border-l-4 border-l-indigo-500/50 opacity-70 animate-pulse">
                 <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="animate-pulse">
                           <Sparkles className="h-3 w-3 mr-1" />
                           Generating Summary...
                        </Badge>
                    </div>
                 </CardHeader>
                 <CardContent>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                 </CardContent>
               </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No details found.</div>
        )}
      </div>

      <Dialog open={showStyleDialog} onOpenChange={setShowStyleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Summarize Text</DialogTitle>
            <DialogDescription>
              Choose a style for your summary. The AI will generate a new summary block below the original text.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 py-4">
            {(["FORMAL", "INFORMAL", "NARRATIVE", "BULLET_POINTS"] as SummaryStyle[]).map((style) => (
              <Button
                key={style}
                variant={selectedStyle === style ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(style)}
                className="capitalize"
              >
                {style.toLowerCase().replace("_", " ")}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStyleDialog(false)}>Cancel</Button>
            <Button onClick={confirmSummarize}>Generate Summary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface DetailItemProps {
  detail: VoiceNoteDetail
  onSave: (id: number, newText: string) => void
  onSummarize: (id: number) => void
}

function DetailItem({ detail, onSave, onSummarize }: DetailItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(detail.text)

  return (
    <Card className={`border-l-4 transition-all ${detail.type === "SUMMARIZED" ? "border-l-indigo-500" : "border-l-primary"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={detail.type === "SUMMARIZED" ? "default" : "secondary"}>
              {detail.type === "SUMMARIZED" ? <Sparkles className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
              {detail.type === "SUMMARIZED" ? "Summary" : "Transcript"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
             {detail.inputToken && detail.outputToken && (
               <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded hidden sm:block">
                 {detail.inputToken + detail.outputToken} tokens
               </div>
             )}

            {!isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSummarize(detail.id)}>
                    <Sparkles className="mr-2 h-4 w-4" /> Summarize
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea 
                value={editedText} 
                onChange={(e) => setEditedText(e.target.value)} 
                className="min-h-[150px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditedText(detail.text); }}>Cancel</Button>
              <Button size="sm" onClick={() => { onSave(detail.id, editedText); setIsEditing(false); }}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{detail.text}</div>
        )}
      </CardContent>
    </Card>
  )
}