"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Shield,
  AlertTriangle,
  Activity,
  Database,
  DollarSign,
  Gamepad2,
  Eye,
  Trash2,
  BarChart3,
} from "lucide-react"
import { useAudit, type AuditEvent, type AuditFilter } from "@/contexts/audit-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DateRangePicker } from "@/components/date-range-picker"

export default function AuditDashboard() {
  const { events, getFilteredEvents, getAuditStats, exportAuditLog, clearAuditLog, getComplianceReport } = useAudit()

  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>(events)
  const [filter, setFilter] = useState<AuditFilter>({})
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  // Apply filters
  useEffect(() => {
    const filtered = getFilteredEvents({
      ...filter,
      startDate: dateRange.from,
      endDate: dateRange.to,
    })
    setFilteredEvents(filtered)
  }, [filter, dateRange, events, getFilteredEvents])

  const stats = getAuditStats({
    ...filter,
    startDate: dateRange.from,
    endDate: dateRange.to,
  })

  const getEventIcon = (type: string) => {
    switch (type) {
      case "user_login":
      case "admin_login":
        return <User className="h-4 w-4 text-green-500" />
      case "user_logout":
      case "admin_logout":
        return <User className="h-4 w-4 text-orange-500" />
      case "user_role_change":
      case "user_ban":
      case "user_unban":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "game_start":
      case "game_end":
      case "bet_placed":
        return <Gamepad2 className="h-4 w-4 text-purple-500" />
      case "deposit":
      case "withdrawal":
        return <DollarSign className="h-4 w-4 text-yellow-500" />
      case "security_alert":
      case "suspicious_activity":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "data_export":
      case "data_import":
        return <Database className="h-4 w-4 text-indigo-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <User className="h-5 w-5 text-green-500" />
      case "authorization":
        return <Shield className="h-5 w-5 text-blue-500" />
      case "security":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "financial":
        return <DollarSign className="h-5 w-5 text-yellow-500" />
      case "gaming":
        return <Gamepad2 className="h-5 w-5 text-purple-500" />
      case "data":
        return <Database className="h-5 w-5 text-indigo-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Critical
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="gap-1 bg-red-600">
            <AlertTriangle className="h-3 w-3" /> Error
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="default" className="gap-1 bg-orange-500">
            <AlertTriangle className="h-3 w-3" /> Warning
          </Badge>
        )
      case "info":
        return (
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" /> Info
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "success":
        return (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
            Success
          </Badge>
        )
      case "failure":
        return (
          <Badge variant="destructive" className="gap-1">
            Failure
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatEventType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleExportCompliance = () => {
    const startDate = dateRange.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateRange.to || new Date()

    const report = getComplianceReport(startDate, endDate)
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `compliance-report-${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-500" />
            Audit & Compliance Dashboard
          </h2>
          <p className="text-muted-foreground">Comprehensive audit trail and compliance monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportAuditLog(filter)} className="gap-1">
            <Download className="h-4 w-4" />
            Export Audit Log
          </Button>
          <Button variant="outline" onClick={handleExportCompliance} className="gap-1">
            <FileText className="h-4 w-4" />
            Compliance Report
          </Button>
          <Button variant="destructive" onClick={clearAuditLog} className="gap-1">
            <Trash2 className="h-4 w-4" />
            Clear Log
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Activity className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                  </div>
                  <User className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed Logins</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failedLogins}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Security Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.securityAlerts}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Events by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.eventsByCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <span className="capitalize">{category}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.eventsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="capitalize">{severity}</span>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(severity)}
                        <span className="text-sm text-muted-foreground">({count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest audit events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.userName} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(event.severity)}
                      {getOutcomeBadge(event.outcome)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Event Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search events..."
                      value={filter.searchTerm || ""}
                      onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filter.category || "all"}
                    onValueChange={(value) => setFilter({ ...filter, category: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="authorization">Authorization</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={filter.severity || "all"}
                    onValueChange={(value) => setFilter({ ...filter, severity: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="outcome">Outcome</Label>
                  <Select
                    value={filter.outcome || "all"}
                    onValueChange={(value) => setFilter({ ...filter, outcome: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger id="outcome">
                      <SelectValue placeholder="All Outcomes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label>Date Range</Label>
                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Events</CardTitle>
              <CardDescription>
                Showing {filteredEvents.length} of {events.length} events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="hidden lg:table-cell">Time</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No events found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvents.slice(0, 50).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getEventIcon(event.type)}
                              <span className="hidden md:inline">{formatEventType(event.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{event.userName}</p>
                              <p className="text-xs text-muted-foreground">{event.userRole}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">{event.action}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="capitalize">
                              {event.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                          <TableCell>{getOutcomeBadge(event.outcome)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-col">
                              <span className="text-xs flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.timestamp).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(event)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getEventIcon(event.type)}
                                    {event.action}
                                  </DialogTitle>
                                  <DialogDescription>{event.description}</DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Event Details</h4>
                                    <div className="space-y-2">
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">ID:</span>
                                        <span className="col-span-2 font-mono text-xs">{event.id}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Type:</span>
                                        <span className="col-span-2">{formatEventType(event.type)}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">User:</span>
                                        <span className="col-span-2">
                                          {event.userName} ({event.userRole})
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="col-span-2 capitalize">{event.category}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Severity:</span>
                                        <span className="col-span-2">{getSeverityBadge(event.severity)}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Outcome:</span>
                                        <span className="col-span-2">{getOutcomeBadge(event.outcome)}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Time:</span>
                                        <span className="col-span-2">{new Date(event.timestamp).toLocaleString()}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">IP Address:</span>
                                        <span className="col-span-2 font-mono text-xs">{event.ipAddress}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Session:</span>
                                        <span className="col-span-2 font-mono text-xs">{event.sessionId}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Technical Details</h4>
                                    <div className="space-y-2 mb-4">
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Device:</span>
                                        <span className="col-span-2">{event.metadata.device}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">Browser:</span>
                                        <span className="col-span-2">{event.metadata.browser}</span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1 text-sm">
                                        <span className="text-muted-foreground">OS:</span>
                                        <span className="col-span-2">{event.metadata.os}</span>
                                      </div>
                                    </div>
                                    <h4 className="text-sm font-medium mb-2">Event Data</h4>
                                    <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[200px]">
                                      {JSON.stringify(event.details, null, 2)}
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
              {filteredEvents.length > 50 && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline">Load More Events</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Security Events
              </CardTitle>
              <CardDescription>Security-related audit events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents
                  .filter((event) => event.category === "security" || event.severity === "critical")
                  .slice(0, 10)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-950"
                    >
                      <div className="flex items-center gap-3">
                        {getEventIcon(event.type)}
                        <div>
                          <p className="font-medium">{event.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.userName} • {new Date(event.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm">{event.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(event.severity)}
                        {getOutcomeBadge(event.outcome)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Compliance Monitoring
              </CardTitle>
              <CardDescription>Regulatory compliance and audit trail management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <h3 className="font-semibold">Data Retention</h3>
                      <p className="text-2xl font-bold text-green-600">100%</p>
                      <p className="text-sm text-muted-foreground">Compliant</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <h3 className="font-semibold">Access Logging</h3>
                      <p className="text-2xl font-bold text-green-600">100%</p>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <h3 className="font-semibold">Audit Trail</h3>
                      <p className="text-2xl font-bold text-green-600">Complete</p>
                      <p className="text-sm text-muted-foreground">Integrity</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compliance Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>User authentication logging</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Administrative action tracking</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Financial transaction logging</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Data access monitoring</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Compliant
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Security incident tracking</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Compliant
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
