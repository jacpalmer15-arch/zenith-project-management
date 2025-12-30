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
import { EmptyState } from '@/components/empty-state'

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Locations</h1>
          <p className="text-slate-600 mt-1">Service addresses for customers</p>
        </div>
        <Link href="/app/locations/new">
          <Button className="w-full sm:w-auto">Add Location</Button>
        </Link>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200">
          <EmptyState
            icon={MapPin}
            title="No locations yet"
            description="Add your first location to get started."
            action={{
              label: 'Add Location',
              href: '/app/locations/new',
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
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
                          <Button variant="ghost" size="icon" aria-label="View location">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/locations/${location.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="Edit location">
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

          {/* Mobile view - cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {locations.map((location) => (
              <div key={location.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{location.customer.name}</p>
                    {location.label && (
                      <p className="text-sm text-slate-500">{location.label}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/app/locations/${location.id}`}>
                      <Button variant="ghost" size="icon" aria-label="View location" className="min-h-[44px] min-w-[44px]">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/app/locations/${location.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Edit location" className="min-h-[44px] min-w-[44px]">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <p>{location.street}</p>
                  <p>{location.city}, {location.state} {location.zip}</p>
                </div>
                <div>
                  {location.is_active ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
