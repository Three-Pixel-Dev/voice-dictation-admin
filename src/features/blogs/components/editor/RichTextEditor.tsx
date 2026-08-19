import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { EditorToolbar } from './EditorToolbar'
import { ImageUploadDialog } from './ImageUploadDialog'
import { LinkDialog } from './LinkDialog'
import { blogService } from '../../services/blog.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Clock, FileText, Type } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeightClassName?: string
  maxHeightClassName?: string
  className?: string
  disabled?: boolean
  label?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your story, share voice dictation tips, or drop images here...',
  minHeightClassName = 'min-h-[360px]',
  maxHeightClassName = 'max-h-[520px]',
  className,
  disabled = false,
  label = 'Blog content editor',
}: RichTextEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkInitialUrl, setLinkInitialUrl] = useState('')
  const [linkInitialText, setLinkInitialText] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted/80 text-foreground rounded-lg p-4 font-mono text-sm my-4 overflow-x-auto border border-border',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary pl-4 italic text-muted-foreground my-4 font-serif text-lg',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-4 shadow-sm border border-border mx-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:opacity-80 transition-opacity font-medium cursor-pointer',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 rounded-lg overflow-hidden border border-border text-sm',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border transition-colors hover:bg-muted/50',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/80 px-4 py-2.5 text-left font-semibold text-foreground',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border px-4 py-2 text-foreground align-top',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
        class: cn(
          'prose dark:prose-invert max-w-none px-6 py-5 outline-none focus:outline-none transition-all leading-relaxed',
          minHeightClassName,
          'text-[16px] text-foreground font-normal'
        ),
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            toast.loading('Uploading dropped image...', { id: 'drag-upload' })
            blogService
              .uploadImage(file)
              .then((res) => {
                toast.success('Image uploaded!', { id: 'drag-upload' })
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: res.url })
                  const transaction = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(transaction)
                }
              })
              .catch((err) => {
                toast.error('Failed to upload image: ' + err.message, { id: 'drag-upload' })
              })
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  // Sync value changes from parent (e.g. on load)
  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.getHTML()
    if (value !== currentHtml && (value || currentHtml !== '<p></p>')) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  const handleOpenLinkDialog = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href || ''
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ')
    setLinkInitialUrl(previousUrl)
    setLinkInitialText(selectedText)
    setLinkDialogOpen(true)
  }

  const handleSetLink = (url: string, targetBlank: boolean) => {
    if (!editor) return
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: targetBlank ? '_blank' : null })
      .run()
  }

  const handleUnlink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }

  const handleInsertImage = ({ src, alt, title }: { src: string; alt?: string; title?: string }) => {
    if (!editor) return
    editor.chain().focus().setImage({ src, alt, title }).run()
  }

  // Calculate live stats
  const textContent = editor?.getText() || ''
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0
  const charCount = textContent.length
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-card shadow-xs transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
    >
      {/* Formatting Toolbar */}
      <EditorToolbar
        editor={editor}
        onOpenImageDialog={() => setImageDialogOpen(true)}
        onOpenLinkDialog={handleOpenLinkDialog}
      />

      {/* Editor Content Area with Internal Scrollbar */}
      <div
        className={cn('relative flex-1 cursor-text overflow-y-auto', maxHeightClassName)}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Live Stats Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <strong className="font-semibold text-foreground">{wordCount}</strong> words
          </span>
          <span className="flex items-center gap-1">
            <Type className="h-3.5 w-3.5" />
            <strong className="font-semibold text-foreground">{charCount}</strong> characters
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Clock className="h-3.5 w-3.5" />
          <span>~{readTimeMinutes} min read</span>
        </div>
      </div>

      {/* Modals */}
      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsertImage={handleInsertImage}
      />

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        initialUrl={linkInitialUrl}
        initialText={linkInitialText}
        onSetLink={handleSetLink}
        onUnlink={handleUnlink}
      />
    </div>
  )
}
