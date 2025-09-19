"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, FileText, Calendar, BarChart3 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Document, AnalysisJob } from "@/lib/types/database"

interface DocumentWithAnalysis extends Document {
  analysis_jobs: AnalysisJob[]
}

interface DocumentListProps {
  onAnalyze: (document: Document) => void
  onDelete: (documentId: string) => void
  refreshTrigger?: number
}

export function DocumentList({ onAnalyze, onDelete, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/documents")

      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }

      const data = await response.json()
      setDocuments(data.documents)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger])

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      onDelete(documentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document")
    }
  }

  const getStatusBadge = (jobs: AnalysisJob[]) => {
    if (jobs.length === 0) {
      return <Badge variant="secondary">Not Analyzed</Badge>
    }

    const latestJob = jobs[0]
    switch (latestJob.status) {
      case "completed":
        return <Badge variant="default">Analyzed</Badge>
      case "processing":
        return <Badge variant="outline">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchDocuments} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
          <p className="text-muted-foreground">Upload your first document to get started with AI analysis.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.filename}
              </CardTitle>
              {getStatusBadge(document.analysis_jobs)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAnalyze(document)}
                  disabled={document.analysis_jobs.some((job) => job.status === "processing")}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {document.analysis_jobs.length > 0 ? "Re-analyze" : "Analyze"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(document.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
