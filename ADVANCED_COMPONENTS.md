# Advanced UI Components Documentation

This document details the 7 advanced UI components implemented in Increm, showcasing modern web development practices including animations, accessibility, and sophisticated state management.

## Components Overview

1. **Toast Notification System** - Portal-based toast notifications
2. **Modal Dialog** - Accessible modal with keyboard navigation
3. **Skeleton Loaders** - Loading state placeholders
4. **Dropdown Menu** - Click-outside and keyboard-controlled dropdowns
5. **Tabs Component** - Organized content with context API
6. **Animated Number** - Count-up animations with intersection observer
7. **Progress Indicators** - Circular and linear progress with animations

---

## 1. Toast Notification System

**File:** `src/components/ui/Toast.tsx`

### Features

- **Portal Rendering**: Toasts render outside component hierarchy using `createPortal`
- **Auto-dismiss**: Configurable duration with automatic cleanup
- **Variants**: Success, error, warning, info with distinct styles
- **Animations**: Slide-in-right animation on mount
- **Context API**: Global toast management via React Context
- **Multiple Toasts**: Stack multiple notifications
- **Manual Dismiss**: Close button on each toast

### Architecture

```typescript
// Provider wraps entire app
<ToastProvider>
  <App />
</ToastProvider>

// Usage in components
const { showToast } = useToast()
showToast('Operation successful', 'success', 5000)
```

### Implementation Highlights

- **Portal**: Renders at document.body to avoid z-index conflicts
- **State Management**: Array of toast objects with unique IDs
- **Cleanup**: Automatic removal via setTimeout
- **Accessibility**: ARIA live regions for screen readers

### Example Usage

```typescript
// In AdminDashboardPage
const { showToast } = useToast()

async function updateUser() {
  try {
    await supabase.from('profiles').update({...})
    showToast('User updated successfully', 'success')
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error')
  }
}
```

---

## 2. Modal Dialog

**File:** `src/components/ui/Modal.tsx`

### Features

- **Portal Rendering**: Renders over all content
- **Backdrop Click**: Close on overlay click
- **Keyboard Navigation**:
  - Escape key to close
  - Focus trap within modal
  - Auto-focus on open
- **Size Variants**: sm, md, lg, xl
- **Animations**: Fade-in backdrop, scale-in modal
- **Flexible Footer**: Custom action buttons
- **Body Scroll Lock**: Prevents background scrolling

### Architecture

```typescript
// Modal hook for state management
const modal = useModal()

<Modal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title="Confirm Action"
  footer={<>
    <Button onClick={modal.close}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </>}
>
  <p>Modal content here</p>
</Modal>
```

### Implementation Highlights

- **Focus Management**: Auto-focus modal on open, restore on close
- **Escape Handler**: useEffect with event listener cleanup
- **Click Outside**: Ref comparison to detect backdrop clicks
- **Body Overflow**: Locks scroll when modal open

### Example Usage

```typescript
// In AdminDashboardPage - Role change confirmation
const confirmModal = useModal()
const [selectedUser, setSelectedUser] = useState(null)

function openConfirmation(user) {
  setSelectedUser(user)
  confirmModal.open()
}

<Modal
  isOpen={confirmModal.isOpen}
  onClose={confirmModal.close}
  title="Confirm Role Change"
  footer={<>
    <Button variant="secondary" onClick={confirmModal.close}>
      Cancel
    </Button>
    <Button onClick={handleRoleChange}>
      Confirm
    </Button>
  </>}
>
  <p>Change user role to {newRole}?</p>
</Modal>
```

---

## 3. Skeleton Loaders

**File:** `src/components/ui/Skeleton.tsx`

### Features

- **Variants**: Text, circular, rectangular
- **Configurable**: Width, height, count
- **Animations**: Pulse animation for loading effect
- **Presets**: SkeletonCard, SkeletonTable
- **Accessibility**: ARIA hidden from screen readers

### Architecture

```typescript
<Skeleton
  variant="rectangular"
  width={200}
  height={100}
  count={3}  // Renders 3 skeletons with spacing
/>
```

### Implementation Highlights

- **CSS Animation**: Pure CSS pulse using Tailwind's animate-pulse
- **Flexible Sizing**: Accepts px or string values
- **Spacing**: Auto-spacing when count > 1
- **Variants**: Different border-radius for different types

### Example Usage

