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
  AlertTriangle,
  Shield,
  Activity,
  Clock,
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { useSecurityMonitoring, type SecurityAnomaly } from "@/contexts/security-monitoring-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SecurityAnomalyDashboard() {
  const { anomalies, profiles, updateAnomalyStatus, getActiveAnomalies, getCriticalAnomalies, getAdminRiskScore } =
    useSecurityMonitoring()

  const [filteredAnomalies, setFilteredAnomalies] = useState<SecurityAnomaly[]>(anomalies)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [selectedAnomaly, setSelectedAnomaly] = useState<SecurityAnomaly | null>(null)

  // Apply filters
  useEffect(() => {
    let filtered = [...anomalies]

    if (searchTerm) {
      filtered = filtered.filter(
        (anomaly) =>
          anomaly.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          anomaly.adminName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((anomaly) => anomaly.type === typeFilter)
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((anomaly) => anomaly.severity === severityFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((anomaly) => anomaly.status === statusFilter)
    }

    setFilteredAnomalies(filtered)
  }, [anomalies, searchTerm, typeFilter, severityFilter, statusFilter]) // Use anomalies array instead of anomalies.length

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "suspicious_login":
        return <Shield className="h-4 w-4 text-red-500" />
      case "unusual_activity":
        return <Activity className="h-4 w-4 text-orange-500" />
      case "privilege_escalation":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "bulk_operations":
        return <Users className="h-4 w-4 text-yellow-500" />
      case "off_hours_access":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "rapid_actions":
        return <Activity className="h-4 w-4 text-purple-500" />
      case "failed_attempts":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "location_anomaly":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <AlertTriangle className="h-4 w-4" />
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
      case "high":
        return (
          <Badge variant="destructive" className="gap-1 bg-red-600">
            <AlertCircle className="h-3 w-3" /> High
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Active
          </Badge>
        )
      case "investigating":
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <Eye className="h-3 w-3" /> Investigating
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3" /> Resolved
          </Badge>
        )
      case "false_positive":
        return (
          <Badge variant="outline" className="gap-1">
            <XCircle className="h-3 w-3" /> False Positive
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600"
    if (score >= 60) return "text-orange-500"
    if (score >= 40) return "text-yellow-500"
    return "text-green-600"
  }

  const formatAnomalyType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const activeAnomalies = getActiveAnomalies()
  const criticalAnomalies = getCriticalAnomalies()

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalAnomalies.length > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300">
            <strong>Critical Security Alert:</strong> {criticalAnomalies.length} critical anomal
            {criticalAnomalies.length === 1 ? "y" : "ies"} detected requiring immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="anomalies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="anomalies" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Security Anomalies
          </TabsTrigger>
          <TabsTrigger value="profiles" className="gap-2">
            <Users className="h-4 w-4" />
            Admin Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-6">
          {/* Anomaly Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Anomalies</p>
                    <p className="text-2xl font-bold">{anomalies.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{activeAnomalies.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <p className="text-2xl font-bold text-red-700">{criticalAnomalies.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {anomalies.filter((a) => a.status === "resolved").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search anomalies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type-filter">Anomaly Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="suspicious_login">Suspicious Login</SelectItem>
                      <SelectItem value="unusual_activity">Unusual Activity</SelectItem>
                      <SelectItem value="privilege_escalation">Privilege Escalation</SelectItem>
                      <SelectItem value="bulk_operations">Bulk Operations</SelectItem>
                      <SelectItem value="off_hours_access">Off Hours Access</SelectItem>
                      <SelectItem value="rapid_actions">Rapid Actions</SelectItem>
                      <SelectItem value="failed_attempts">Failed Attempts</SelectItem>
                      <SelectItem value="location_anomaly">Location Anomaly</SelectItem>
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
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Security Anomalies</CardTitle>
              <CardDescription>Detected unusual admin behavior patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Admin</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnomalies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No anomalies found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAnomalies.slice(0, 10).map((anomaly) => (
                        <TableRow key={anomaly.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAnomalyIcon(anomaly.type)}
                              <span className="hidden md:inline">{formatAnomalyType(anomaly.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">{anomaly.title}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{anomaly.adminName}</TableCell>
                          <TableCell>{getSeverityBadge(anomaly.severity)}</TableCell>
                          <TableCell>{getStatusBadge(anomaly.status)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(anomaly.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedAnomaly(anomaly)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      {getAnomalyIcon(anomaly.type)}
                                      {anomaly.title}
                                    </DialogTitle>
                                    <DialogDescription>{anomaly.description}</DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Anomaly Details</h4>
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-1 text-sm">
                                          <span className="text-muted-foreground">Type:</span>
                                          <span className="col-span-2">{formatAnomalyType(anomaly.type)}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-sm">
                                          <span className="text-muted-foreground">Admin:</span>
                                          <span className="col-span-2">{anomaly.adminName}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-sm">
                                          <span className="text-muted-foreground">Severity:</span>
                                          <span className="col-span-2">{getSeverityBadge(anomaly.severity)}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-sm">
                                          <span className="text-muted-foreground">Status:</span>
                                          <span className="col-span-2">{getStatusBadge(anomaly.status)}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 text-sm">
                                          <span className="text-muted-foreground">Time:</span>
                                          <span className="col-span-2">
                                            {new Date(anomaly.timestamp).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                                      <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[200px]">
                                        {JSON.stringify(anomaly.details, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => updateAnomalyStatus(anomaly.id, "investigating")}
                                      disabled={anomaly.status === "investigating"}
                                    >
                                      Mark as Investigating
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => updateAnomalyStatus(anomaly.id, "resolved")}
                                      disabled={anomaly.status === "resolved"}
                                    >
                                      Mark as Resolved
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => updateAnomalyStatus(anomaly.id, "false_positive")}
                                      disabled={anomaly.status === "false_positive"}
                                    >
                                      False Positive
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {anomaly.status === "active" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateAnomalyStatus(anomaly.id, "investigating")}
                                >
                                  Investigate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          {/* Admin Risk Profiles */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Behavior Profiles</CardTitle>
              <CardDescription>Risk assessment and behavior analysis for each admin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profiles.map((profile) => (
                  <Card key={profile.adminId}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{profile.adminName}</h4>
                          <p className="text-sm text-muted-foreground">ID: {profile.adminId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Risk Score</p>
                          <p className={`text-2xl font-bold ${getRiskScoreColor(profile.riskScore)}`}>
                            {profile.riskScore}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Actions:</span>
                          <span>{profile.totalActions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Normal Hours:</span>
                          <span>
                            {profile.normalHours.start}:00 - {profile.normalHours.end}:00
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Login:</span>
                          <span>{new Date(profile.lastLoginTime).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Common Actions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.commonActionTypes.slice(0, 3).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {formatAnomalyType(type)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
