'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, ProjectFormData } from '@/lib/validations/projects'
import { createProjectAction, updateProjectAction } from '@/app/actions/projects'
import { Project, Customer, ProjectStatus } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomerSelector } from '@/components/customer-selector'
import { StatusBadge } from '@/components/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const PROJECT_STATUSES: ProjectStatus[] = ['Planning', 'Quoted', 'Active', 'Completed', 'Closed']

type ProjectWithCustomer = Project & {
  customer?: {
    id: string
    customer_no: string
    name: string
    contact_name: string | null
  } | null
}

interface ProjectFormProps {
  project?: ProjectWithCustomer
  customers: Customer[]
}

export function ProjectForm({ project, customers }: ProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      customer_id: project?.customer_id || '',
      name: project?.name || '',
      status: project?.status || 'Planning',
      job_street: project?.job_street || '',
      job_city: project?.job_city || '',
      job_state: project?.job_state || '',
      job_zip: project?.job_zip || '',
    },
  })

  const selectedStatus = watch('status')

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('customer_id', data.customer_id)
      formData.append('name', data.name)
      formData.append('status', data.status)
      formData.append('job_street', data.job_street || '')
      formData.append('job_city', data.job_city || '')
      formData.append('job_state', data.job_state || '')
      formData.append('job_zip', data.job_zip || '')

      let result
      if (project) {
        result = await updateProjectAction(project.id, formData)
      } else {
        result = await createProjectAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
      } else {
        toast.success(project ? 'Project updated successfully' : 'Project created successfully')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Selector */}
          <CustomerSelector
            control={control}
            customers={customers}
            error={errors.customer_id?.message}
          />

          {/* Project Name */}
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Project name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Status Selector */}
          <div className="md:col-span-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex items-center gap-3">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status" className="w-[200px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedStatus && <StatusBadge status={selectedStatus} />}
            </div>
            {errors.status && (
              <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Site Address */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Site Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="job_street">Street</Label>
            <Input
              id="job_street"
              {...register('job_street')}
              placeholder="123 Main St"
            />
            {errors.job_street && (
              <p className="text-sm text-red-600 mt-1">{errors.job_street.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="job_city">City</Label>
            <Input
              id="job_city"
              {...register('job_city')}
              placeholder="Anytown"
            />
            {errors.job_city && (
              <p className="text-sm text-red-600 mt-1">{errors.job_city.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="job_state">State</Label>
            <Input
              id="job_state"
              {...register('job_state')}
              placeholder="CA"
            />
            {errors.job_state && (
              <p className="text-sm text-red-600 mt-1">{errors.job_state.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="job_zip">ZIP</Label>
            <Input
              id="job_zip"
              {...register('job_zip')}
              placeholder="12345"
            />
            {errors.job_zip && (
              <p className="text-sm text-red-600 mt-1">{errors.job_zip.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-6 border-t border-slate-200 flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/app/projects')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
