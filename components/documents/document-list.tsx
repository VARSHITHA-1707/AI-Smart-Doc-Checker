"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, FileText, Calendar, GitCompareArrows, Eye, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Document, AnalysisJob } from "@/lib/types/database"

interface DocumentWithAnalysis extends Document {
  analysis_jobs: AnalysisJob[]
}

interface DocumentListProps {
  onAnalyze: (document: Document) => void
  onCompare: (documents: { id: string, name: string }[]) => void;
  onDelete: (documentId: string) => void
  refreshTrigger?: number
}

// Helper function to format file size
const formatFileSize = (size: number) => {
  if (size === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to determine the status badge
const getStatusBadge = (jobs: AnalysisJob[]) => {
  if (jobs.length === 0) {
    return <Badge variant="secondary">Not Analyzed</Badge>
  }
  const latestJob = jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
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

export function DocumentList({ onAnalyze, onCompare, onDelete, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

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

  const handleSelectForComparison = (docId: string) => {
    setSelectedForComparison(prev => {
        const isSelected = prev.includes(docId);
        if (isSelected) {
            return prev.filter(id => id !== docId);
        }
        if(prev.length < 2) {
            return [...prev, docId];
        }
        return prev;
    });
  }

  const handleCompareClick = () => {
    if (selectedForComparison.length === 2) {
        const docsToCompare = documents
            .filter(doc => selectedForComparison.includes(doc.id))
            .map(doc => ({ id: doc.id, name: doc.filename }));
      onCompare(docsToCompare);
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
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-muted-foreground">Upload your first document to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
        {selectedForComparison.length === 2 && (
            <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <p className="text-sm font-medium">Ready to compare 2 documents.</p>
                <Button size="sm" onClick={handleCompareClick}>
                    <GitCompareArrows className="h-4 w-4 mr-2" />
                    Compare Now
                </Button>
            </div>
        )}
      {documents.map((document) => {
        const isSelectedForComparison = selectedForComparison.includes(document.id);
        return (
        <Card key={document.id} className={isSelectedForComparison ? "border-primary" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Button 
                    variant={isSelectedForComparison ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleSelectForComparison(document.id)}
                    disabled={selectedForComparison.length >= 2 && !isSelectedForComparison}
                >
                  {isSelectedForComparison ? <CheckCircle className="h-4 w-4"/> : <GitCompareArrows className="h-4 w-4" />}
                </Button>
                <CardTitle className="text-lg font-medium">{document.filename}</CardTitle>
              </div>
              {getStatusBadge(document.analysis_jobs)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatFileSize(document.file_size)}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(document.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )})}
    </div>
  )
}