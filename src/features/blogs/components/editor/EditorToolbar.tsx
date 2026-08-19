import React from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  CodeXml,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Highlighter,
  Palette,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface EditorToolbarProps {
  editor: Editor | null
  onOpenImageDialog: () => void
  onOpenLinkDialog: () => void
}

const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Dark Slate', value: '#1e293b' },
  { label: 'Brand Green', value: '#16a34a' },
  { label: 'Sky Blue', value: '#0284c7' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Rose Red', value: '#e11d48' },
  { label: 'Amber Orange', value: '#d97706' },
  { label: 'Muted Gray', value: '#64748b' },
]

const HIGHLIGHTS = [
  { label: 'None', value: '' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Cyan', value: '#a5f3fc' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Purple', value: '#e9d5ff' },
]

export function EditorToolbar({
  editor,
  onOpenImageDialog,
  onOpenLinkDialog,
}: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  const IconButton = ({
    label,
    icon: Icon,
    isActive = false,
    disabled = false,
    onClick,
    shortcut,
  }: {
    label: string
    icon: React.ElementType
    isActive?: boolean
    disabled?: boolean
    onClick: () => void
    shortcut?: string
  }) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  const Separator = () => (
    <div className="mx-1 h-5 w-px bg-border shrink-0" aria-hidden="true" />
  )

  return (
    <div
      role="toolbar"
      aria-label="Editor toolbar"
      className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b bg-muted/40 p-1.5"
    >
      {/* Undo & Redo */}
      <IconButton
        label="Undo"
        icon={RotateCcw}
        shortcut="Ctrl+Z"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <IconButton
        label="Redo"
        icon={RotateCw}
        shortcut="Ctrl+Y"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />

      <Separator />

      {/* Headings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {editor.isActive('heading', { level: 1 }) && 'Heading 1'}
            {editor.isActive('heading', { level: 2 }) && 'Heading 2'}
            {editor.isActive('heading', { level: 3 }) && 'Heading 3'}
            {!editor.isActive('heading') && 'Paragraph'}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={cn(editor.isActive('paragraph') && 'font-bold text-primary')}
          >
            <Pilcrow className="mr-2 h-4 w-4" /> Paragraph
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(editor.isActive('heading', { level: 1 }) && 'font-bold text-primary')}
          >
            <Heading1 className="mr-2 h-4 w-4" /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(editor.isActive('heading', { level: 2 }) && 'font-bold text-primary')}
          >
            <Heading2 className="mr-2 h-4 w-4" /> Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(editor.isActive('heading', { level: 3 }) && 'font-bold text-primary')}
          >
            <Heading3 className="mr-2 h-4 w-4" /> Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator />

      {/* Text Styles */}
      <IconButton
        label="Bold"
        icon={Bold}
        shortcut="Ctrl+B"
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <IconButton
        label="Italic"
        icon={Italic}
        shortcut="Ctrl+I"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <IconButton
        label="Underline"
        icon={UnderlineIcon}
        shortcut="Ctrl+U"
        isActive={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <IconButton
        label="Strikethrough"
        icon={Strikethrough}
        shortcut="Ctrl+Shift+X"
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <IconButton
        label="Inline Code"
        icon={Code}
        isActive={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <Separator />

      {/* Text Color Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Text Color"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Palette className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="grid grid-cols-3 gap-1 p-2">
          {COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                if (!c.value) {
                  editor.chain().focus().unsetColor().run()
                } else {
                  editor.chain().focus().setColor(c.value).run()
                }
              }}
              className="flex items-center gap-1.5 rounded p-1.5 text-xs hover:bg-accent transition-colors"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border"
                style={{ backgroundColor: c.value || 'currentColor' }}
              />
              <span className="truncate">{c.label}</span>
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Highlight Text"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              editor.isActive('highlight')
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Highlighter className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="grid grid-cols-2 gap-1 p-2">
          {HIGHLIGHTS.map((h) => (
            <button
              key={h.label}
              type="button"
              onClick={() => {
                if (!h.value) {
                  editor.chain().focus().unsetHighlight().run()
                } else {
                  editor.chain().focus().setHighlight({ color: h.value }).run()
                }
              }}
              className="flex items-center gap-1.5 rounded p-1.5 text-xs hover:bg-accent transition-colors"
            >
              <span
                className="h-3.5 w-3.5 rounded border"
                style={{ backgroundColor: h.value || 'transparent' }}
              />
              <span>{h.label}</span>
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator />

      {/* Text Alignment */}
      <IconButton
        label="Align Left"
        icon={AlignLeft}
        isActive={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      />
      <IconButton
        label="Align Center"
        icon={AlignCenter}
        isActive={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      />
      <IconButton
        label="Align Right"
        icon={AlignRight}
        isActive={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      />
      <IconButton
        label="Align Justify"
        icon={AlignJustify}
        isActive={editor.isActive({ textAlign: 'justify' })}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      />

      <Separator />

      {/* Lists & Blocks */}
      <IconButton
        label="Bullet List"
        icon={List}
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <IconButton
        label="Numbered List"
        icon={ListOrdered}
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <IconButton
        label="Blockquote"
        icon={Quote}
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <IconButton
        label="Code Block"
        icon={CodeXml}
        isActive={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <IconButton
        label="Horizontal Rule"
        icon={Minus}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <Separator />

      {/* Inserts: Link, Image, Table */}
      <IconButton
        label="Insert Link"
        icon={LinkIcon}
        shortcut="Ctrl+K"
        isActive={editor.isActive('link')}
        onClick={onOpenLinkDialog}
      />
      <IconButton
        label="Insert Image"
        icon={ImageIcon}
        onClick={onOpenImageDialog}
      />

      {/* Table Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Insert / Manage Table"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              editor.isActive('table')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {!editor.isActive('table') ? (
            <DropdownMenuItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              Insert 3x3 Table
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                Add Row Below
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                Add Column Right
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="text-destructive font-medium"
              >
                Delete Table
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator />

      {/* Clear Formatting */}
      <IconButton
        label="Clear Formatting"
        icon={RemoveFormatting}
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      />
    </div>
  )
}
