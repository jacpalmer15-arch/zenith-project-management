'use server'

import { createClient } from '@/lib/supabase/serverClient'
import { File, FileInsert, FileWithEntity } from '@/lib/db'

export interface ListFilesOptions {
  customer_id?: string
  project_id?: string
  quote_id?: string
  work_order_id?: string
}

/**
 * List all files with optional filters
 */
export async function listFiles(
  options?: ListFilesOptions
): Promise<FileWithEntity[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('files')
    .select(`
      *,
      customer:customers(*),
      project:projects(*),
      quote:quotes(*),
      work_order:work_orders(*, customer:customers(*))
    `)
    .order('created_at', { ascending: false })
  
  if (options?.customer_id) {
    query = query.eq('customer_id', options.customer_id)
  }

  if (options?.project_id) {
    query = query.eq('project_id', options.project_id)
  }

  if (options?.quote_id) {
    query = query.eq('quote_id', options.quote_id)
  }

  if (options?.work_order_id) {
    query = query.eq('work_order_id', options.work_order_id)
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
export async function getFile(id: string): Promise<FileWithEntity> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      customer:customers(*),
      project:projects(*),
      quote:quotes(*),
      work_order:work_orders(*, customer:customers(*))
    `)
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
export async function createFile(file: FileInsert): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('files') as any)
    .insert(file)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create file: ${error.message}`)
  }

  return data
}

/**
 * Delete a file record and storage file
 */
export async function deleteFile(id: string): Promise<void> {
  const supabase = await createClient()

  // Get file to get storage path
  const { data: file, error: fetchError } = await (supabase
    .from('files') as any)
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
    entity_type: 'customer' | 'project' | 'quote' | 'work_order'
    entity_id: string
  }
): Promise<any> {
  const supabase = await createClient()

  // Generate storage path
  const timestamp = Date.now()
  const sanitizedFilename = fileData.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${fileData.entity_type}s/${fileData.entity_id}/${timestamp}_${sanitizedFilename}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(storagePath, fileData.file)

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`)
  }

  // Create database record
  const fileInsert: FileInsert = {
    storage_path: storagePath,
    filename: fileData.file.name,
    mime_type: fileData.file.type,
    size_bytes: fileData.file.size,
    customer_id: fileData.entity_type === 'customer' ? fileData.entity_id : null,
    project_id: fileData.entity_type === 'project' ? fileData.entity_id : null,
    quote_id: fileData.entity_type === 'quote' ? fileData.entity_id : null,
    work_order_id: fileData.entity_type === 'work_order' ? fileData.entity_id : null,
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
