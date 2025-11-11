# iOS App Troubleshooting Guide

## Fixed Issues

### 1. "Publishing changes from within view updates" Error
**Status: FIXED**

All state modifications in button actions and onChange handlers are now wrapped in `Task { @MainActor in }` blocks to ensure they happen asynchronously and on the main thread.

### 2. API 500 Errors
**Status: FIXED**

- Fixed vote endpoint to use `/api/deliberate` POST with `debateId` and `vote` parameters
- Fixed reaction endpoint to use correct parameters
- Made all model fields optional where needed to handle API responses gracefully
- Added better error handling with user-friendly messages

### 3. Network Warnings
**Status: HARMLESS - Can be ignored**

The following warnings are normal iOS Simulator messages and don't affect functionality:
- `load_eligibility_plist: Failed to open` - System file warning, harmless
- `nw_protocol_socket_set_no_wake_from_sleep` - Network stack warnings, harmless

## If You Still See Errors

### Check the Console
1. Open Xcode
2. View → Debug Area → Activate Console (or press ⌘⇧Y)
3. Look for actual error messages (not warnings)
4. The error messages will tell you what's wrong

### Common Issues and Solutions

#### "Something went wrong" Error
- **Check**: Is your Next.js server running on `http://localhost:3000`?
- **Solution**: Start your server with `npm run dev` in the project root
- **Alternative**: Update the API base URL in `Info.plist` (key: `BickerAPIBaseURL`)

#### Authentication Errors (401)
- **Check**: Some endpoints require authentication
- **Solution**: The app will show "Please sign in" messages for protected endpoints
- **Note**: Authentication is handled by NextAuth on the web - you may need to implement auth in the iOS app if required

#### API Response Format Errors
- **Check**: Console logs will show "Failed to decode response" with the actual response
- **Solution**: The models are now flexible with optional fields, but if you see specific decode errors, check the API response format

### Testing the API Connection

1. Make sure your Next.js server is running:
   ```bash
   cd /Users/lucaspentland-hyde/BICKER
   npm run dev
   ```

2. Test the API endpoint in a browser:
   - Open `http://localhost:3000/api/deliberate`
   - You should see JSON data, not an error

3. If the API works in browser but not in app:
   - Check that the simulator can reach `localhost:3000`
   - Try using your Mac's IP address instead (e.g., `http://192.168.1.100:3000`)
   - Update `BickerAPIBaseURL` in `Info.plist`

### Building and Running

1. Open Xcode
2. File → Open → Select `ios/BickerApp.xcodeproj`
3. Select a simulator (iPhone 16 or later)
4. Press ⌘R to build and run

The app should now work without publishing errors!

