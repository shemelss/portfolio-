"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  Camera,
  Eye,
  RefreshCw,
  Award,
  Lock,
  Unlock,
  DollarSign,
  Hourglass,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useKYC, type KYCProfile, type DocumentType, type VerificationStatus } from "@/contexts/kyc-context"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface KYCVerificationProps {
  userId: string
  isAdmin?: boolean
}

export default function KYCVerification({ userId, isAdmin = false }: KYCVerificationProps) {
  const [kycProfile, setKYCProfile] = useState<KYCProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>("passport")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    phoneNumber: "",
    occupation: "",
    sourceOfFunds: "",
  })
  const [amlCheckInProgress, setAMLCheckInProgress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [rejectionReason, setRejectionReason] = useState("")

  const {
    getKYCProfile,
    createKYCProfile,
    updateKYCProfile,
    uploadDocument,
    reviewDocument,
    performAMLCheck,
    getVerificationLimits,
    isTransactionAllowed,
    kycStatus,
    submitKYCDocuments,
    resetKYCStatus,
    approveKYC,
    rejectKYC,
  } = useKYC()

  const auditLogger = useAuditLogger()

  // Load KYC profile on mount
  useEffect(() => {
    const profile = getKYCProfile(userId)
    setKYCProfile(profile)
  }, [userId, getKYCProfile])

  // Get verification level progress
  const getVerificationProgress = () => {
    if (!kycProfile) return 0

    switch (kycProfile.level) {
      case "unverified":
        return 0
      case "basic":
        return 25
      case "enhanced":
        return 75
      case "premium":
        return 100
      default:
        return 0
    }
  }

  // Get status color
  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      case "under_review":
        return "bg-blue-500"
      case "expired":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get document type icon
  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "passport":
      case "drivers_license":
      case "national_id":
        return <User className="h-4 w-4" />
      case "utility_bill":
      case "bank_statement":
        return <Building className="h-4 w-4" />
      case "proof_of_income":
        return <DollarSign className="h-4 w-4" />
      case "selfie_with_id":
        return <Camera className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Handle create KYC profile
  const handleCreateProfile = async () => {
    setIsLoading(true)
    try {
      const success = await createKYCProfile(userId, personalInfo)
      if (success) {
        toast({
          title: "KYC Profile Created",
          description: "Your verification profile has been created successfully.",
        })
        setShowCreateProfile(false)
        // Reload profile
        const profile = getKYCProfile(userId)
        setKYCProfile(profile)
      } else {
        toast({
          title: "Error",
          description: "Failed to create KYC profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating KYC profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (file: File) => {
    if (!file) return

    setIsLoading(true)
    setUploadProgress(0)

    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create file URL (in real implementation, this would be uploaded to cloud storage)
      const fileUrl = URL.createObjectURL(file)

      const success = await uploadDocument(userId, {
        userId,
        type: selectedDocumentType,
        fileName: file.name,
        fileUrl,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (success) {
        toast({
          title: "Document Uploaded",
          description: "Your document has been uploaded and is under review.",
        })
        setShowDocumentUpload(false)
        setUploadProgress(0)

        // Reload profile
        const profile = getKYCProfile(userId)
        setKYCProfile(profile)
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload document. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload Error",
        description: "An error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  // Handle document review (admin only)
  const handleDocumentReview = async (documentId: string, status: VerificationStatus, notes?: string) => {
    try {
      const success = await reviewDocument(documentId, status, notes)
      if (success) {
        toast({
          title: "Document Reviewed",
          description: `Document has been ${status}.`,
        })

        // Reload profile
        const profile = getKYCProfile(userId)
        setKYCProfile(profile)
      }
    } catch (error) {
      console.error("Error reviewing document:", error)
      toast({
        title: "Review Error",
        description: "Failed to review document.",
        variant: "destructive",
      })
    }
  }

  // Handle AML check
  const handleAMLCheck = async () => {
    setAMLCheckInProgress(true)
    try {
      const checks = [
        performAMLCheck(userId, "sanctions"),
        performAMLCheck(userId, "pep"),
        performAMLCheck(userId, "adverse_media"),
      ]

      const results = await Promise.all(checks)

      const hasMatches = results.some((result) => result.result !== "clear")

      toast({
        title: "AML Check Complete",
        description: hasMatches
          ? "Potential matches found. Manual review required."
          : "All checks passed successfully.",
        variant: hasMatches ? "destructive" : "default",
      })

      // Reload profile
      const profile = getKYCProfile(userId)
      setKYCProfile(profile)
    } catch (error) {
      console.error("Error performing AML check:", error)
      toast({
        title: "AML Check Failed",
        description: "Failed to perform AML checks.",
        variant: "destructive",
      })
    } finally {
      setAMLCheckInProgress(false)
    }
  }

  // Get verification limits
  const limits = kycProfile ? getVerificationLimits(userId) : { deposit: 100, withdrawal: 50 }

  const handleApprove = () => {
    approveKYC(userId)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }
    rejectKYC(userId, rejectionReason)
    setRejectionReason("")
  }

  const handleUpload = () => {
    selectedFiles.forEach((file) => handleDocumentUpload(file))
  }

  const renderStatusCard = () => {
    switch (kycStatus) {
      case "not_submitted":
        return (
          <Card className="border-blue-400 bg-blue-50 dark:bg-blue-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Lock className="h-5 w-5" /> KYC Required
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                To unlock full platform features and enable withdrawals, please complete your KYC verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kyc-files">Upload Documents</Label>
                <Input id="kyc-files" type="file" multiple onChange={handleFileSelect} />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFiles.map((file) => file.name).join(", ")}
                  </p>
                )}
              </div>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadProgress > 0}
                className="w-full"
              >
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Submit Documents"}
              </Button>
              {uploadProgress > 0 && <Progress value={uploadProgress} className="w-full" />}
              <Alert className="bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Accepted Documents:</AlertTitle>
                <AlertDescription>
                  Government ID (Passport, Driver's License), Proof of Address (Utility Bill, Bank Statement).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )
      case "pending":
        return (
          <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <Hourglass className="h-5 w-5" /> KYC Pending Review
              </CardTitle>
              <CardDescription className="text-yellow-600 dark:text-yellow-400">
                Your documents have been received and are currently under review. This may take up to 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={50} className="w-full" />
              <Alert className="bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You will receive a notification once your KYC status is updated.</AlertDescription>
              </Alert>
              <Button onClick={resetKYCStatus} variant="outline" className="w-full bg-transparent">
                Cancel Submission / Re-submit
              </Button>
            </CardContent>
          </Card>
        )
      case "verified":
        return (
          <Card className="border-green-400 bg-green-50 dark:bg-green-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" /> KYC Verified!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                Congratulations! Your identity has been successfully verified. You now have full access to all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200">
                <Unlock className="h-4 w-4" />
                <AlertDescription>
                  You can now deposit, withdraw, and enjoy all casino features without restrictions.
                </AlertDescription>
              </Alert>
              <Button onClick={resetKYCStatus} variant="outline" className="w-full bg-transparent">
                Reset KYC (for testing)
              </Button>
            </CardContent>
          </Card>
        )
      case "rejected":
        return (
          <Card className="border-red-400 bg-red-50 dark:bg-red-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-5 w-5" /> KYC Rejected
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                Unfortunately, your KYC submission was rejected. Please review the reason and try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Reason for Rejection:</AlertTitle>
                <AlertDescription>{rejectionReason || "No specific reason provided by admin."}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="rejection-notes">Admin Notes (for re-submission)</Label>
                <Textarea
                  id="rejection-notes"
                  placeholder="Enter reason for re-submission or additional details"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={resetKYCStatus} className="flex-1">
                  Re-submit KYC
                </Button>
                {/* Admin actions for testing */}
                <Button onClick={handleApprove} variant="outline" className="flex-1 bg-transparent">
                  Approve (Admin)
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  if (!kycProfile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KYC Verification Required
          </CardTitle>
          <CardDescription>
            Complete your identity verification to increase your transaction limits and access premium features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-800 dark:text-yellow-300">
                Your account has limited functionality. Complete KYC verification to unlock full features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="font-medium text-red-800 dark:text-red-300">Current Limits</p>
                <p className="text-red-600 dark:text-red-400">Deposit: $100/day</p>
                <p className="text-red-600 dark:text-red-400">Withdrawal: $50/day</p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <Unlock className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="font-medium text-green-800 dark:text-green-300">After Verification</p>
                <p className="text-green-600 dark:text-green-400">Deposit: Up to $25,000/day</p>
                <p className="text-green-600 dark:text-green-400">Withdrawal: Up to $10,000/day</p>
              </div>
            </div>

            <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="mr-2 h-4 w-4" />
                  Start Verification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create KYC Profile</DialogTitle>
                  <DialogDescription>
                    Please provide your personal information to begin the verification process.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={personalInfo.nationality}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={personalInfo.address.street}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          address: { ...personalInfo.address, street: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={personalInfo.address.city}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            address: { ...personalInfo.address, city: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={personalInfo.address.state}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            address: { ...personalInfo.address, state: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={personalInfo.address.postalCode}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            address: { ...personalInfo.address, postalCode: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={personalInfo.phoneNumber}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={personalInfo.occupation}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, occupation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sourceOfFunds">Source of Funds</Label>
                    <Select
                      value={personalInfo.sourceOfFunds}
                      onValueChange={(value) => setPersonalInfo({ ...personalInfo, sourceOfFunds: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source of funds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="investments">Investments</SelectItem>
                        <SelectItem value="inheritance">Inheritance</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateProfile(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProfile} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Profile"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-500" />
        KYC Verification
      </h2>
      <p className="text-muted-foreground">
        Ensure your account is fully verified for secure transactions and full access.
      </p>

      {renderStatusCard()}

      {/* Admin Controls (for demonstration/testing purposes) */}
      {isAdmin && (
        <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" /> Admin Controls (Demo)
            </CardTitle>
            <CardDescription>Simulate KYC approval/rejection for testing purposes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1 bg-green-500 hover:bg-green-600">
                Simulate Approve
              </Button>
              <Button onClick={handleReject} variant="destructive" className="flex-1">
                Simulate Reject
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-rejection-reason">Rejection Reason (for admin simulation)</Label>
              <Input
                id="admin-rejection-reason"
                placeholder="e.g., 'Unclear document image'"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* KYC Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              KYC Verification Status
            </div>
            <Badge className={getStatusColor(kycProfile.status)}>
              {kycProfile.status.replace("_", " ").toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>Current verification level: {kycProfile.level.toUpperCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Verification Progress</span>
                <span>{getVerificationProgress()}%</span>
              </div>
              <Progress value={getVerificationProgress()} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">Daily Limits</span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Deposit: ${limits.deposit.toLocaleString()}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Withdrawal: ${limits.withdrawal.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-300">Documents</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {kycProfile.documents.filter((d) => d.status === "approved").length} Approved
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {kycProfile.documents.filter((d) => d.status === "pending").length} Pending
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-purple-800 dark:text-purple-300">Risk Level</span>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 capitalize">{kycProfile.riskLevel}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Last Review: {kycProfile.lastReviewDate?.toLocaleDateString() || "Never"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Identity Documents</span>
                <Button size="sm" onClick={() => setShowDocumentUpload(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kycProfile.documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Upload your identity documents to begin verification</p>
                  </div>
                ) : (
                  kycProfile.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(document.type)}
                        <div>
                          <p className="font-medium">{document.fileName}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {document.type.replace("_", " ")} • Uploaded {document.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(document.status)}>
                          {document.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {document.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {document.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {document.status.replace("_", " ").toUpperCase()}
                        </Badge>

                        {isAdmin && (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDocumentReview(document.id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDocumentReview(document.id, "rejected", "Document quality insufficient")
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details used for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-lg">
                      {kycProfile.personalInfo.firstName} {kycProfile.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p>{kycProfile.personalInfo.dateOfBirth.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                    <p>{kycProfile.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <p>{kycProfile.personalInfo.phoneNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p>{kycProfile.personalInfo.address.street}</p>
                    <p>
                      {kycProfile.personalInfo.address.city}, {kycProfile.personalInfo.address.state}{" "}
                      {kycProfile.personalInfo.address.postalCode}
                    </p>
                    <p>{kycProfile.personalInfo.address.country}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                    <p>{kycProfile.personalInfo.occupation}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Source of Funds</Label>
                    <p className="capitalize">{kycProfile.personalInfo.sourceOfFunds}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AML Compliance Checks</span>
                <Button onClick={handleAMLCheck} disabled={amlCheckInProgress} size="sm">
                  {amlCheckInProgress ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Running Checks...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Run AML Check
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>Anti-Money Laundering and sanctions screening results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-800 dark:text-green-300">Sanctions Check</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">Clear</p>
                    <p className="text-xs text-green-500 dark:text-green-500">Last checked: Today</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-800 dark:text-green-300">PEP Check</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">Clear</p>
                    <p className="text-xs text-green-500 dark:text-green-500">Last checked: Today</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-800 dark:text-green-300">Adverse Media</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">Clear</p>
                    <p className="text-xs text-green-500 dark:text-green-500">Last checked: Today</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Compliance Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600 dark:text-blue-400">
                        Risk Level: <span className="font-medium capitalize">{kycProfile.riskLevel}</span>
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Last Review: {kycProfile.lastReviewDate?.toLocaleDateString() || "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-600 dark:text-blue-400">
                        Next Review: {kycProfile.nextReviewDate?.toLocaleDateString() || "TBD"}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Profile Created: {kycProfile.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
              <CardDescription>Complete timeline of verification events and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kycProfile.verificationHistory.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {event.type === "document_upload" && <Upload className="h-4 w-4 text-blue-500" />}
                      {event.type === "manual_review" && <Eye className="h-4 w-4 text-purple-500" />}
                      {event.type === "automated_check" && <RefreshCw className="h-4 w-4 text-green-500" />}
                      {event.type === "status_change" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {event.type === "risk_assessment" && <Shield className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{event.type.replace("_", " ")}</p>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.timestamp.toLocaleDateString()} at {event.timestamp.toLocaleTimeString()}
                        {event.reviewerId && ` • Reviewed by ${event.reviewerId}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a clear photo or scan of your identity document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select
                value={selectedDocumentType}
                onValueChange={(value) => setSelectedDocumentType(value as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="utility_bill">Utility Bill</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                  <SelectItem value="proof_of_income">Proof of Income</SelectItem>
                  <SelectItem value="selfie_with_id">Selfie with ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Accepted formats: JPEG, PNG, PDF (max 10MB)</p>
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentUpload(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
