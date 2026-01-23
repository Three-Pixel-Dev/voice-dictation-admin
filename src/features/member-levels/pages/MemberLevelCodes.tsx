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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemberLevelsCode } from "../hooks/use-member-levels-code"
import { useMemberLevels } from "../hooks/use-member-levels"
import type { MemberLevelCodeFilter } from "../types/member-levels-code.types"
import { toast } from "sonner"

export function MemberLevelCodes() {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [filter, setFilter] = useState<MemberLevelCodeFilter>({})
  const [codeSearch, setCodeSearch] = useState("")

  const { data, loading, error, refetch } = useMemberLevelsCode({
    page,
    size,
    sortBy: "id",
    sortDirection: "DESC",
    filter,
    autoFetch: true,
  })

  const { data: memberLevelsData } = useMemberLevels({
    page: 0,
    size: 100, // Get all member levels for the filter
    autoFetch: true,
  })

  const handleFilterChange = (value: string) => {
    const memberLevelId = value === "all" ? undefined : parseInt(value)
    setFilter({
      ...filter,
      memberLevelId: memberLevelId,
    })
    setPage(0) // Reset to first page when filter changes
  }

  const handleCodeSearch = () => {
    setFilter({
      ...filter,
      code: codeSearch.trim() || undefined,
    })
    setPage(0)
  }

  const handleClearFilter = () => {
    setFilter({})
    setCodeSearch("")
    setPage(0)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && data && newPage < data.totalPages) {
      setPage(newPage)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Member Level Codes</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Member Level Codes</h1>
          <p className="text-muted-foreground">
            View and manage all member level codes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter codes by member level or search by code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="memberLevel">Member Level</Label>
              <Select
                value={filter.memberLevelId?.toString() || "all"}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger id="memberLevel">
                  <SelectValue placeholder="All Member Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Member Levels</SelectItem>
                  {memberLevelsData?.content?.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codeSearch">Code Search</Label>
              <div className="flex gap-2">
                <Input
                  id="codeSearch"
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  placeholder="Enter code to search"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCodeSearch()
                    }
                  }}
                />
                <Button onClick={handleCodeSearch} variant="outline">
                  Search
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleClearFilter} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Member Level Codes</CardTitle>
          <CardDescription>
            A list of all member level codes in your system
            {data && ` (${data.totalItems} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Member Level</TableHead>
                    <TableHead>Activated At</TableHead>
                    <TableHead>Expired At</TableHead>
                    <TableHead>Created User Name</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.content && data.content.length > 0 ? (
                    data.content.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-medium">
                          {code.code}
                        </TableCell>
                        <TableCell>
                          {memberLevelsData?.content?.find(
                            (level) => level.id === code.memberLevelId
                          )?.name || `Level ${code.memberLevelId}`}
                        </TableCell>
                        <TableCell>{formatDate(code.activatedAt)}</TableCell>
                        <TableCell>{formatDate(code.expiredAt)}</TableCell>
                        <TableCell>{code.createdUserName || "-"}</TableCell>
                        <TableCell>
                          {formatDate(code.masterData?.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No member level codes found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page + 1} of {data.totalPages} ({data.totalItems} total items)
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
