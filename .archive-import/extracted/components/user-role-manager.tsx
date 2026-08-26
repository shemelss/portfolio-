"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, User, Crown, Search, UserCheck } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAdminActivity } from "@/contexts/admin-activity-context"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  balance: number
  registeredAt: string
  referralCode: string
}

export default function UserRoleManager() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { logAction } = useAdminActivity()

  // Get current admin user
  const getCurrentAdmin = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      return {
        id: currentUser.id || "unknown",
        name: currentUser.name || "Unknown Admin",
      }
    } catch (error) {
      console.error("Error getting current admin:", error)
      return { id: "unknown", name: "Unknown Admin" }
    }
  }

  // Load users from localStorage
  useEffect(() => {
    try {
      const usersData = localStorage.getItem("users")
      if (usersData) {
        const parsedUsers = JSON.parse(usersData)
        setUsers(parsedUsers)
        setFilteredUsers(parsedUsers)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.referralCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  const updateUserRole = (userId: string, newRole: string, oldRole: string) => {
    try {
      const admin = getCurrentAdmin()
      const targetUser = users.find((user) => user.id === userId)

      if (!targetUser) {
        throw new Error("User not found")
      }

      const updatedUsers = users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))

      // Update localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      setUsers(updatedUsers)

      // Update current user if they changed their own role
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      if (currentUser.id === userId) {
        const updatedCurrentUser = { ...currentUser, role: newRole }
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser))

        // Update auth cookie
        document.cookie = `auth=${encodeURIComponent(JSON.stringify(updatedCurrentUser))}; path=/; max-age=86400; SameSite=Lax`
      }

      // Log the action
      logAction({
        type: "user_role_change",
        description: `Changed ${targetUser.name}'s role from ${oldRole} to ${newRole}`,
        adminId: admin.id,
        adminName: admin.name,
        severity: newRole === "admin" ? "high" : "medium",
        details: {
          userId: userId,
          userName: targetUser.name,
          userEmail: targetUser.email,
          previousRole: oldRole,
          newRole: newRole,
          timestamp: new Date().toISOString(),
        },
      })

      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "moderator":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <CardDescription>Manage user roles and permissions across the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertDescription>
            <strong>Admin Privileges Required:</strong> Only administrators can modify user roles. Changes take effect
            immediately.
          </AlertDescription>
        </Alert>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, email, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Label htmlFor="role-filter">Filter by Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">Code: {user.referralCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>${user.balance}</TableCell>
                    <TableCell>{new Date(user.registeredAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.id, newRole, user.role)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "user").length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
