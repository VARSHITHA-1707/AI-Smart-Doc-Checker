"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, GitCompareArrows } from "lucide-react"
import type { AnalysisResult, Contradiction } from "@/lib/ai/gemini-client"

interface ComparisonResultsProps {
  documentIds: string[]
  documentNames: { id: string, name: string }[]
}

export function ComparisonResults({ documentIds, documentNames }: ComparisonResultsProps) {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComparisonResults = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/analyze/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentIds, documentNames }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch comparison results")
        }

        const data = await response.json()
        setResults(data.results)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load comparison results")
      } finally {
        setLoading(false)
      }
    }

    if (documentIds.length === 2) {
      fetchComparisonResults()
    }
  }, [documentIds, documentNames])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Comparing documents and searching for contradictions...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !results) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-500">{error || "Comparison results not found"}</p>
        </CardContent>
      </Card>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5" />
            Comparison Results
          </CardTitle>
           <p className="text-sm text-muted-foreground pt-2">
            Comparing <strong>{documentNames[0]?.name}</strong> and <strong>{documentNames[1]?.name}</strong>.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{results.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contradictions Found ({results.contradictions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.contradictions && results.contradictions.length > 0 ? (
            results.contradictions.map((contradiction: Contradiction, index: number) => (
              <Card key={contradiction.id || index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Contradiction #{index + 1}</CardTitle>
                    <Badge variant={getSeverityColor(contradiction.severity) as any}>
                      {contradiction.severity} severity
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Statement 1:</h4>
                    <blockquote className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-500">
                      "{contradiction.statement1}"
                    </blockquote>
                    <p className="text-xs text-muted-foreground mt-1">Location: {contradiction.location1}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Statement 2:</h4>
                    <blockquote className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-500">
                     "{contradiction.statement2}"
                    </blockquote>
                    <p className="text-xs text-muted-foreground mt-1">Location: {contradiction.location2}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Explanation:</h4>
                    <p className="text-sm text-muted-foreground">{contradiction.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Confidence: {Math.round(contradiction.confidence * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No Contradictions Found</h3>
              <p className="text-muted-foreground">The documents appear to be consistent with each other.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}