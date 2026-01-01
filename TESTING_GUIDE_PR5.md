# Testing Guide: Receipt Completion State & Line Locking

## Prerequisites
1. Start the development server: `npm run dev`
2. Ensure Supabase is connected with receipt data
3. Have at least one receipt with line items and allocations

## Test Scenarios

### Scenario 1: View Locked Line Items

**Setup:**
1. Navigate to Receipts page: `/app/receipts`
2. Create a receipt with line items if needed
3. Allocate at least one line item to a job cost

**Test Steps:**
1. Click on the receipt to view details
2. Observe the line items table

**Expected Results:**
- ✅ Line with allocation shows lock icon (🔒)
- ✅ Lock icon has tooltip: "This line has $X.XX allocated. Remove allocations to edit."
- ✅ Edit button for locked line is disabled (grayed out)
- ✅ Delete button for locked line is disabled (grayed out)
- ✅ Allocation status badge shows "Allocated" or "Partial" in appropriate color
- ✅ Unallocated lines remain editable (buttons enabled)

**Screenshot Locations:**
- Receipt detail page with locked lines
- Hover tooltip on lock icon

---

### Scenario 2: Attempt to Edit Locked Line

**Setup:**
Start from a receipt detail page with locked lines

**Test Steps:**
1. Click on the disabled edit button (should do nothing)
2. Navigate directly to: `/app/receipts/[id]/lines/[lineId]/edit`
   - Use the ID of a locked line

**Expected Results:**
- ✅ Edit button click does nothing (button is disabled)
- ✅ Direct navigation shows amber warning card
- ✅ Warning message explains line has allocations
- ✅ Shows allocated amount in the warning
- ✅ Displays read-only field values
- ✅ Provides "View Allocations" button
- ✅ Provides "Back to Receipt" button
- ✅ Form is NOT rendered

**Screenshot Locations:**
- Line edit page showing read-only warning

---

### Scenario 3: Attempt to Delete Locked Line

**Setup:**
From receipt detail page with locked lines

**Test Steps:**
1. Click the delete button on a locked line

**Expected Results:**
- ✅ Delete button appears disabled/grayed
- ✅ Clicking does nothing (no dialog opens)
- ✅ Tooltip shows: "Cannot delete - line has allocations"

**Screenshot Locations:**
- Hover state showing disabled delete button with tooltip

---

### Scenario 4: Server-side Delete Protection

**Test Steps:**
1. Use browser dev tools or API testing tool
2. Call `deleteLineItemAction` directly with a locked line ID
3. Observe the response

**Expected Results:**
- ✅ Returns error: "Cannot delete line item with allocations. Remove allocations first."
- ✅ Line item is NOT deleted from database
- ✅ Error toast appears if called from UI

---

### Scenario 5: Server-side Edit Protection

**Test Steps:**
1. From receipt detail, try to submit edit form for locked line
2. Or use API testing tool to call `updateLineItemAction`

**Expected Results:**
- ✅ Returns error: "Cannot edit this line item. It has allocations. Delete allocations first to make changes."
- ✅ Line item is NOT updated in database
- ✅ Error toast appears if called from UI

---

### Scenario 6: View Fully Allocated Receipt

**Setup:**
Create/find a receipt where ALL line items are fully allocated

**Test Steps:**
1. Navigate to the receipt detail page
2. Observe the header area

**Expected Results:**
- ✅ Green "Fully Allocated" badge appears next to receipt title
- ✅ Badge includes checkmark icon
- ✅ All line items show lock icons
- ✅ Receipt header "Edit Receipt" button still works
- ✅ Can still edit vendor, date, notes (header fields)

**Screenshot Locations:**
- Receipt detail page header with "Fully Allocated" badge

---

### Scenario 7: Receipt List with Filters

**Test Steps:**
1. Navigate to: `/app/receipts`
2. Observe the filter tabs
3. Click each filter tab in sequence

**Expected Results:**
- ✅ Four tabs visible: All, Needs Allocation, Partial, Completed
- ✅ Each tab shows count in parentheses
- ✅ Active tab highlighted
- ✅ Table columns: Date, Vendor, Lines Total, Allocated, Unallocated, Status, Actions
- ✅ Allocation status badges use appropriate colors:
  - Gray: Unallocated
  - Amber: Partial
  - Green: Allocated
  - Red: Overallocated
- ✅ Clicking "All" shows all receipts
- ✅ Clicking "Needs Allocation" shows unallocated and partial
- ✅ Clicking "Partial" shows only partially allocated
- ✅ Clicking "Completed" shows only fully allocated

**Screenshot Locations:**
- Receipt list with "All" filter
- Receipt list with "Completed" filter
- Each allocation status badge variant

---

