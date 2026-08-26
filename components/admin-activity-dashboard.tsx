"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Activity,
  Search,
  Shield,
  AlertTriangle,
  Settings,
  UserX,
  UserCheck,
  LogIn,
  LogOut,
  Calendar,
  Clock,
  Download,
  Trash2,
} from "lucide-react"
import { useAdminActivity, type AdminAction, type AdminActionType } from "@/contexts/admin-activity-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminActivityDashboard() {
  const { actions, clearActions, getActionsByType } = useAdminActivity()
  const [filteredActions, setFilteredActions] = useState<AdminAction[]>(actions)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("all")
  const [selectedAction, setSelectedAction] = useState<AdminAction | null>(null)

  // Apply filters when actions, search term, or filters change
  useEffect(() => {
    let filtered = [...actions]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (action) =>
          action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          action.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(action.details).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by action type
    if (typeFilter !== "all") {
      filtered = filtered.filter((action) => action.type === typeFilter)
    }

    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter((action) => action.severity === severityFilter)
    }

    // Filter by time range
    if (timeRange !== "all") {
      const now = new Date()
      const cutoff = new Date()

      switch (timeRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0)
          break
        case "yesterday":
          cutoff.setDate(cutoff.getDate() - 1)
          cutoff.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoff.setDate(cutoff.getDate() - 7)
          break
        case "month":
          cutoff.setMonth(cutoff.getMonth() - 1)
          break
      }

      filtered = filtered.filter((action) => new Date(action.timestamp) >= cutoff)
    }

    setFilteredActions(filtered)
  }, [actions, searchTerm, typeFilter, severityFilter, timeRange]) // Use actions array instead of actions.length

  const getActionIcon = (type: AdminActionType) => {
    switch (type) {
      case "user_role_change":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "login":
        return <LogIn className="h-4 w-4 text-green-500" />
      case "logout":
        return <LogOut className="h-4 w-4 text-orange-500" />
      case "settings_change":
        return <Settings className="h-4 w-4 text-purple-500" />
      case "user_ban":
        return <UserX className="h-4 w-4 text-red-500" />
      case "user_unban":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "game_settings_change":
        return <Settings className="h-4 w-4 text-yellow-500" />
      case "referral_settings_change":
        return <Settings className="h-4 w-4 text-indigo-500" />
      case "system_maintenance":
        return <Activity className="h-4 w-4 text-blue-500" />
      case "security_alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="gap-1 bg-orange-500">
            <Activity className="h-3 w-3" /> Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" /> Low
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatActionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const exportToCSV = () => {
    const headers = ["ID", "Type", "Description", "Admin", "Timestamp", "Severity", "Details"]

    const csvRows = [
      headers.join(","),
      ...filteredActions.map((action) =>
        [
          action.id,
          action.type,
          `"${action.description.replace(/"/g, '""')}"`,
          action.adminName,
          new Date(action.timestamp).toISOString(),
          action.severity,
          `"${JSON.stringify(action.details).replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `admin-activity-log-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const actionTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "user_role_change", label: "User Role Change" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
    { value: "settings_change", label: "Settings Change" },
    { value: "user_ban", label: "User Ban" },
    { value: "user_unban", label: "User Unban" },
    { value: "game_settings_change", label: "Game Settings Change" },
    { value: "referral_settings_change", label: "Referral Settings Change" },
    { value: "system_maintenance", label: "System Maintenance" },
    { value: "security_alert", label: "Security Alert" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Admin Activity Dashboard
            </CardTitle>
            <CardDescription>Track and monitor all administrative actions and system changes</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="destructive" size="sm" onClick={clearActions} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">{actions.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Role Changes</p>
                  <p className="text-2xl font-bold">{getActionsByType("user_role_change").length}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Settings Changes</p>
                  <p className="text-2xl font-bold">{getActionsByType("settings_change").length}</p>
                </div>
                <Settings className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Alerts</p>
                  <p className="text-2xl font-bold">{getActionsByType("security_alert").length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type-filter">Action Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {actionTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="severity-filter">Severity</Label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger id="severity-filter">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="time-range">Time Range</Label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger id="time-range">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activity Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Admin</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No admin actions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredActions.slice(0, 10).map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.type as AdminActionType)}
                        <span className="hidden md:inline">{formatActionType(action.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{action.adminName}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] md:max-w-[300px] truncate">{action.description}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(action.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTime(action.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(action.severity)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAction(action)}>
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getActionIcon(action.type as AdminActionType)}
                              {formatActionType(action.type)}
                            </DialogTitle>
                            <DialogDescription>{action.description}</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Action Details</h4>
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                  <span className="text-muted-foreground">ID:</span>
                                  <span className="col-span-2 font-mono text-xs">{action.id}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                  <span className="text-muted-foreground">Admin:</span>
                                  <span className="col-span-2">{action.adminName}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                  <span className="text-muted-foreground">Admin ID:</span>
                                  <span className="col-span-2 font-mono text-xs">{action.adminId}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                  <span className="text-muted-foreground">Date:</span>
                                  <span className="col-span-2">{formatDate(action.timestamp)}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                  <span className="text-muted-foreground">Time:</span>
                                  <span className="col-span-2">{formatTime(action.timestamp)}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-sm">
                                  <span className="text-muted-foreground">Severity:</span>
                                  <span className="col-span-2">{getSeverityBadge(action.severity)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Additional Information</h4>
                              <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[200px]">
                                {JSON.stringify(action.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredActions.length > 10 && (
          <div className="flex justify-center">
            <Button variant="outline">Load More</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
