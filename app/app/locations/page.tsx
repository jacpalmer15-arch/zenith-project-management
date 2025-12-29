import Link from 'next/link'
import { listLocations, listCustomers } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LocationsPageProps {
  searchParams: {
    customer_id?: string
  }
}

export default async function LocationsPage({ searchParams }: LocationsPageProps) {
  const [locations, customers] = await Promise.all([
    listLocations({ customer_id: searchParams.customer_id }),
    listCustomers(),
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Locations</h1>
          <p className="text-slate-600 mt-1">Service addresses for customers</p>
        </div>
        <Link href="/app/locations/new">
          <Button>Add Location</Button>
        </Link>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">
            No locations yet. Add your first location to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Street</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>ZIP</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">
                    {location.customer.name}
                  </TableCell>
                  <TableCell>{location.label || '-'}</TableCell>
                  <TableCell>{location.street}</TableCell>
                  <TableCell>{location.city}</TableCell>
                  <TableCell>{location.state}</TableCell>
                  <TableCell>{location.zip}</TableCell>
                  <TableCell>
                    {location.is_active ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/app/locations/${location.id}`}>
                        <Button variant="ghost" size="icon">
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/app/locations/${location.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
