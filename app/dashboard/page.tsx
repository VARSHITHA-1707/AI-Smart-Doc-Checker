"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { FileUpload } from "@/components/upload/file-upload"
import { DocumentList } from "@/components/documents/document-list"
import { AnalysisResults } from "@/components/analysis/analysis-results"
import { ReportGenerator } from "@/components/reports/report-generator"
import { UsageMeter } from "@/components/billing/usage-meter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileText, BarChart3, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Document } from "@/lib/types/database"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedAnalysisJobId, setSelectedAnalysisJobId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Upload failed")
    }

    const result = await response.json()
    toast({
      title: "Upload Successful",
      description: `${files.length} file(s) uploaded successfully`,
    })

    // Refresh document list and switch to documents tab
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab("documents")

    return result
  }

  const handleAnalyzeDocument = async (document: Document) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document.id,
          analysisType: "contradiction",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Analysis failed")
      }

      const result = await response.json()
      setSelectedAnalysisJobId(result.analysisJobId)
      setSelectedDocument(document)
      setActiveTab("analysis")

      toast({
        title: "Analysis Started",
        description: "Your document is being analyzed. This may take a few moments.",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to start analysis",
        variant: "destructive",
      })
    }
  }

  const handleGenerateReport = (jobId: string) => {
    setSelectedAnalysisJobId(jobId)
    setActiveTab("reports")
  }

  const handleDeleteDocument = () => {
    setRefreshTrigger((prev) => prev + 1)
    toast({
      title: "Document Deleted",
      description: "Document has been removed successfully",
    })
  }

  const handleUpgradeClick = () => {
    router.push("/billing")
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <UsageMeter onUpgrade={handleUpgradeClick} />

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setActiveTab("upload")}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setActiveTab("documents")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Documents
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setActiveTab("analysis")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analysis
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setActiveTab("reports")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Documents</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Upload your documents to analyze them for contradictions and inconsistencies
                      </p>
                    </CardHeader>
                    <CardContent>
                      <FileUpload onUpload={handleFileUpload} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Documents</CardTitle>
                      <p className="text-sm text-muted-foreground">Manage your uploaded documents and start analysis</p>
                    </CardHeader>
                    <CardContent>
                      <DocumentList
                        onAnalyze={handleAnalyzeDocument}
                        onDelete={handleDeleteDocument}
                        refreshTrigger={refreshTrigger}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-6">
                  {selectedAnalysisJobId ? (
                    <AnalysisResults jobId={selectedAnalysisJobId} onGenerateReport={handleGenerateReport} />
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No Analysis Selected</h3>
                        <p className="text-muted-foreground mb-4">
                          Upload a document and start analysis to see results here
                        </p>
                        <Button onClick={() => setActiveTab("upload")}>Upload Document</Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                  {selectedAnalysisJobId && selectedDocument ? (
                    <ReportGenerator analysisJobId={selectedAnalysisJobId} documentName={selectedDocument.filename} />
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
                        <p className="text-muted-foreground mb-4">Complete an analysis first to generate reports</p>
                        <Button onClick={() => setActiveTab("documents")}>View Documents</Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
