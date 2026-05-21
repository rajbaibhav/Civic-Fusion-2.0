# Postman Collection Setup Guide

## Quick Setup

1. **Import Collection**
   - Open Postman
   - Click "Import" button
   - Select `CivicFusion_API.postman_collection.json`
   - Collection will be imported with all requests

2. **Set Environment Variables**
   - Create a new Environment in Postman (or use the default)
   - Add these variables:
     - `base_url`: `http://localhost:5000/api`
     - `citizen_token`: (will be auto-filled after login)
     - `official_token`: (will be auto-filled after login)
     - `admin_token`: (will be auto-filled after login)
     - `project_id`: (will be auto-filled after creating project)
     - `comment_id`: (will be auto-filled after creating comment)
     - `issue_id`: (will be auto-filled after creating issue)
     - `citizen_id`: (will be auto-filled after signup)
     - `future_official_id`: (will be auto-filled after signup)
     - `future_admin_id`: (will be auto-filled after signup)

3. **Select Environment**
   - Make sure your environment is selected in the top-right dropdown

## Testing Workflow

### Step 1: Create Test Users
Run these requests in order:
1. **Authentication → Signup - Citizen** (saves citizen_token and citizen_id)
2. **Authentication → Signup - Volunteer**
3. **Authentication → Signup - Future Official** (saves future_official_id)
4. **Authentication → Signup - Future Admin** (saves future_admin_id)

### Step 2: Create Admin User
**Important:** You need at least one admin user to test admin endpoints.

**Option A: Use Seed Script (Recommended)**
```bash
npm run seed:admin
```
This creates: `admin@civicfusion.com` / `admin123`

**Option B: Manual MongoDB Update**
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "diana@test.com" },
  { $set: { role: "admin" } }
)
```

**Option B: Use the collection**
1. First, login as the future admin user
2. Then use "Admin → Assign Role - Make Admin" (but you'll need an admin token first)

**Option C: Create seed script** (recommended for first-time setup)

### Step 3: Login Users
1. **Authentication → Login - Citizen** (updates citizen_token)
2. Login as official (after role assignment)
3. Login as admin (after role assignment)

### Step 4: Promote Users to Official/Admin
1. **Admin → Assign Role - Make Official** (promotes future_official_id)
2. **Admin → Assign Role - Make Admin** (promotes future_admin_id)
3. Login again to get official_token and admin_token

### Step 5: Test Features
Now you can test all features:
- Create projects (as official)
- Add budgets (as official)
- Add comments (as citizen)
- Create issues (as citizen)
- Respond to issues (as official)
- Manage users (as admin)

## Auto-Saved Variables

The collection includes scripts that automatically save:
- **Tokens**: After login/signup
- **IDs**: After creating resources (projects, comments, issues)
- **User IDs**: After signup

Check your environment variables after running requests to see auto-saved values.

## Collection Runner

You can run the entire collection using Collection Runner:

1. Click on the collection name
2. Click "Run" button
3. Select requests to run
4. Click "Run CivicFusion API"

**Note:** Some requests depend on others, so run them in order or use the pre-request scripts.

## Manual Token Setup

If auto-save doesn't work, manually set tokens:

1. Run login requests
2. Copy the token from response
3. Paste into environment variable:
   - `citizen_token`
   - `official_token`
   - `admin_token`

## Troubleshooting

### Issue: "Authentication required"
- Check if token is set in environment
- Verify Authorization header is present
- Make sure token hasn't expired (7 days)

### Issue: "Access denied"
- Verify user has correct role
- Check if account is active/not blocked
- Re-login to get fresh token

### Issue: Variables not saving
- Check Postman console for errors
- Verify environment is selected
- Manually set variables if needed

## Sample Test Sequence

1. Signup all users
2. Manually set one user as admin (via MongoDB)
3. Login as admin
4. Assign official role to future_official
5. Login as official
6. Create project
7. Add budget to project
8. Login as citizen
9. Add comment to project
10. Create issue on project
11. Login as official
12. Respond to issue
13. Login as admin
14. Get platform stats

This sequence tests the complete workflow!
