# Business Management System - Frontend

A complete, production-ready frontend for the Business Management System built with Next.js 16, TypeScript, React Query, and Zustand.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (auth/user/session)
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **UI**: Tailwind CSS + shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns

## Project Structure

\`\`\`
├── app/                          # Next.js app router pages
│   ├── admin/                    # Admin area
│   │   ├── appointments/         # Appointments calendar
│   │   ├── services/             # Service management
│   │   └── page.tsx              # Admin dashboard
│   ├── customer/                 # Customer area
│   │   ├── appointments/         # My appointments
│   │   ├── book/                 # Booking wizard
│   │   └── page.tsx              # Customer home
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── unauthorized/             # Unauthorized access page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── src/
│   ├── api/                      # API layer
│   │   ├── httpClient.ts         # Axios client with interceptors
│   │   ├── auth.ts               # Auth API functions
│   │   ├── services.ts           # Services API functions
│   │   └── appointments.ts       # Appointments API functions
│   ├── components/               # Shared components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── Navbar.tsx            # Navigation bar
│   │   ├── ProtectedRoute.tsx    # Route protection
│   │   └── SessionProvider.tsx   # Session restoration
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts            # Auth hook
│   │   ├── use-toast.ts          # Toast notifications
│   │   └── use-mobile.tsx        # Mobile detection
│   ├── lib/                      # Utility functions
│   │   ├── utils.ts              # cn() helper
│   │   └── env.ts                # Environment variables
│   ├── providers/                # React providers
│   │   └── QueryProvider.tsx     # React Query provider
│   ├── store/                    # Zustand stores
│   │   └── authStore.ts          # Auth state management
│   └── types/                    # TypeScript types
│       └── index.ts              # Shared type definitions
├── .env.local.example            # Environment variables template
└── package.json                  # Dependencies
\`\`\`

## Getting Started

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and update with your backend URL:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

### Backend Endpoints

The frontend expects the following NestJS backend endpoints:

#### Authentication
- `POST /auth/register` - Register new user
  - Body: `{ firstName, lastName, email, password }`
  - Returns: `{ user, access_token }`
- `POST /auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user, access_token }`
- `GET /auth/me` - Get current user (requires JWT)
  - Returns: `User` object

#### Services
- `GET /services` - List all services
- `POST /services` - Create service (admin only)
- `PUT /services/:id` - Update service (admin only)
- `DELETE /services/:id` - Delete service (admin only)

#### Appointments
- `POST /appointments/checkAvailability` - Get appointment suggestions
  - Body: `{ serviceId, date, preferredTime }`
  - Returns: Array of suggestions
- `POST /appointments/create` - Create appointment
  - Body: `{ serviceId, startTime, endTime }`
- `GET /appointments/getForDate?date=YYYY-MM-DD` - Get appointments for date
- `PUT /appointments/:id` - Update appointment (admin only)
- `DELETE /appointments/:id` - Cancel appointment

### HTTP Client

All API calls use a centralized Axios client (`src/api/httpClient.ts`) that:
- Reads base URL from environment variables
- Automatically adds JWT token to requests
- Handles error responses with meaningful messages
- Never shows empty error toasts

## Features

### Authentication & Authorization

- JWT-based authentication
- Token stored in localStorage
- Automatic session restoration on app load
- Role-based access control (admin/customer/staff)
- Protected routes with automatic redirects
- Logout functionality

### Customer Features

1. **Landing Page** - Overview of features with CTAs
2. **Registration** - Account creation with validation
3. **Login** - Email/password + Google login placeholder
4. **Customer Dashboard** - Welcome screen with quick actions
5. **Booking Wizard** - 4-step appointment booking:
   - Step 1: Choose service
   - Step 2: Select date & preferred time
   - Step 3: Pick from smart suggestions
   - Step 4: Confirm appointment
6. **My Appointments** - View upcoming appointments

### Admin Features

1. **Admin Dashboard** - Overview with stats and quick links
2. **Manage Services** - Full CRUD for services:
   - Create new services
   - Edit existing services
   - Delete services
   - View all services
3. **Appointments Calendar** - Daily view:
   - Date picker
   - View appointments for selected date
   - Manual appointment creation
   - View/edit appointment details

### UI/UX

- Modern, clean design with shadcn/ui components
- System fonts only (no Google Fonts for Netfree compatibility)
- Responsive layout (mobile-first)
- Toast notifications for all actions
- Loading states for async operations
- Form validation with helpful error messages
- Consistent error handling

## State Management

### Zustand Store (Auth)

Located in `src/store/authStore.ts`:

\`\`\`typescript
{
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user, token) => void
  logout: () => void
  restoreSession: () => Promise<void>
}
\`\`\`

### React Query

Used for all server state (services, appointments):
- Automatic caching
- Optimistic updates
- Query invalidation after mutations
- Loading and error states
- Retry logic

## Key Hooks

### `useAuth()`

Main authentication hook:

\`\`\`typescript
const { user, isAuthenticated, role, login, register, logout } = useAuth()
\`\`\`

### `useQuery()` / `useMutation()`

React Query hooks for data fetching:

\`\`\`typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["services"],
  queryFn: servicesApi.getAll,
})

const createMutation = useMutation({
  mutationFn: servicesApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["services"] })
  },
})
\`\`\`

## Error Handling

All API errors are handled consistently:

1. Axios interceptor catches errors
2. Extracts error message from response or provides fallback
3. Returns structured error
4. UI displays error in toast notification
5. Never shows empty or undefined messages

## Type Safety

All API responses and data structures are fully typed:

\`\`\`typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "customer" | "staff"
}

interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
}

interface Appointment {
  id: string
  serviceId: string
  userId: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  service?: Service
  user?: User
}
\`\`\`

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Customization

### Changing API Base URL

Update `.env.local` with your production backend URL:

\`\`\`env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
\`\`\`

### Theming

Colors are defined in `app/globals.css` using CSS custom properties. Modify the `:root` and `.dark` selectors to change the theme.

### Adding New Features

1. Create types in `src/types/index.ts`
2. Add API functions in `src/api/`
3. Create pages in `app/`
4. Use `ProtectedRoute` wrapper for protected pages
5. Use React Query for data fetching
6. Update navigation in `src/components/Navbar.tsx`

## Important Notes

- No Google Fonts used (Netfree compatibility)
- System fonts configured in `app/globals.css`
- All API calls use `POST /auth/login` (not GET)
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- Token is stored in localStorage (consider httpOnly cookies for production)
- Role-based access enforced on frontend (ensure backend validates too)

## Troubleshooting

### API Connection Issues

1. Verify backend is running
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Ensure backend CORS is configured to allow frontend origin
4. Check browser console for network errors

### Authentication Issues

1. Clear localStorage and try again
2. Check JWT token expiration on backend
3. Verify `/auth/me` endpoint is working
4. Check browser console for 401/403 errors

### Build Errors

1. Delete `.next` folder and `node_modules`
2. Run `npm install` again
3. Check for TypeScript errors: `npm run type-check`

## License

MIT
\`\`\`

```.gitignore file=".gitignore"
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
