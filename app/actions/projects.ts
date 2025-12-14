'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createProject, updateProject } from '@/lib/data'
import { projectSchema } from '@/lib/validations'
import { getNextNumber } from '@/lib/data'

export async function createProjectAction(formData: FormData) {
  // Parse form data
  const data = {
    customer_id: formData.get('customer_id') as string,
    name: formData.get('name') as string,
    status: formData.get('status') as string,
    job_street: (formData.get('job_street') as string) || null,
    job_city: (formData.get('job_city') as string) || null,
    job_state: (formData.get('job_state') as string) || null,
    job_zip: (formData.get('job_zip') as string) || null,
  }

  // Validate with zod
  const parsed = projectSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    // Generate project number
    const projectNo = await getNextNumber('project')
    
    // Create project
    await createProject({
      ...parsed.data,
      project_no: projectNo,
    })

    revalidatePath('/app/projects')
  } catch (error) {
    console.error('Error creating project:', error)
    return { error: 'Failed to create project' }
  }

  redirect('/app/projects')
}

export async function updateProjectAction(id: string, formData: FormData) {
  // Parse form data
  const data = {
    customer_id: formData.get('customer_id') as string,
    name: formData.get('name') as string,
    status: formData.get('status') as string,
    job_street: (formData.get('job_street') as string) || null,
    job_city: (formData.get('job_city') as string) || null,
    job_state: (formData.get('job_state') as string) || null,
    job_zip: (formData.get('job_zip') as string) || null,
  }

  // Validate with zod
  const parsed = projectSchema.safeParse(data)
  
  if (!parsed.success) {
    return { error: 'Invalid form data' }
  }

  try {
    await updateProject(id, parsed.data)
    revalidatePath('/app/projects')
    revalidatePath(`/app/projects/${id}/edit`)
  } catch (error) {
    console.error('Error updating project:', error)
    return { error: 'Failed to update project' }
  }

  redirect('/app/projects')
}
