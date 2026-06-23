---
Task ID: 1
Agent: Main Agent
Task: Add username/password authentication to admin panel

Work Log:
- Added AdminUser and AdminSession models to Prisma schema
- Pushed schema to SQLite database
- Created src/lib/auth.ts with PBKDF2 password hashing, session management
- Seeded default admin user: username "admin", password "admin123"
- Created /api/admin/auth route (POST=login, GET=session check, DELETE=logout, PUT=change password)
- Created src/lib/admin-guard.ts for protecting admin API routes
- Added requireAdminAuth() guard to all 6 admin API routes: plants, plants/[id], categories, categories/[id], stats, settings
- Refactored admin page: split into AdminPage (auth gate) → AdminLoginForm (login UI) → AdminDashboard (protected panel)
- Added login form with username/password fields, error handling, loading state
- Added logout button and username display to admin header
- Added change password dialog (click username in header)
- Footer already had ⚙️ Admin link pointing to /admin
- All 8 API auth tests passed: login, session check, protected endpoint access, unauth rejection, wrong password rejection, logout, post-logout rejection

Stage Summary:
- Admin panel is now fully protected behind username/password authentication
- Default credentials: admin / admin123 (should be changed after first login)
- Sessions use HTTP-only cookies with 24-hour rolling expiry
- All admin CRUD APIs require valid session
- Change password feature available in admin dashboard
- Files created: src/lib/auth.ts, src/lib/admin-guard.ts, src/app/api/admin/auth/route.ts
- Files modified: prisma/schema.prisma, all 6 admin API routes, src/app/admin/page.tsx
