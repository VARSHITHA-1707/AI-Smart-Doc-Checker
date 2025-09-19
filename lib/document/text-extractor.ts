import { createClient } from "@/lib/supabase/server"
import * as pdfParse from "pdf-parse"

export async function extractTextFromDocument(documentId: string, userId: string): Promise<string> {
  const supabase = await createClient()

  // Get document metadata
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("storage_path, file_type, filename")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single()

  if (docError || !document) {
    throw new Error("Document not found")
  }

  // Download file from storage
  const { data: fileData, error: storageError } = await supabase.storage
    .from("documents")
    .download(document.storage_path)

  if (storageError || !fileData) {
    throw new Error("Failed to download document")
  }

  // Convert to buffer
  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Extract text based on file type
  switch (document.file_type) {
    case "application/pdf":
      return await extractTextFromPDF(buffer)
    case "text/plain":
      return buffer.toString("utf-8")
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return await extractTextFromWord(buffer)
    default:
      throw new Error(`Unsupported file type: ${document.file_type}`)
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

async function extractTextFromWord(buffer: Buffer): Promise<string> {
  // For Word documents, we'll use a simple approach
  // In production, you might want to use libraries like mammoth or docx
  try {
    // This is a simplified approach - in reality you'd use proper Word parsing
    const text = buffer.toString("utf-8")
    // Remove binary data and extract readable text
    const cleanText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    if (cleanText.length < 50) {
      throw new Error("Unable to extract meaningful text from Word document")
    }

    return cleanText
  } catch (error) {
    console.error("Word extraction error:", error)
    throw new Error("Failed to extract text from Word document")
  }
}