```typescript
// In DashboardPage - Loading states
{statsLoading ? (
  <Skeleton variant="text" width={60} height={32} />
) : (
  <AnimatedNumber value={stats.totalWorkouts} />
)}

// In AdminDashboardPage - Table loading
{loading ? (
  <SkeletonTable rows={5} />
) : (
  <table>...</table>
)}
```

---

## 4. Dropdown Menu

**File:** `src/components/ui/Dropdown.tsx`

### Features

- **Click Outside**: Auto-close when clicking outside
- **Keyboard Navigation**: Escape key to close
- **Alignment**: Left or right alignment
- **Items**: Default and danger variants
- **Icons**: Support for icon + text
- **Dividers**: Visual separation
- **Disabled State**: Disabled menu items
- **Animations**: Scale-in on open

### Architecture

```typescript
<Dropdown
  trigger={<button>Options ▼</button>}
  align="right"
>
  <DropdownItem icon="✏️" onClick={handleEdit}>
    Edit
  </DropdownItem>
  <DropdownDivider />
  <DropdownItem icon="🗑️" variant="danger" onClick={handleDelete}>
    Delete
  </DropdownItem>
</Dropdown>
```

### Implementation Highlights

- **Outside Click**: useRef + useEffect with mousedown listener
- **Positioning**: Absolute positioning with configurable alignment
- **State Management**: Internal open/close state
- **Portal**: Could be enhanced with portal for overflow issues

### Example Usage

```typescript
// User actions dropdown
<Dropdown
  trigger={<Button>Actions</Button>}
  align="right"
>
  <DropdownItem icon="👤" onClick={() => viewProfile(user)}>
    View Profile
  </DropdownItem>
  <DropdownItem icon="✏️" onClick={() => editUser(user)}>
    Edit User
  </DropdownItem>
  <DropdownDivider />
  <DropdownItem
    icon="🗑️"
    variant="danger"
    onClick={() => deleteUser(user)}
  >
    Delete User
  </DropdownItem>
</Dropdown>
```

---

## 5. Tabs Component

**File:** `src/components/ui/Tabs.tsx`

### Features

- **Context API**: Parent-child communication
- **Controlled State**: Active tab management
- **Keyboard Support**: Arrow key navigation (potential enhancement)
- **Animations**: Fade-in content transition
- **Border Highlight**: Active tab indicator
- **Disabled State**: Disable specific tabs
- **Accessible**: ARIA attributes (role="tab", aria-selected)

### Architecture

```typescript
<Tabs defaultValue="personal">
  <TabsList>
    <TabsTrigger value="personal">Personal Info</TabsTrigger>
    <TabsTrigger value="fitness">Fitness Info</TabsTrigger>
    <TabsTrigger value="measurements">Measurements</TabsTrigger>
  </TabsList>

  <TabsContent value="personal">
    {/* Personal info form fields */}
  </TabsContent>

  <TabsContent value="fitness">
    {/* Fitness info form fields */}
  </TabsContent>

  <TabsContent value="measurements">
    {/* Measurement fields */}
  </TabsContent>
</Tabs>
```

### Implementation Highlights

- **Context**: Provides activeTab and setActiveTab to children
- **Conditional Render**: Only active tab content rendered
- **Styling**: Active tab gets brand color and border
- **Composition**: Flexible, composable API

### Example Usage

```typescript
// In ProfilePage - Organized form sections
<Tabs defaultValue="personal">
  <TabsList>
    <TabsTrigger value="personal">Personal Info</TabsTrigger>
    <TabsTrigger value="fitness">Fitness Info</TabsTrigger>
    <TabsTrigger value="measurements">Measurements</TabsTrigger>
  </TabsList>

  <TabsContent value="personal">
    <Input label="Display Name" ... />
    <Input label="Avatar URL" ... />
    <textarea label="Bio" ... />
  </TabsContent>

  <TabsContent value="fitness">
    <textarea label="Fitness Goal" ... />
    <select label="Experience Level" ... />
    <select label="Activity Level" ... />
  </TabsContent>

  <TabsContent value="measurements">
    <Input label="Height (cm)" ... />
    <Input label="Current Weight" ... />
    <Input label="Goal Weight" ... />
  </TabsContent>
</Tabs>
```

---

## 6. Animated Number

**File:** `src/components/ui/AnimatedNumber.tsx`

### Features

