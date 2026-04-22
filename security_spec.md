# Security Specification - TechFix Pro

## Data Invariants
- A user can only read and write their own profile document in `/users/{userId}`.
- Every write must have a valid `uid` matching the document ID and the authenticated user's ID.

## The "Dirty Dozen" Payloads
1. **Unauthorized Read**: Attempt to read `/users/victim_uid` as `attacker_uid`.
2. **Unauthorized Write**: Attempt to create `/users/victim_uid` as `attacker_uid`.
3. **Identity Spoofing**: Attempt to set `uid` field in `/users/attacker_uid` to `victim_uid`.
4. **Field Injection**: Attempt to add `role: 'admin'` to a user profile.
5. **Timestamp Spoofing**: Attempt to set `createdAt` to a past or future date manually.
6. **ID Poisoning**: Attempt to use a 1MB string as a userId.
7. **Orphaned Write**: Attempt to create a profile without being signed in.
8. **Malicious Email**: Attempt to set an email that doesn't match the auth token (if verified).
9. **Update Gap**: Attempt to change `uid` on an existing document.
10. **State Shortcut**: (N/A for profiles yet).
11. **Denial of Wallet**: Massive payload in `displayName`.
12. **Public Read**: Attempting to list all users.

## Test Runner (Logic Overview)
- `get(/databases/$(database)/documents/users/$(uid))` returns 200 ONLY if `request.auth.uid == uid`.
- `create` or `update` fails if any unexpected fields are present via `affectedKeys()` check.
