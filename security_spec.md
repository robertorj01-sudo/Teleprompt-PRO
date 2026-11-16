# Security Specification — Teleprompter Pro Firestore Rules

## 1. Data Invariants
1. **User Profile (`/users/{userId}`)**:
   - Only the authenticated, email-verified user (`request.auth.uid == userId` and `request.auth.token.email_verified == true`) may read, create, or update their own profile.
   - `uid` must match `userId` and `request.auth.uid`.
   - `planType` must be `'free'` on creation (users cannot self-assign `'lifetime'` or admin roles via client writes) and cannot be escalated by client updates.
   - `createdAt` is immutable and strictly validated with `request.time`.
   - `updatedAt` must equal `request.time`.
2. **User Private Info (`/users/{userId}/private/{docId}`)**:
   - Strictly isolated PII subcollection (`docId == 'info'`).
   - Only the verified owner (`request.auth.uid == userId` and `request.auth.token.email_verified == true`) may read or write, and only if parent `/users/{userId}` exists (`exists` / `existsAfter`).
   - `email` must be a valid-length string matching `request.auth.token.email` when present, preventing spoofing.
   - No `list` queries allowed on `/users` or `/users/{userId}/private` to prevent scraping.
3. **User Scripts (`/users/{userId}/scripts/{scriptId}`)**:
   - Scripts belong strictly to `/users/{userId}`, verified via `get()` on parent `/users/{userId}` and `resource.data.ownerId == request.auth.uid`.
   - `ownerId` and `createdAt` are immutable after creation.
   - `id` must match `{scriptId}` and match `^[a-zA-Z0-9_\-]+$`.
   - `list` queries enforce `resource.data.ownerId == request.auth.uid`.

## 2. Adversarial "Dirty Dozen" Payloads
1. Unauthenticated read/write to `/users/uid1`. -> DENIED
2. Unverified email (`email_verified: false`) attempting write to `/users/uid1`. -> DENIED
3. Authenticated user `uid2` reading or writing `/users/uid1` or `/users/uid1/private/info`. -> DENIED
4. Self-privilege escalation on create (`planType: "lifetime"` or ghost field `isAdmin: true`). -> DENIED
5. Shadow update adding undocumented field `role: "admin"` on `/users/uid1`. -> DENIED
6. Client-forged `createdAt` or `updatedAt` timestamp not equal to `request.time`. -> DENIED
7. Mutating immutable `createdAt` or `uid` during update. -> DENIED
8. Oversized ID poisoning (`1.5KB` `scriptId` or invalid characters `../etc`). -> DENIED
9. Oversized `content` string (> 100,000 chars) or `title` (> 200 chars) DoW attack. -> DENIED
10. Blanket `list` on `/users` or `/users/uid1/private`. -> DENIED
11. Orphaned script write when parent `/users/{userId}` profile does not exist. -> DENIED
12. Email spoofing in `/users/{userId}/private/info` with `email` different from `request.auth.token.email`. -> DENIED