- **Count-up Animation**: Smooth number transitions
- **Intersection Observer**: Triggers when entering viewport
- **Easing Function**: easeOutQuart for natural motion
- **Decimals**: Configurable decimal places
- **Prefix/Suffix**: Support for currency symbols, units
- **Duration**: Configurable animation duration
- **Locale Formatting**: Thousands separators

### Architecture

```typescript
<AnimatedNumber
  value={1250}
  duration={1500}
  decimals={0}
  suffix=" kg"
  className="text-2xl font-bold"
/>
```

### Implementation Highlights

- **Intersection Observer**: Starts animation only when visible
- **requestAnimationFrame**: Smooth 60fps animation
- **Easing**: Custom easing function for deceleration
- **One-time Trigger**: Animates once per mount

### Example Usage

```typescript
// In DashboardPage - Stat cards
<Card>
  <p className="text-xs text-surface-400">Total Volume</p>
  <AnimatedNumber
    value={stats.totalVolume}
    suffix=" kg"
    className="mt-1 text-2xl font-bold text-slate-100"
  />
</Card>

// In AdminDashboardPage - User stats
<Card>
  <p className="text-xs text-surface-400">Total Users</p>
  <AnimatedNumber
    value={userStats.totalUsers}
    className="mt-1 text-2xl font-bold text-slate-100"
  />
</Card>
```

---

## 7. Progress Indicators

**File:** `src/components/ui/ProgressCircle.tsx`

### Features

#### ProgressCircle
- **SVG-based**: Crisp at any size
- **Percentage Display**: Optional centered value
- **Configurable**: Size, stroke width, colors
- **Smooth Animation**: CSS transition on stroke-dashoffset
- **Label Support**: Optional label below percentage

#### ProgressBar
- **Variants**: Default, success, warning, danger
- **Label**: Optional label with percentage
- **Smooth Fill**: CSS transition animation
- **Accessible**: ARIA progressbar attributes

### Architecture

```typescript
// Circular
<ProgressCircle
  value={75}
  max={100}
  size={120}
  strokeWidth={8}
  label="Complete"
/>

// Linear
<ProgressBar
  value={60}
  max={100}
  variant="success"
  label="Upload Progress"
  showValue={true}
/>
```

### Implementation Highlights

- **SVG Math**: Circumference calculation for stroke-dasharray
- **Transform**: Rotation to start at top
- **Stroke Linecap**: Round caps for smooth appearance
- **Color Variants**: Tailwind classes for different states

### Example Usage

```typescript
// Goal progress in dashboard
<ProgressCircle
  value={currentWeight}
  max={goalWeight}
  size={150}
  label="Weight Goal"
/>

// Workout completion
<ProgressBar
  value={completedSets}
  max={totalSets}
  variant="success"
  label="Workout Progress"
/>
```

---

## Animation System

**File:** `src/index.css`

All animations are defined in CSS for performance:

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Usage Classes

- `.animate-fade-in` - Fade in (0.2s)
- `.animate-scale-in` - Scale in (0.2s)
- `.animate-slide-in-right` - Slide from right (0.3s)
- `.animate-slide-in-left` - Slide from left (0.3s)
- `.animate-slide-in-up` - Slide from bottom (0.3s)

---

## Integration Examples

### Admin Dashboard

The Admin Dashboard showcases multiple advanced components:

```typescript
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { Modal, useModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

export default function AdminDashboard() {
  const { showToast } = useToast()
  const confirmModal = useModal()

  return (
    <>
      {/* Animated stats */}
      <Card>
        <AnimatedNumber value={stats.totalUsers} />
      </Card>

      {/* Loading state */}
      {loading ? <SkeletonTable rows={5} /> : <Table />}

      {/* Confirmation modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        title="Confirm"
      >
        ...
      </Modal>
    </>
  )
}
```

### Dashboard

```typescript
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Dashboard() {
  return (
    <>
      {/* Stat card with animated number */}
      <Card>
        {loading ? (
          <Skeleton variant="text" width={60} height={32} />
        ) : (
          <AnimatedNumber value={totalWorkouts} suffix=" workouts" />
        )}
      </Card>

      {/* List with skeleton loading */}
      {loading ? (
        <Skeleton variant="rectangular" height={100} count={3} />
      ) : (
        workouts.map(workout => <WorkoutCard key={workout.id} />)
      )}
    </>
  )
}
```

### Profile Page

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'

