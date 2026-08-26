"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuditLogger } from "@/hooks/use-audit-logger"
import { toast } from "@/hooks/use-toast"

// Define KYC verification levels
export type KYCLevel = "unverified" | "basic" | "enhanced" | "premium"

// Define verification status
export type VerificationStatus = "pending" | "approved" | "rejected" | "expired" | "under_review"

// Define document types
export type DocumentType =
  | "passport"
  | "drivers_license"
  | "national_id"
  | "utility_bill"
  | "bank_statement"
  | "proof_of_income"
  | "selfie_with_id"

// Define risk levels
export type RiskLevel = "low" | "medium" | "high" | "critical"

// Define document interface
export interface KYCDocument {
  id: string
  userId: string
  type: DocumentType
  fileName: string
  fileUrl: string
  uploadDate: Date
  status: VerificationStatus
  reviewDate?: Date
  reviewNotes?: string
  expiryDate?: Date
}

// Define KYC profile interface
export interface KYCProfile {
  id: string
  userId: string
  level: KYCLevel
  status: VerificationStatus
  riskLevel: RiskLevel
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: Date
    nationality: string
    address: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    phoneNumber: string
    occupation: string
    sourceOfFunds: string
  }
  documents: KYCDocument[]
  verificationHistory: VerificationEvent[]
  limits: {
    dailyDeposit: number
    monthlyDeposit: number
    dailyWithdrawal: number
    monthlyWithdrawal: number
  }
  createdAt: Date
  updatedAt: Date
  lastReviewDate?: Date
  nextReviewDate?: Date
}

// Define verification event interface
export interface VerificationEvent {
  id: string
  type: "document_upload" | "manual_review" | "automated_check" | "status_change" | "risk_assessment"
  status: VerificationStatus
  details: string
  timestamp: Date
  reviewerId?: string
}

// Define AML check interface
export interface AMLCheck {
  id: string
  userId: string
  checkType: "sanctions" | "pep" | "adverse_media" | "transaction_monitoring"
  result: "clear" | "match" | "potential_match"
  details: any
  timestamp: Date
  source: string
}

// Define KYC context interface
interface KYCContextType {
  kycStatus: KycStatus
  submitKYCDocuments: (documents: File[]) => Promise<void>
  resetKYCStatus: () => void
  getKYCProfile: (userId: string) => KYCProfile | null
  createKYCProfile: (userId: string, personalInfo: any) => Promise<boolean>
  updateKYCProfile: (userId: string, updates: Partial<KYCProfile>) => Promise<boolean>
  uploadDocument: (userId: string, document: Omit<KYCDocument, "id" | "uploadDate" | "status">) => Promise<boolean>
  reviewDocument: (documentId: string, status: VerificationStatus, notes?: string) => Promise<boolean>
  performAMLCheck: (userId: string, checkType: AMLCheck["checkType"]) => Promise<AMLCheck>
  getVerificationLimits: (userId: string) => { deposit: number; withdrawal: number }
  isTransactionAllowed: (userId: string, amount: number, type: "deposit" | "withdrawal") => boolean
  getComplianceReport: (startDate: Date, endDate: Date) => any
  approveKYC: (userId: string) => void
  rejectKYC: (userId: string, reason: string) => void
}

type KycStatus = "not_submitted" | "pending" | "verified" | "rejected"

// Create context
const KYCContext = createContext<KYCContextType | undefined>(undefined)

// Create hook for using KYC context
export const useKYC = () => {
  const context = useContext(KYCContext)
  if (!context) {
    throw new Error("useKYC must be used within a KYCProvider")
  }
  return context
}

