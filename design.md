# QuickLog Delivery App — Design Document

## Overview

QuickLog is a delivery receipt management system for Android and iOS. It enables staff to create and track delivery receipts with photo evidence, while admins manage staff, view all receipts, and export data.

---

## Screen List

### Authentication Screens
1. **Login Screen** — Unified login for Admin and Staff with role selection
2. **Forgot Password Screen** — Password recovery flow

### Staff Screens
3. **Staff Home** — Dashboard showing receipt count, recent receipts, quick action to create new receipt
4. **Create Receipt** — Form to capture delivery details with image upload
5. **Receipt Detail** — View single receipt with all details and images
6. **Receipt List** — Scrollable list of staff's own receipts with filtering

### Admin Screens
7. **Admin Dashboard** — Overview with key metrics (total receipts, staff count, pending items)
8. **All Receipts** — Admin view of all receipts with creator info, filtering, and search
9. **Staff Management** — List of staff with ability to add, edit, deactivate staff
10. **Staff Detail** — View staff profile and their receipt history
11. **Export Data** — Export receipts to CSV/PDF with date range selection

---

## Primary Content and Functionality

### Login Screen
- **Content**: Logo, email/username input, password input, role selector (Admin/Staff)
- **Functionality**: 
  - Validate credentials against backend
  - Store auth token securely
  - Route to appropriate dashboard based on role
  - Remember login option

### Staff Home
- **Content**:
  - Greeting with staff name
  - Stats cards: Total Receipts, Pending, Completed
  - Recent receipts list (last 5)
  - Floating action button (FAB) to create new receipt
- **Functionality**:
  - Display staff's receipt summary
  - Quick access to create receipt
  - Tap receipt to view details

### Create Receipt
- **Content**:
  - Delivery date/time picker
  - Customer name field
  - Delivery location (address/coordinates)
  - Items list (dynamic add/remove)
  - Notes field
  - Image upload area (multiple photos)
  - Submit button
- **Functionality**:
  - Capture form data
  - Upload images to storage
  - Save receipt to backend
  - Show success confirmation
  - Return to home screen

### Receipt Detail
- **Content**:
  - Receipt ID and timestamp
  - Customer details
  - Items list with quantities
  - Image gallery
  - Status badge (Completed/Pending)
  - Edit/Delete buttons (for staff's own receipts)
- **Functionality**:
  - Display all receipt information
  - Swipe through images
  - Edit receipt (staff only on own receipts)
  - Delete receipt (staff only on own receipts)

### Admin Dashboard
- **Content**:
  - Key metrics: Total Receipts, Active Staff, Pending Items, Export button
  - Charts: Receipts by date, receipts by staff
  - Recent activity feed
  - Quick action buttons: View All Receipts, Manage Staff
- **Functionality**:
  - Fetch and display dashboard data
  - Navigate to detailed views
  - Trigger data export

### All Receipts (Admin)
- **Content**:
  - Filterable receipt list showing: Receipt ID, Customer, Staff Name, Date, Status
  - Search bar
  - Filter options: Date range, Staff member, Status
  - Tap to view receipt detail
- **Functionality**:
  - Display all receipts from all staff
  - Search by customer name, receipt ID, staff name
  - Filter by date range and status
  - View receipt with creator info highlighted

### Staff Management
- **Content**:
  - List of all staff with: Name, Email, Status (Active/Inactive), Receipt Count
  - Add new staff button
  - Tap to view staff detail
- **Functionality**:
  - Display all staff members
  - Add new staff (admin only)
  - Edit staff details
  - Deactivate/reactivate staff
  - View staff's receipt history

### Export Data
- **Content**:
  - Date range picker (From/To dates)
  - Filter options: All Staff / Specific Staff
  - Export format selector: CSV / PDF
  - Export button
  - Export history list
- **Functionality**:
  - Select date range and filters
  - Generate export file
  - Download to device
  - Show export status

---

## Key User Flows

### Flow 1: Staff Creates Receipt
1. Staff logs in → Staff Home
2. Tap FAB (+ button) → Create Receipt screen
3. Fill form: customer name, location, items, notes
4. Tap "Add Image" → Camera/Gallery picker
5. Select 1+ images → Preview
6. Tap "Submit" → Backend saves receipt
7. Success toast → Return to Staff Home
8. Receipt appears in list

### Flow 2: Admin Reviews All Receipts
1. Admin logs in → Admin Dashboard
2. Tap "View All Receipts" → All Receipts screen
3. See list of all staff receipts with creator info
4. Tap receipt → Receipt Detail
5. View images, customer details, staff name
6. Tap back → Return to list

### Flow 3: Admin Exports Data
1. Admin logs in → Admin Dashboard
2. Tap "Export" → Export Data screen
3. Select date range (e.g., last 30 days)
4. Select staff (all or specific)
5. Choose format (CSV or PDF)
6. Tap "Export" → Backend generates file
7. File downloads to device
8. Success notification

### Flow 4: Admin Manages Staff
1. Admin logs in → Admin Dashboard
2. Tap "Manage Staff" → Staff Management screen
3. See list of all staff
4. Tap "Add Staff" → Add Staff form
5. Enter name, email, password
6. Tap "Create" → Staff account created
7. Return to list, new staff visible

---

## Color Choices

**Primary Brand Colors** (from reference HTML):
- **Orange (Primary)**: `#EA580C` (actions, highlights, FAB)
- **Orange (Lighter)**: `#F97316` (hover states)
- **Stone 900 (Dark)**: `#1C1917` (headers, dark backgrounds)
- **Stone 800**: `#292524` (secondary dark)
- **Stone 400**: `#A8A29E` (secondary text)
- **White**: `#FFFFFF` (cards, inputs)
- **Stone 50**: `#FAFAF9` (light backgrounds, input backgrounds)

**Semantic Colors**:
- **Success**: `#16A34A` (green, for completed receipts)
- **Error**: `#DC2626` (red, for errors/warnings)
- **Warning**: `#F59E0B` (amber, for pending items)

**Typography**:
- **Font Family**: Barlow (regular), Barlow Condensed (headers)
- **Header Style**: Bold, italic, uppercase, letter-spaced
- **Body Style**: Regular weight, normal case

---

## Layout Principles

### Mobile Portrait (9:16)
- One-handed usage: critical controls within thumb reach
- Bottom FAB for primary actions (create receipt)
- Tab bar at bottom for navigation (Staff Home, Receipts, Settings)
- Safe area handling for notches and home indicators

### Card-Based Design
- Receipt cards: white background, rounded corners, subtle shadow
- Stat cards: orange accent icon, large number, small label
- Form cards: light background, clear field labels

### Spacing & Sizing
- Padding: 16px standard, 24px for sections
- Card radius: 22-28px (rounded, not extreme)
- Button height: 56px (thumb-friendly)
- Icon size: 24-32px

---

## Interaction Patterns

### Buttons
- **Primary**: Dark background, white text, orange on press
- **Secondary**: Light background, dark text, opacity on press
- **FAB**: Orange, 66px diameter, white icon

### Lists
- Tap feedback: slight scale down (0.98), opacity change
- Swipe: delete/archive actions (future)
- Pull-to-refresh: reload data

### Forms
- Inline validation (show error below field)
- Clear labels above inputs
- Submit button disabled until valid
- Success toast on submission

### Images
- Tap to fullscreen
- Pinch to zoom
- Swipe to navigate between images

---

## Accessibility

- Minimum touch target: 48x48pt
- Color contrast: WCAG AA standard
- Form labels always visible (not placeholder-only)
- Haptic feedback on button press (optional)
- Screen reader support for critical elements
