'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { File, FileInsert, FileEntityType, FileKind } from '@/lib/db'

export interface ListFilesOptions {
  entity_type?: FileEntityType
  entity_id?: string
}

/**
 * List all files with optional filters
 */
export async function listFiles(
  options?: ListFilesOptions
): Promise<File[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('files')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options?.entity_type) {
    query = query.eq('entity_type', options.entity_type)
  }

  if (options?.entity_id) {
    query = query.eq('entity_id', options.entity_id)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single file by ID
 */
export async function getFile(id: string): Promise<File> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to get file: ${error.message}`)
  }

  return data
}

/**
 * Create a new file record
 */
export async function createFile(file: FileInsert): Promise<File> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('files')
    .insert(file as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create file: ${error.message}`)
  }

  return data as File
}

/**
 * Delete a file record and storage file
 */
export async function deleteFile(id: string): Promise<void> {
  const supabase = await createClient()

  // Get file to get storage path
  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error(`Failed to get file: ${fetchError.message}`)
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('attachments')
    .remove([(file as any).storage_path])

  if (storageError) {
    console.error('Failed to delete file from storage:', storageError)
    // Continue with database deletion even if storage fails
  }

  // Delete from database
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Upload a file to storage and create database record
 */
export async function uploadFile(
  fileData: {
    file: globalThis.File
    entity_type: FileEntityType
    entity_id: string
    file_kind: FileKind
  }
): Promise<File> {
  const supabase = await createClient()

  // Generate storage path
  const timestamp = Date.now()
  const sanitizedFilename = fileData.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${fileData.entity_type}/${fileData.entity_id}/${timestamp}_${sanitizedFilename}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(storagePath, fileData.file)

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`)
  }

  // Create database record
  const fileInsert: FileInsert = {
    entity_type: fileData.entity_type,
    entity_id: fileData.entity_id,
    file_kind: fileData.file_kind,
    storage_path: storagePath,
    mime_type: fileData.file.type,
  }

  return createFile(fileInsert)
}

/**
 * Get a signed URL for downloading a file
 */
export async function getFileDownloadUrl(storagePath: string): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry

  if (error) {
    throw new Error(`Failed to get download URL: ${error.message}`)
  }

  return data.signedUrl
}
