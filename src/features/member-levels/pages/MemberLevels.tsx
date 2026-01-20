import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemberLevels, useCreateMemberLevel, useUpdateMemberLevel, useDeleteMemberLevel } from "../hooks/use-member-levels"
import type { MemberLevel, MemberLevelRequest } from "../types/member-levels.types"
import { toast } from "sonner"

export function MemberLevels() {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const { data, loading, error, refetch } = useMemberLevels({ page, size })
  const { create, loading: creating } = useCreateMemberLevel()
  const { update, loading: updating } = useUpdateMemberLevel()
  const { delete: deleteMemberLevel, loading: deleting } = useDeleteMemberLevel()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<MemberLevel | null>(null)
  const [deletingLevel, setDeletingLevel] = useState<MemberLevel | null>(null)
  
  const [formData, setFormData] = useState<MemberLevelRequest>({
    name: "",
    durationDays: undefined,
    durationMonths: undefined,
  })

  const handleCreate = async () => {
    try {
      await create(formData)
      toast.success("Member level created successfully")
      setIsCreateDialogOpen(false)
      setFormData({ name: "", durationDays: undefined, durationMonths: undefined })
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create member level")
    }
  }

  const handleEdit = (level: MemberLevel) => {
    setEditingLevel(level)
    setFormData({
      name: level.name,
      durationDays: level.durationDays ?? undefined,
      durationMonths: level.durationMonths ?? undefined,
    })
  }

  const handleUpdate = async () => {
    if (!editingLevel) return
    try {
      await update(editingLevel.id, formData)
      toast.success("Member level updated successfully")
      setEditingLevel(null)
      setFormData({ name: "", durationDays: undefined, durationMonths: undefined })
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update member level")
    }
  }

  const handleDelete = async () => {
    if (!deletingLevel) return
    try {
      await deleteMemberLevel(deletingLevel.id)
      toast.success("Member level deleted successfully")
      setDeletingLevel(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete member level")
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Levels</h1>
          <p className="text-muted-foreground text-destructive mt-2">
            Error: {error.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Levels</h1>
          <p className="text-muted-foreground">
            Manage member subscription levels and their features
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Level
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Member Levels</CardTitle>
          <CardDescription>
            A list of all member levels in your system
            {data && ` (${data.totalItems} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration Days</TableHead>
                  <TableHead>Duration Months</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.content && data.content.length > 0 ? (
                  data.content.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell>{level.durationDays ?? "-"}</TableCell>
                      <TableCell>{level.durationMonths ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(level)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingLevel(level)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No member levels found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Member Level</DialogTitle>
            <DialogDescription>
              Add a new member level to your system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter level name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="durationDays">Duration Days</Label>
              <Input
                id="durationDays"
                type="number"
                value={formData.durationDays ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationDays: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Enter duration in days"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="durationMonths">Duration Months</Label>
              <Input
                id="durationMonths"
                type="number"
                value={formData.durationMonths ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMonths: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Enter duration in months"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !formData.name}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLevel} onOpenChange={(open) => !open && setEditingLevel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Level</DialogTitle>
            <DialogDescription>
              Update member level information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter level name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-durationDays">Duration Days</Label>
              <Input
                id="edit-durationDays"
                type="number"
                value={formData.durationDays ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationDays: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Enter duration in days"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-durationMonths">Duration Months</Label>
              <Input
                id="edit-durationMonths"
                type="number"
                value={formData.durationMonths ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMonths: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Enter duration in months"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingLevel(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating || !formData.name}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLevel} onOpenChange={(open) => !open && setDeletingLevel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member level
              "{deletingLevel?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
