import SwiftUI
import AuthenticationServices

struct ContentView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var bannerViewModel: BannerViewModel
    @State private var selectedTab = 0
    @State private var isSignedIn = false

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _bannerViewModel = StateObject(wrappedValue: BannerViewModel(api: placeholderService))
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(selectedTab: $selectedTab)
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            InstigateView()
                .tabItem {
                    Label("Instigate", systemImage: "sparkles")
                }
                .tag(1)
            
            DebateView()
                .tabItem {
                    Label("Debate", systemImage: "message.fill")
                }
                .tag(2)
            
            DeliberateView()
                .tabItem {
                    Label("Deliberate", systemImage: "hand.raised.fill")
                }
                .tag(3)
            
            LeaderboardView()
                .tabItem {
                    Label("Leaderboard", systemImage: "trophy.fill")
                }
                .tag(4)
            
            MyStatsView()
                .tabItem {
                    Label("My Stats", systemImage: "chart.bar.fill")
                }
                .tag(5)
        }
        .task {
            await MainActor.run {
                bannerViewModel.api = appState.apiService
            }
            await bannerViewModel.loadBanner()
            await checkAuthStatus()
        }
    }
    
    private func checkAuthStatus() async {
        // Check if user is authenticated by trying to fetch profile
        do {
            let _ = try await appState.apiService.fetchProfile()
            await MainActor.run {
                isSignedIn = true
            }
        } catch {
            await MainActor.run {
                isSignedIn = false
            }
        }
    }
}

struct SignInView: View {
    @EnvironmentObject private var appState: AppState
    @State private var isSigningIn = false
    @State private var error: ViewError?
    @Binding var isSignedIn: Bool
    
    var body: some View {
        VStack(spacing: 30) {
            Text("Bicker")
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            Text("Sign in to continue")
                .font(.system(size: 20, design: .rounded))
                .foregroundColor(.secondary)
            
            SignInWithGoogleButton {
                Task {
                    await signInWithGoogle()
                }
            }
            .disabled(isSigningIn)
            
            if isSigningIn {
                ProgressView()
                    .padding()
            }
        }
        .padding()
        .alert(item: $error) { error in
            Alert(
                title: Text("Sign In Error"),
                message: Text(error.message),
                dismissButton: .default(Text("OK"))
            )
        }
    }
    
    private func signInWithGoogle() async {
        await MainActor.run {
            isSigningIn = true
        }
        defer {
            Task { @MainActor in
                isSigningIn = false
            }
        }
        
        let baseURL = appState.configuration.baseURL
        // Use the NextAuth sign-in page directly
        guard let signInURL = URL(string: "\(baseURL.absoluteString)/api/auth/signin/google") else {
            await MainActor.run {
                error = ViewError(message: "Invalid sign-in URL")
            }
            return
        }
        
        // Use ASWebAuthenticationSession for OAuth flow
        // We'll use the base URL as the callback scheme since NextAuth redirects to the same domain
        // The session cookies will be stored and shared with URLSession automatically
        await MainActor.run {
            let callbackScheme = baseURL.scheme ?? "http"
            let session = ASWebAuthenticationSession(
                url: signInURL,
                callbackURLScheme: callbackScheme
            ) { callbackURL, error in
                Task { @MainActor in
                    if let error = error {
                        // Error code 2 usually means user cancelled or callback URL mismatch
                        let nsError = error as NSError
                        if nsError.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                            // User cancelled - don't show error
                            return
                        }
                        // For other errors, try checking auth status anyway since cookies might be set
                        try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
                        await checkAuthStatus()
                    } else if callbackURL != nil {
                        // Sign in successful - cookies should be set
                        // Check auth status after a brief delay to allow cookies to propagate
                        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
                        await checkAuthStatus()
                    } else {
                        // No callback but no error - might have succeeded
                        try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
                        await checkAuthStatus()
                    }
                }
            }
            session.presentationContextProvider = SignInPresentationContextProvider()
            session.prefersEphemeralWebBrowserSession = false  // Important: allows cookie sharing
            session.start()
        }
    }
    
    private func checkAuthStatus() async {
        do {
            let _ = try await appState.apiService.fetchProfile()
            await MainActor.run {
                isSignedIn = true
            }
        } catch {
            // Not signed in - this is expected for optional sign-in
            await MainActor.run {
                isSignedIn = false
            }
        }
    }
}

struct SignInWithGoogleButton: View {
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: "globe")
                    .font(.title2)
                Text("Sign in with Google")
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

class SignInPresentationContextProvider: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            return window
        }
        return UIWindow()
    }
}

struct HomeView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var bannerViewModel: BannerViewModel
    @Binding var selectedTab: Int

    init(selectedTab: Binding<Int>) {
        self._selectedTab = selectedTab
        let placeholderService = APIService(configuration: AppConfiguration())
        _bannerViewModel = StateObject(wrappedValue: BannerViewModel(api: placeholderService))
    }

    var body: some View {
        GeometryReader { geometry in
            let isCompact = geometry.size.width < 600
            VStack(spacing: 0) {
                // Banner
                if let url = bannerViewModel.bannerURL {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .empty:
                            ProgressView()
                                .tint(.white)
                                .frame(maxWidth: .infinity)
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFit()
                                .frame(maxWidth: .infinity)
                        case .failure:
                            EmptyView()
                        @unknown default:
                            EmptyView()
                        }
                    }
                    .frame(maxHeight: 200)
                }
                
                // Split screen
                if isCompact {
                    VStack(spacing: 0) {
                        // Top: Debate (Blue)
                        Button {
                            selectedTab = 2
                        } label: {
                            ZStack {
                                Color(red: 0.3, green: 0.58, blue: 1.0)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Debate")
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Join")
                                        .font(.system(size: 18, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(height: (geometry.size.height - (bannerViewModel.bannerURL != nil ? 200 : 0)) / 2)
                        }
                        .buttonStyle(.plain)
                        
                        // Bottom: Deliberate (Red)
                        Button {
                            selectedTab = 3
                        } label: {
                            ZStack {
                                Color(red: 1.0, green: 0.3, blue: 0.3)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Deliberate")
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Vote")
                                        .font(.system(size: 18, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(height: (geometry.size.height - (bannerViewModel.bannerURL != nil ? 200 : 0)) / 2)
                        }
                        .buttonStyle(.plain)
                    }
                } else {
                    HStack(spacing: 0) {
                        // Left: Debate (Blue)
                        Button {
                            selectedTab = 2
                        } label: {
                            ZStack {
                                Color(red: 0.3, green: 0.58, blue: 1.0)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Debate")
                                        .font(.system(size: 40, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Join")
                                        .font(.system(size: 20, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(width: geometry.size.width / 2)
                        }
                        .buttonStyle(.plain)
                        
                        // Right: Deliberate (Red)
                        Button {
                            selectedTab = 3
                        } label: {
                            ZStack {
                                Color(red: 1.0, green: 0.3, blue: 0.3)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Deliberate")
                                        .font(.system(size: 40, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Vote")
                                        .font(.system(size: 20, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(width: geometry.size.width / 2)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .task {
            bannerViewModel.api = appState.apiService
            await bannerViewModel.loadBanner()
        }
    }

}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
    }
}
