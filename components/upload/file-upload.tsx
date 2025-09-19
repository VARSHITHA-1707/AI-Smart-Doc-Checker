"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  disabled?: boolean
}

interface UploadFile extends File {
  id: string
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [".pdf", ".doc", ".docx", ".txt"],
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        ...file,
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: "pending" as const,
      }))

      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles))
    },
    [maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize,
    maxFiles,
    disabled: disabled || isUploading,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    const filesToUpload = files.filter((file) => file.status === "pending")

    try {
      // Update files to uploading status
      setFiles((prev) =>
        prev.map((file) => (filesToUpload.includes(file) ? { ...file, status: "uploading" as const } : file)),
      )

      await onUpload(filesToUpload)

      // Update files to success status
      setFiles((prev) =>
        prev.map((file) =>
          filesToUpload.includes(file) ? { ...file, status: "success" as const, progress: 100 } : file,
        ),
      )
    } catch (error) {
      // Update files to error status
      setFiles((prev) =>
        prev.map((file) =>
          filesToUpload.includes(file)
            ? { ...file, status: "error" as const, error: error instanceof Error ? error.message : "Upload failed" }
            : file,
        ),
      )
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "uploading":
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              disabled || isUploading ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-primary/5",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? "Drop files here" : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, DOCX, TXT files up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Files ({files.length})</h3>
                <Button onClick={handleUpload} disabled={isUploading || files.every((f) => f.status !== "pending")}>
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {file.status === "uploading" && <Progress value={file.progress} className="mt-2 h-1" />}
                    {file.status === "error" && file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
                  </div>
                  {file.status === "pending" && (
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
