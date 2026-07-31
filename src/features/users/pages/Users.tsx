import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, MoreVertical, Loader2, Trash2, Plus, Eye, EyeOff, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useUsers, useDeleteUser, useCreateUserWithLoginCode, useCreateBulkUsersWithLoginCode, useUser, useUserActivationHistory } from "../hooks/use-users"
import { useMemberLevels } from "@/features/member-levels/hooks/use-member-levels"
import type { User } from "../types/users.types"
import { useDebounce } from "@/lib/use-debounce"
import { toast } from "sonner"

export function Users() {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const emailFilter = useMemo(() => {
    const q = debouncedSearchQuery?.trim()
    return q ? { email: q } : undefined
  }, [debouncedSearchQuery])
  
  const { data, loading, error, refetch } = useUsers({ 
    page, 
    size,
    sortBy: "id",
    sortDirection: "DESC",
    filter: emailFilter
  })
  const { delete: deleteUser, loading: deleting } = useDeleteUser()
  const { create: createUserWithLoginCode, loading: creatingUser } = useCreateUserWithLoginCode()
  const { createBulk: createBulkUsersWithLoginCode, loading: creatingBulkUsers } = useCreateBulkUsersWithLoginCode()
  const { data: memberLevelsData } = useMemberLevels({ 
    page: 0, 
    size: 100,
    autoFetch: true 
  })
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [viewingUserId, setViewingUserId] = useState<number | null>(null)
  const { data: viewingUser, loading: loadingUserDetails } = useUser(viewingUserId)
  const { data: activationHistory, loading: loadingActivationHistory } = useUserActivationHistory(viewingUserId)
  const [showLoginCode, setShowLoginCode] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createMode, setCreateMode] = useState<"single" | "bulk">("single")
  const [bulkGenerationMode, setBulkGenerationMode] = useState<"auto" | "custom">("auto")
  const [formData, setFormData] = useState({
    loginCode: "",
    memberLevelId: "",
  })
  const [bulkFormData, setBulkFormData] = useState({
    quantity: 5,
    prefix: "",
    memberLevelId: "",
    customCodesText: "",
  })
  const [createdBulkUsers, setCreatedBulkUsers] = useState<User[] | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    // When searching, jump back to the first page so results show immediately.
    setPage(0)
  }, [debouncedSearchQuery])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && data && newPage < data.totalPages) {
      setPage(newPage)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      await deleteUser(deletingUser.id)
      toast.success("User deleted successfully")
      setDeletingUser(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const handleCreateUserWithLoginCode = async () => {
    if (!formData.loginCode.trim() || !formData.memberLevelId) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const user = await createUserWithLoginCode({
        loginCode: formData.loginCode.trim(),
        memberLevelId: parseInt(formData.memberLevelId),
      })
      toast.success("User created successfully with login code")
      setIsCreateDialogOpen(false)
      setFormData({ loginCode: "", memberLevelId: "" })
      setCreatedBulkUsers([user])
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user with login code")
    }
  }

  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null)

  const handleCopySingleCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeIndex(index)
    toast.success(`Copied code: ${code}`)
    setTimeout(() => setCopiedCodeIndex(null), 2000)
  }

  const handleCreateBulkUsersWithLoginCode = async () => {
    if (!bulkFormData.memberLevelId) {
      toast.error("Please select a member level")
      return
    }

    let customCodes: string[] | undefined = undefined
    let quantity: number | undefined = undefined

    if (bulkGenerationMode === "custom") {
      const lines = bulkFormData.customCodesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      if (lines.length === 0) {
        toast.error("Please enter at least one custom code")
        return
      }
      if (lines.length > 10) {
        toast.error("Quantity limit exceeded: maximum 10 codes per request")
        return
      }
      customCodes = lines
    } else {
      const q = Number(bulkFormData.quantity)
      if (isNaN(q) || q < 1 || q > 10) {
        toast.error("Quantity must be between 1 and 10")
        return
      }
      quantity = q
    }

    try {
      const users = await createBulkUsersWithLoginCode({
        quantity,
        prefix: bulkFormData.prefix.trim() || undefined,
        customCodes,
        memberLevelId: parseInt(bulkFormData.memberLevelId),
      })
      toast.success(`Successfully created ${users.length} user(s) with login codes`)
      setIsCreateDialogOpen(false)
      setBulkFormData({ quantity: 5, prefix: "", memberLevelId: "", customCodesText: "" })
      setCreatedBulkUsers(users)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create bulk users")
    }
  }

  const handleCopyBulkCodes = () => {
    if (!createdBulkUsers || createdBulkUsers.length === 0) return
    const codes = createdBulkUsers
      .map((u) => u.loginCode)
      .filter(Boolean)
      .join("\n")
    navigator.clipboard.writeText(codes)
    setIsCopied(true)
    toast.success("All login codes copied to clipboard!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage and view all registered users
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User with Login Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                A list of all users in your system
                {data && ` (${data.totalItems} total)`}
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.content && data.content.length > 0 ? (
                  data.content.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={user.email} />
                            <AvatarFallback>
                              {user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.email.split("@")[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name ?? "-"}</TableCell>
                      <TableCell>
                        {formatDate(user.masterData?.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingUserId(user.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingUser(user)}
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page + 1} of {data.totalPages} ({data.totalItems} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.totalPages - 1 || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!viewingUserId} onOpenChange={(open) => !open && setViewingUserId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about the user
            </DialogDescription>
          </DialogHeader>
          {loadingUserDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : viewingUser ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>User ID</Label>
                <div className="px-3 py-2 border rounded-md bg-muted/50">
                  {viewingUser.id}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <div className="px-3 py-2 border rounded-md bg-muted/50">
                  {viewingUser.email}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Name</Label>
                <div className="px-3 py-2 border rounded-md bg-muted/50">
                  {viewingUser.name ?? "-"}
                </div>
              </div>
              {viewingUser.loginCode && (
                <div className="grid gap-2">
                  <Label>Login Code</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 border rounded-md bg-muted/50 font-mono">
                      {showLoginCode ? viewingUser.loginCode : "••••••••"}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowLoginCode((prev) => !prev)}
                    >
                      {showLoginCode ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {viewingUser.profileId && (
                <div className="grid gap-2">
                  <Label>Profile ID</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {viewingUser.profileId}
                  </div>
                </div>
              )}
              {viewingUser.masterData?.createdAt && (
                <div className="grid gap-2">
                  <Label>Created At</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {formatDate(viewingUser.masterData.createdAt)}
                  </div>
                </div>
              )}
              {viewingUser.masterData?.updatedAt && (
                <div className="grid gap-2">
                  <Label>Updated At</Label>
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {formatDate(viewingUser.masterData.updatedAt)}
                  </div>
                </div>
              )}

              {/* Code Activation History Section */}
              <div className="grid gap-2 pt-2 border-t mt-2">
                <Label className="text-base font-semibold">Code Activation History</Label>
                {loadingActivationHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : activationHistory && activationHistory.length > 0 ? (
                  <div className="border rounded-md overflow-hidden max-h-56 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Activated At</TableHead>
                          <TableHead>Expired At</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activationHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono font-medium">{item.code}</TableCell>
                            <TableCell>{item.memberLevelName}</TableCell>
                            <TableCell>{formatDate(item.activatedAt)}</TableCell>
                            <TableCell>{formatDate(item.expiredAt)}</TableCell>
                            <TableCell>
                              {item.status === "ACTIVE" ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>
                              ) : item.status === "EXPIRED" ? (
                                <Badge variant="secondary">Expired</Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-500">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-3 border rounded-md px-3 bg-muted/20 text-center">
                    No code activation history found for this user.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load user details
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUserId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User with Login Code Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create User(s) with Login Code</DialogTitle>
            <DialogDescription>
              Create single or bulk users with login codes (1 to 10 max).
            </DialogDescription>
          </DialogHeader>

          <Tabs value={createMode} onValueChange={(val) => setCreateMode(val as "single" | "bulk")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Code</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Generation (1-10)</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="loginCode">Login Code</Label>
                <Input
                  id="loginCode"
                  placeholder="Enter login code"
                  value={formData.loginCode}
                  onChange={(e) => setFormData({ ...formData, loginCode: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="memberLevelId">Member Level</Label>
                <Select
                  value={formData.memberLevelId}
                  onValueChange={(value) => setFormData({ ...formData, memberLevelId: value })}
                >
                  <SelectTrigger id="memberLevelId">
                    <SelectValue placeholder="Select member level" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberLevelsData?.content?.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="bulkMemberLevelId">Member Level</Label>
                <Select
                  value={bulkFormData.memberLevelId}
                  onValueChange={(value) => setBulkFormData({ ...bulkFormData, memberLevelId: value })}
                >
                  <SelectTrigger id="bulkMemberLevelId">
                    <SelectValue placeholder="Select member level" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberLevelsData?.content?.map((level) => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 text-sm font-medium">
                <Button
                  type="button"
                  variant={bulkGenerationMode === "auto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkGenerationMode("auto")}
                  className="flex-1"
                >
                  Auto-Generate Random
                </Button>
                <Button
                  type="button"
                  variant={bulkGenerationMode === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkGenerationMode("custom")}
                  className="flex-1"
                >
                  Custom List
                </Button>
              </div>

              {bulkGenerationMode === "auto" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity (1 to 10)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={10}
                      value={bulkFormData.quantity}
                      onChange={(e) => {
                        const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                        setBulkFormData({ ...bulkFormData, quantity: val })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Limit: Maximum 10 codes per request.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prefix">Code Prefix (Optional)</Label>
                    <Input
                      id="prefix"
                      placeholder="e.g. VIP- or PROMO-"
                      value={bulkFormData.prefix}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, prefix: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="customCodes">Paste Custom Codes (1 per line, max 10)</Label>
                  <Textarea
                    id="customCodes"
                    rows={4}
                    placeholder={`VIP1001\nVIP1002\nVIP1003`}
                    value={bulkFormData.customCodesText}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, customCodesText: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Enter up to 10 unique codes.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setFormData({ loginCode: "", memberLevelId: "" })
                setBulkFormData({ quantity: 5, prefix: "", memberLevelId: "", customCodesText: "" })
              }}
            >
              Cancel
            </Button>
            {createMode === "single" ? (
              <Button onClick={handleCreateUserWithLoginCode} disabled={creatingUser}>
                {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            ) : (
              <Button onClick={handleCreateBulkUsersWithLoginCode} disabled={creatingBulkUsers}>
                {creatingBulkUsers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Bulk Users
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Login Codes Results Dialog */}
      <Dialog open={!!createdBulkUsers} onOpenChange={(open) => !open && setCreatedBulkUsers(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createdBulkUsers?.length === 1 ? "Generated Login Code" : `Generated Login Codes (${createdBulkUsers?.length})`}
            </DialogTitle>
            <DialogDescription>
              The following login code(s) have been generated successfully. You can copy them or take a screenshot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 my-2">
            {createdBulkUsers?.map((user, idx) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-base font-bold tracking-wider text-foreground">
                    {user.loginCode}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                {user.loginCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleCopySingleCode(user.loginCode!, idx)}
                  >
                    {copiedCodeIndex === idx ? (
                      <Check className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground mr-1" />
                    )}
                    {copiedCodeIndex === idx ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
            {createdBulkUsers && createdBulkUsers.length > 1 ? (
              <Button variant="outline" onClick={handleCopyBulkCodes}>
                {isCopied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
                {isCopied ? "All Copied!" : "Copy All Codes"}
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={() => setCreatedBulkUsers(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              "{deletingUser?.email}".
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
