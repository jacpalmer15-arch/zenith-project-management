import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MapPin, 
  ClipboardList, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle,
  DollarSign,
  Lock
} from 'lucide-react'

const SMOKE_TEST_STEPS = [
  {
    id: 'customer',
    title: '1. Create Customer',
    description: 'Create a new customer with contact info',
    icon: Users,
    route: '/app/customers',
    checks: [
      'Customer number auto-generated',
      'Customer appears in list',
      'Can edit customer details'
    ]
  },
  {
    id: 'location',
    title: '2. Add Service Location',
    description: 'Add a location for the customer',
    icon: MapPin,
    route: '/app/locations',
    checks: [
      'Location linked to customer',
      'Address fields populated',
      'Location appears in customer detail'
    ]
  },
  {
    id: 'work-order',
    title: '3. Create Work Order',
    description: 'Create work order for the location',
    icon: ClipboardList,
    route: '/app/work-orders',
    checks: [
      'Work order number auto-generated',
      'Status is UNSCHEDULED',
      'Location is required (cannot save without)',
      'Customer auto-populated from location'
    ]
  },
  {
    id: 'schedule',
    title: '4. Schedule Work Order',
    description: 'Create schedule entry and assign tech',
    icon: Calendar,
    route: '/app/schedule',
    checks: [
      'Schedule entry created',
      'Work order status changes to SCHEDULED',
      'Tech assigned appears on schedule',
      'Can start schedule (status → IN_PROGRESS)'
    ]
  },
  {
    id: 'time',
    title: '5. Track Time',
    description: 'Clock in/out for the work order',
    icon: Clock,
    route: '/app/time',
    checks: [
      'Can clock in',
      'Can clock out',
      'Time entry shows on work order',
      'Cannot create overlapping time for same employee'
    ]
  },
  {
    id: 'quote',
    title: '6. Create Quote',
    description: 'Create and add line items to quote',
    icon: FileText,
    route: '/app/quotes',
    checks: [
      'Quote linked to work order OR project (not both)',
      'Can add line items from parts catalog',
      'Can add ad-hoc line items',
      'Tax calculated per line item',
      'Totals calculate correctly'
    ]
  },
  {
    id: 'accept',
    title: '7. Accept Quote',
    description: 'Accept quote and update contract totals',
    icon: CheckCircle,
    route: '/app/quotes',
    checks: [
      'Quote status changes to ACCEPTED',
      'Quote becomes locked (cannot edit)',
      'Work order contract_total updated',
      'Can create change order from accepted quote'
    ]
  },
  {
    id: 'costs',
    title: '8. Capture Costs',
    description: 'Add costs and receipts',
    icon: DollarSign,
    route: '/app/work-orders',
    checks: [
      'Can post labor costs from time entries',
      'Can add material costs manually',
      'Can allocate receipts to work order',
      'Cost reconciliation shows margin'
    ]
  },
  {
    id: 'close',
    title: '9. Close Work Order',
    description: 'Complete and close the work order',
    icon: Lock,
    route: '/app/work-orders',
    checks: [
      'Can transition to COMPLETED',
      'Close-out gate validates:',
      '  - No open time entries',
      '  - No unallocated receipts',
      'Can transition to CLOSED with reason',
      'Costs become immutable (admin override only)'
    ]
  }
]

export default function SmokeTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">End-to-End Smoke Test</h1>
        <p className="text-muted-foreground">
          Complete workflow checklist: Customer → Close
        </p>
      </div>
      
      <div className="grid gap-4">
        {SMOKE_TEST_STEPS.map((step) => (
          <Card key={step.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{step.route}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {step.checks.map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox id={`${step.id}-${index}`} />
                    <label 
                      htmlFor={`${step.id}-${index}`}
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      {check}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">✓ Smoke Test Complete</CardTitle>
          <CardDescription className="text-green-700">
            If all checks pass, the core workflow is functioning correctly.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