export default function ProfilePage() {
  const { showToast } = useToast()

  async function handleSubmit() {
    try {
      await updateProfile(...)
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="fitness">Fitness</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">...</TabsContent>
      <TabsContent value="fitness">...</TabsContent>
    </Tabs>
  )
}
```

---

## Accessibility Features

All components follow WCAG 2.1 AA guidelines:

### Keyboard Navigation
- **Modal**: Escape to close, focus trap
- **Dropdown**: Escape to close, future: arrow keys
- **Tabs**: Click navigation, future: arrow keys

### ARIA Attributes
- **Modal**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Tabs**: `role="tab"`, `role="tablist"`, `role="tabpanel"`, `aria-selected`
- **Progress**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Dropdown**: `role="menu"`, `role="menuitem"`

### Screen Reader Support
- **Toast**: ARIA live regions (`aria-live="polite"`)
- **Skeleton**: `aria-hidden="true"` to hide from screen readers
- **Buttons**: `aria-label` for icon-only buttons

### Focus Management
- **Modal**: Auto-focus on open, restore on close
- **Dropdown**: Focus trap within menu
- **Visible Focus**: `:focus-visible` outline for keyboard users

---

## Performance Optimizations

### Animation Performance
- **CSS Animations**: Hardware-accelerated via GPU
- **requestAnimationFrame**: Smooth 60fps animations
- **Intersection Observer**: Lazy animation triggering

### React Optimizations
- **useCallback**: Memoized event handlers in Toast provider
- **Portal**: Prevents unnecessary re-renders in main tree
- **Conditional Rendering**: Only render active tab content

### Bundle Size
- **Tree Shaking**: Only import used components
- **No Dependencies**: All components are vanilla React
- **CSS-in-Tailwind**: No runtime CSS-in-JS overhead

---

## Testing Recommendations

### Unit Tests

```typescript
// Toast
test('shows toast with correct variant', () => {
  render(<ToastProvider><App /></ToastProvider>)
  const { showToast } = useToast()
  showToast('Success!', 'success')
  expect(screen.getByText('Success!')).toBeInTheDocument()
})

// Modal
test('closes on escape key', () => {
  render(<Modal isOpen={true} onClose={onClose} />)
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(onClose).toHaveBeenCalled()
})

// AnimatedNumber
test('animates to target value', async () => {
  render(<AnimatedNumber value={100} duration={100} />)
  await waitFor(() => {
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
// Playwright
test('admin can toggle user role with modal', async ({ page }) => {
  await page.goto('/admin')
  await page.click('button:has-text("Make Admin")')
  await expect(page.locator('role=dialog')).toBeVisible()
  await page.click('button:has-text("Confirm")')
  await expect(page.locator('text=User role updated')).toBeVisible()
})
```

---

## Future Enhancements

### Potential Improvements

1. **Dropdown**: Add arrow key navigation
2. **Tabs**: Add arrow key navigation
3. **Modal**: Add modal stacking support
4. **Toast**: Add toast queue with max limit
5. **Progress**: Add indeterminate state
6. **AnimatedNumber**: Add count-down support
7. **Skeleton**: Add shimmer animation variant

### Additional Components

Consider adding:
- **Tooltip**: Hover information
- **Popover**: Rich hover content
- **Command Palette**: Keyboard shortcuts
- **Data Table**: Sortable, filterable tables
- **Date Picker**: Calendar date selection
- **Autocomplete**: Searchable select

---

## Component Dependency Graph

```
App
├── ToastProvider (wraps entire app)
│   └── Toast (portaled to body)
├── Tabs
│   ├── TabsList
│   │   └── TabsTrigger
│   └── TabsContent
├── Modal (portaled to body)
├── Dropdown
│   ├── DropdownItem
│   └── DropdownDivider
├── AnimatedNumber
├── Skeleton / SkeletonTable / SkeletonCard
└── ProgressCircle / ProgressBar
```

---

## Conclusion

These 7 advanced UI components demonstrate:

- **Modern React Patterns**: Hooks, Context, Portals
- **Accessibility**: ARIA, keyboard navigation, focus management
- **Animations**: CSS animations, requestAnimationFrame
- **Performance**: Intersection Observer, memoization
- **Developer Experience**: Composable APIs, TypeScript types
- **User Experience**: Smooth interactions, visual feedback

They provide a solid foundation for building sophisticated, accessible, and performant user interfaces.