### Scenario 8: Allocation Queue Updates

**Test Steps:**
1. Navigate to: `/app/receipts/allocate`
2. Observe the header and summary cards

**Expected Results:**
- ✅ "View Completed" button in top-right with count
- ✅ Four summary cards displayed:
  1. Total Receipts
  2. Unallocated Amount
  3. Overallocated
  4. Completed (new)
- ✅ Completed card shows green checkmark icon
- ✅ Count matches number of fully allocated receipts
- ✅ Clicking "View Completed" navigates to completed page

**Screenshot Locations:**
- Allocation queue with completed count card

---

### Scenario 9: Completed Receipts Page

**Test Steps:**
1. Navigate to: `/app/receipts/completed`
2. Or click "View Completed" from allocation queue

**Expected Results:**
If receipts exist:
- ✅ Page title: "Completed Receipts"
- ✅ Green badge showing count
- ✅ Table with columns: Vendor, Date, Lines Total, Allocated, Status, Actions
- ✅ All receipts have "Allocated" status badge
- ✅ "View Details" button for each receipt
- ✅ "Back to Receipts" button

If no completed receipts:
- ✅ Empty state with checkmark icon
- ✅ Message: "No completed receipts yet"
- ✅ Description: "Receipts will appear here once all line items are fully allocated."
- ✅ "View Allocation Queue" action button

**Screenshot Locations:**
- Completed receipts list with data
- Empty state (if applicable)

---

### Scenario 10: Unlock Line by Removing Allocations

**Test Steps:**
1. Start with a locked line (has allocations)
2. Navigate to allocation page for that line
3. Delete all allocations
4. Return to receipt detail page
5. Try to edit the line

**Expected Results:**
- ✅ After deleting allocations, line no longer shows lock icon
- ✅ Edit button becomes enabled
- ✅ Delete button becomes enabled
- ✅ Allocation status changes to "Unallocated"
- ✅ Can now successfully edit the line
- ✅ Edit form renders normally (not read-only view)

---

### Scenario 11: Mixed Receipt (Partial Allocations)

**Setup:**
Create a receipt with 3+ line items where:
- Line 1: Fully allocated
- Line 2: Partially allocated
- Line 3: Not allocated

**Test Steps:**
1. View the receipt detail page
2. Observe each line

**Expected Results:**
- ✅ Line 1: Locked, "Allocated" badge, disabled buttons
- ✅ Line 2: Locked, "Partial" badge, disabled buttons
- ✅ Line 3: Not locked, "Unallocated" badge, enabled buttons
- ✅ Receipt does NOT show "Fully Allocated" badge
- ✅ Receipt appears in "Needs Allocation" filter

---

### Scenario 12: Empty States

**Test Steps:**
Test each empty state scenario:

1. No receipts at all:
   - Navigate to `/app/receipts`
   - Expected: Empty state with "New Receipt" action

2. No completed receipts:
   - Navigate to `/app/receipts/completed`
   - Expected: Empty state with "View Allocation Queue" action

3. No receipts for filter:
   - Navigate to `/app/receipts?filter=partial`
   - Assume no partial receipts exist
   - Expected: Empty state explaining no receipts match filter

**Screenshot Locations:**
- Each empty state variant

---

## Regression Testing

Ensure existing functionality still works:

- [ ] Can create new receipts
- [ ] Can add line items to receipts
- [ ] Can edit unallocated line items
- [ ] Can delete unallocated line items
- [ ] Can allocate line items to jobs
- [ ] Can view allocation history
- [ ] Receipt header editing works for all receipts
- [ ] Bulk allocation toolbar still functions

---

## Edge Cases

### Test: Overallocated Line
- Line with allocated > line total
- Expected: Locked, "Overallocated" badge in red

### Test: Zero Allocation
- Line with exactly $0.00 allocated
- Expected: Not locked, editable

### Test: Direct URL Access
- Try to access `/app/receipts/[id]/lines/[lineId]/edit` for locked line
- Expected: Read-only warning, not the edit form

### Test: Concurrent Edits
- User A views edit page for unlocked line
- User B allocates the line
- User A tries to submit edit
- Expected: Server returns error, edit blocked

---

## Browser Compatibility
Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

---

## Performance
- [ ] Receipt list loads quickly with 100+ receipts
- [ ] Filtering is instant (client-side)
- [ ] No n+1 queries for allocation status

---

## Accessibility
- [ ] Lock icons have descriptive titles
- [ ] Disabled buttons have appropriate ARIA attributes
- [ ] Color is not the only indicator (icons used)
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

---

## Notes for Testers
- Use the browser's developer tools Network tab to verify API calls
- Check console for any JavaScript errors
- Verify toast notifications appear and are readable
- Test responsive design on mobile viewport
