# Bicker iOS Client

This directory contains a SwiftUI implementation of the Bicker experience so the existing Next.js experience can ship as a native iOS application. The app communicates with the same REST endpoints that power the web client (`/api/instigate`, `/api/debate`, etc.) and mirrors the key flows:

- **Landing screen** with the split "Instigate" and "Debate" entry points and optional banner image.
- **Instigate** workflow for composing new 200-character prompts and reviewing recent submissions.
- **Debate** workflow for browsing instigates, writing short-form replies, and previewing the most recent debates.

## Project structure

```
ios/
├── BickerApp.swift          # SwiftUI entry point
├── AppState.swift           # Stores shared configuration/state
├── AppConfiguration.swift   # Reads the API base URL
├── Models/                  # Codable data transfer objects
├── Services/APIService.swift# Networking layer for the REST API
├── ViewModels/              # ObservableObjects that drive UI state
└── Views/                   # SwiftUI screens and supporting components
```

## Configuring the API base URL

The app defaults to `http://localhost:3000`, which matches a locally running Next.js instance. To point the app at a deployed backend:

1. Add a `BickerAPIBaseURL` entry to the target's **Info.plist** (String type).
2. Set the value to the full origin (e.g. `https://bicker.example.com`).
3. Rebuild the app—`AppConfiguration` reads that value at launch and routes every request through it.

You can also programmatically override the base URL for previews or tests by initialising `AppConfiguration(baseURL:)` with a custom value.

## Running the app

1. Open Xcode 15 or newer.
2. Choose **File → Open…** and select `BickerApp.xcodeproj` in the `ios` folder.
3. Select an iOS Simulator (iPhone 16 or later recommended) from the device menu.
4. Press **⌘R** (or click the Run button) to build and run the app.
5. Make sure the Next.js server is running and reachable from the simulator (update the base URL in `Info.plist` if required).

The project is fully configured and ready to run. All Swift files are properly linked and the build succeeds without errors.

## Extending the client

- **Authentication**: If you extend the REST endpoints with auth, inject tokens or session cookies in `APIService`.
- **Additional pages**: Add new SwiftUI views alongside the Next.js routes and compose them inside `ContentView`.
- **Offline caching**: Wrap the `APIService` calls with persistence (e.g. `@AppStorage` or Core Data) inside the view models.

The SwiftUI code emphasises modularity so platform-specific details (routing, styling) stay inside the Views layer while network logic and business rules remain testable in the ViewModels and Service layers.