// Create KYC provider component
export const KYCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kycProfiles, setKYCProfiles] = useState<KYCProfile[]>([])
  const [amlChecks, setAMLChecks] = useState<AMLCheck[]>([])
  const [kycStatus, setKycStatus] = useState<KycStatus>("not_submitted")
  const auditLogger = useAuditLogger()

  // Simulate user ID (in a real app, this would come from auth context)
  const userId = "current_user_id" // Placeholder

  // Load KYC data from localStorage on mount
  useEffect(() => {
    try {
      const storedProfiles = localStorage.getItem("kycProfiles")
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles)
        // Convert date strings back to Date objects
        const formattedProfiles = parsedProfiles.map((profile: any) => ({
          ...profile,
          personalInfo: {
            ...profile.personalInfo,
            dateOfBirth: new Date(profile.personalInfo.dateOfBirth),
          },
          documents: profile.documents.map((doc: any) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate),
            reviewDate: doc.reviewDate ? new Date(doc.reviewDate) : undefined,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
          })),
          verificationHistory: profile.verificationHistory.map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp),
          })),
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt),
          lastReviewDate: profile.lastReviewDate ? new Date(profile.lastReviewDate) : undefined,
          nextReviewDate: profile.nextReviewDate ? new Date(profile.nextReviewDate) : undefined,
        }))
        setKYCProfiles(formattedProfiles)
      }

      const storedAMLChecks = localStorage.getItem("amlChecks")
      if (storedAMLChecks) {
        const parsedChecks = JSON.parse(storedAMLChecks)
        const formattedChecks = parsedChecks.map((check: any) => ({
          ...check,
          timestamp: new Date(check.timestamp),
        }))
        setAMLChecks(formattedChecks)
      }

      const storedStatus = localStorage.getItem(`kycStatus_${userId}`) as KycStatus
      if (storedStatus) {
        setKycStatus(storedStatus)
      }
    } catch (error) {
      console.error("Error loading KYC data:", error)
    }
  }, [userId])

  // Save KYC profiles to localStorage when they change
  useEffect(() => {
    if (kycProfiles.length > 0) {
      localStorage.setItem("kycProfiles", JSON.stringify(kycProfiles))
    }
  }, [kycProfiles])

  // Save AML checks to localStorage when they change
  useEffect(() => {
    if (amlChecks.length > 0) {
      localStorage.setItem("amlChecks", JSON.stringify(amlChecks))
    }
  }, [amlChecks])

  // Save KYC status to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`kycStatus_${userId}`, kycStatus)
  }, [kycStatus, userId])

  // Generate unique IDs
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Get KYC profile for a user
  const getKYCProfile = (userId: string): KYCProfile | null => {
    return kycProfiles.find((profile) => profile.userId === userId) || null
  }

  // Create KYC profile
  const createKYCProfile = async (userId: string, personalInfo: any): Promise<boolean> => {
    try {
      const newProfile: KYCProfile = {
        id: generateId(),
        userId,
        level: "unverified",
        status: "pending",
        riskLevel: "medium",
        personalInfo: {
          ...personalInfo,
          dateOfBirth: new Date(personalInfo.dateOfBirth),
        },
        documents: [],
        verificationHistory: [
          {
            id: generateId(),
            type: "status_change",
            status: "pending",
            details: "KYC profile created",
            timestamp: new Date(),
          },
        ],
        limits: {
          dailyDeposit: 500,
          monthlyDeposit: 2000,
          dailyWithdrawal: 100,
          monthlyWithdrawal: 500,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setKYCProfiles((prev) => [...prev, newProfile])

      // Log KYC profile creation
      auditLogger.logSecurityAction("KYC Profile Created", {
        userId,
        profileId: newProfile.id,
        level: newProfile.level,
      })

      return true
    } catch (error) {
      console.error("Error creating KYC profile:", error)
      return false
    }
  }

  // Update KYC profile
  const updateKYCProfile = async (userId: string, updates: Partial<KYCProfile>): Promise<boolean> => {
    try {
      setKYCProfiles((prev) =>
        prev.map((profile) => {
          if (profile.userId === userId) {
            const updatedProfile = {
              ...profile,
              ...updates,
              updatedAt: new Date(),
            }

            // Add verification event if status changed
            if (updates.status && updates.status !== profile.status) {
              updatedProfile.verificationHistory = [
                ...profile.verificationHistory,
                {
                  id: generateId(),
                  type: "status_change",
                  status: updates.status,
                  details: `Status changed from ${profile.status} to ${updates.status}`,
                  timestamp: new Date(),
                },
              ]
            }

            return updatedProfile
          }
          return profile
        }),
      )

      // Log KYC profile update
      auditLogger.logSecurityAction("KYC Profile Updated", {
        userId,
        updates: Object.keys(updates),
      })

      return true
    } catch (error) {
      console.error("Error updating KYC profile:", error)
      return false
    }
  }

  // Upload document
  const uploadDocument = async (
    userId: string,
    document: Omit<KYCDocument, "id" | "uploadDate" | "status">,
  ): Promise<boolean> => {
    try {
      const newDocument: KYCDocument = {
        ...document,
        id: generateId(),
        uploadDate: new Date(),
        status: "pending",
      }

      // Update KYC profile with new document
      setKYCProfiles((prev) =>
        prev.map((profile) => {
          if (profile.userId === userId) {
            return {
              ...profile,
              documents: [...profile.documents, newDocument],
              verificationHistory: [
                ...profile.verificationHistory,
                {
                  id: generateId(),
                  type: "document_upload",
                  status: "pending",
                  details: `Uploaded ${document.type} document: ${document.fileName}`,
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          }
          return profile
        }),
      )

      // Log document upload
      auditLogger.logSecurityAction("KYC Document Uploaded", {
        userId,
        documentId: newDocument.id,
        documentType: document.type,
        fileName: document.fileName,
      })

      return true
    } catch (error) {
      console.error("Error uploading document:", error)
      return false
    }
  }

  // Review document
  const reviewDocument = async (documentId: string, status: VerificationStatus, notes?: string): Promise<boolean> => {
    try {
      let userId = ""

      setKYCProfiles((prev) =>
        prev.map((profile) => {
          const updatedDocuments = profile.documents.map((doc) => {
            if (doc.id === documentId) {
              userId = profile.userId
              return {
                ...doc,
                status,
                reviewDate: new Date(),
                reviewNotes: notes,
              }
            }
            return doc
          })

          if (profile.documents.some((doc) => doc.id === documentId)) {
            return {
              ...profile,
              documents: updatedDocuments,
              verificationHistory: [
                ...profile.verificationHistory,
                {
                  id: generateId(),
                  type: "manual_review",
                  status,
                  details: `Document reviewed: ${status}${notes ? ` - ${notes}` : ""}`,
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          }
          return profile
        }),
      )

      // Log document review
      auditLogger.logSecurityAction("KYC Document Reviewed", {
        userId,
        documentId,
        status,
        notes,
      })

      return true
    } catch (error) {
      console.error("Error reviewing document:", error)
      return false
    }
  }

  // Perform AML check
  const performAMLCheck = async (userId: string, checkType: AMLCheck["checkType"]): Promise<AMLCheck> => {
    try {
      // Simulate AML check (in real implementation, this would call external APIs)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const amlCheck: AMLCheck = {
        id: generateId(),
        userId,
        checkType,
        result: Math.random() > 0.95 ? "potential_match" : "clear", // 5% chance of potential match
        details: {
          searchTerms: ["user_name", "user_address"],
          databases: ["OFAC", "EU Sanctions", "UN Sanctions"],
          confidence: Math.random() * 100,
        },
        timestamp: new Date(),
        source: "compliance_api",
      }

      setAMLChecks((prev) => [...prev, amlCheck])

      // Log AML check
      auditLogger.logSecurityAction("AML Check Performed", {
        userId,
        checkType,
        result: amlCheck.result,
        checkId: amlCheck.id,
      })

      return amlCheck
    } catch (error) {
      console.error("Error performing AML check:", error)
      throw error
    }
  }

  // Get verification limits based on KYC level
  const getVerificationLimits = (userId: string): { deposit: number; withdrawal: number } => {
    const profile = getKYCProfile(userId)

    if (!profile) {
      return { deposit: 100, withdrawal: 50 } // Unverified limits
    }

    switch (profile.level) {
      case "basic":
        return { deposit: 1000, withdrawal: 500 }
      case "enhanced":
        return { deposit: 5000, withdrawal: 2500 }
      case "premium":
        return { deposit: 25000, withdrawal: 10000 }
      default:
        return { deposit: 100, withdrawal: 50 }
    }
  }

  // Check if transaction is allowed
  const isTransactionAllowed = (userId: string, amount: number, type: "deposit" | "withdrawal"): boolean => {
    const profile = getKYCProfile(userId)

    if (!profile) {
      return amount <= (type === "deposit" ? 100 : 50)
    }

    if (profile.status !== "approved") {
      return false
    }

    const limits = getVerificationLimits(userId)
    return amount <= (type === "deposit" ? limits.deposit : limits.withdrawal)
  }

  // Generate compliance report
  const getComplianceReport = (startDate: Date, endDate: Date) => {
    const profilesInRange = kycProfiles.filter(
      (profile) => profile.createdAt >= startDate && profile.createdAt <= endDate,
    )

    const amlChecksInRange = amlChecks.filter((check) => check.timestamp >= startDate && check.timestamp <= endDate)

    return {
      period: { startDate, endDate },
      kycStats: {
        totalProfiles: profilesInRange.length,
        byLevel: {
          unverified: profilesInRange.filter((p) => p.level === "unverified").length,
          basic: profilesInRange.filter((p) => p.level === "basic").length,
          enhanced: profilesInRange.filter((p) => p.level === "enhanced").length,
          premium: profilesInRange.filter((p) => p.level === "premium").length,
        },
        byStatus: {
          pending: profilesInRange.filter((p) => p.status === "pending").length,
          approved: profilesInRange.filter((p) => p.status === "approved").length,
          rejected: profilesInRange.filter((p) => p.status === "rejected").length,
          under_review: profilesInRange.filter((p) => p.status === "under_review").length,
        },
      },
      amlStats: {
        totalChecks: amlChecksInRange.length,
        byType: {
          sanctions: amlChecksInRange.filter((c) => c.checkType === "sanctions").length,
          pep: amlChecksInRange.filter((c) => c.checkType === "pep").length,
          adverse_media: amlChecksInRange.filter((c) => c.checkType === "adverse_media").length,
          transaction_monitoring: amlChecksInRange.filter((c) => c.checkType === "transaction_monitoring").length,
        },
        byResult: {
          clear: amlChecksInRange.filter((c) => c.result === "clear").length,
          match: amlChecksInRange.filter((c) => c.result === "match").length,
          potential_match: amlChecksInRange.filter((c) => c.result === "potential_match").length,
        },
      },
    }
  }

  // Admin actions (simplified for demo)
  const approveKYC = useCallback(
    (targetUserId: string) => {
      // In a real app, this would be an admin action on a specific user
      if (targetUserId === userId) {
        setKycStatus("verified")
        toast({
          title: "KYC Approved",
          description: "User's KYC has been successfully verified.",
        })
      } else {
        // Simulate updating another user's status in a mock database
        console.log(`Admin approved KYC for user: ${targetUserId}`)
        toast({
          title: "KYC Approved (Admin Action)",
          description: `KYC for user ${targetUserId} has been approved.`,
        })
      }
    },
    [userId],
  )

  const rejectKYC = useCallback(
    (targetUserId: string, reason: string) => {
      // In a real app, this would be an admin action on a specific user
      if (targetUserId === userId) {
        setKycStatus("rejected")
        toast({
          title: "KYC Rejected",
          description: `Your KYC submission was rejected: ${reason}`,
          variant: "destructive",
        })
      } else {
        // Simulate updating another user's status in a mock database
        console.log(`Admin rejected KYC for user: ${targetUserId} with reason: ${reason}`)
        toast({
          title: "KYC Rejected (Admin Action)",
          description: `KYC for user ${targetUserId} has been rejected. Reason: ${reason}`,
          variant: "destructive",
        })
      }
    },
    [userId],
  )

  const submitKYCDocuments = useCallback(async (documents: File[]) => {
    // Simulate API call to submit documents
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (documents.length > 0) {
          setKycStatus("pending")
          toast({
            title: "KYC Submitted",
            description: "Your documents have been submitted for review. We will notify you of the status.",
          })
        } else {
          toast({
            title: "Submission Failed",
            description: "Please upload at least one document.",
            variant: "destructive",
          })
        }
        resolve()
      }, 1500)
    })
  }, [])

  const resetKYCStatus = useCallback(() => {
    setKycStatus("not_submitted")
    toast({
      title: "KYC Reset",
      description: "Your KYC status has been reset.",
    })
  }, [])

  const value: KYCContextType = {
    kycStatus,
    submitKYCDocuments,
    resetKYCStatus,
    getKYCProfile,
    createKYCProfile,
    updateKYCProfile,
    uploadDocument,
    reviewDocument,
    performAMLCheck,
    getVerificationLimits,
    isTransactionAllowed,
    getComplianceReport,
    approveKYC,
    rejectKYC,
  }

  return <KYCContext.Provider value={value}>{children}</KYCContext.Provider>
}
