import SwiftUI
import AuthenticationServices

struct MyStatsView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: MyStatsViewModel
    @State private var showSignIn = false
    @State private var isSignedIn = false

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: MyStatsViewModel(api: placeholderService))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.3, green: 0.58, blue: 1.0)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Sign in section
                        if !isSignedIn {
                            VStack(spacing: 16) {
                                Text("Sign in to track your stats")
                                    .font(.system(.headline, design: .rounded))
                                    .foregroundColor(.white)
                                
                                Button {
                                    showSignIn = true
                                } label: {
                                    HStack {
                                        Image(systemName: "globe")
                                        Text("Sign in with Google")
                                    }
                                    .font(.system(.body, design: .rounded))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue.opacity(0.8))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                }
                                .padding(.horizontal, 24)
                            }
                            .padding(.vertical, 24)
                        }
                        // Stats summary
                        HStack(spacing: 16) {
                            StatCard(title: "Debates", value: "\(viewModel.totalDebates)")
                            StatCard(title: "Win Rate", value: "\(viewModel.winRate)%")
                            StatCard(title: "Points", value: "\(viewModel.points)")
                            StatCard(title: "Streak", value: "\(viewModel.streak)")
                        }
                        .padding(.horizontal, 24)

                        // Badges
                        if !viewModel.badges.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Badges")
                                    .font(.system(.title2, design: .rounded))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)

                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 12) {
                                        ForEach(viewModel.badges, id: \.self) { badge in
                                            Text(badge)
                                                .font(.system(.caption, design: .rounded))
                                                .foregroundColor(.white)
                                                .padding(12)
                                                .background(.ultraThinMaterial)
                                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                        }
                                    }
                                    .padding(.horizontal, 24)
                                }
                            }
                        }

                        // Sort picker
                        Picker("Sort", selection: $viewModel.sort) {
                            Text("Newest").tag("newest")
                            Text("Oldest").tag("oldest")
                            Text("Most Popular").tag("mostPopular")
                            Text("Most Divisive").tag("mostDivisive")
                            Text("Most Decisive").tag("mostDecisive")
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, 24)
                        .onChange(of: viewModel.sort) {
                            Task { @MainActor in
                                await viewModel.loadDebates()
                            }
                        }

                        // Debates list
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else if viewModel.debates.isEmpty {
                            Text("You have not participated in any debates yet.")
                                .foregroundColor(.white)
                                .font(.system(.body, design: .rounded))
                                .padding()
                        } else {
                            VStack(spacing: 16) {
                                ForEach(viewModel.debates) { debate in
                                    UserDebateCard(debate: debate)
                                }
                            }
                            .padding(.horizontal, 24)
                        }
                    }
                    .padding(.vertical, 24)
                }
            }
            .navigationTitle("My Stats")
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                viewModel.updateAPI(appState.apiService)
                await checkAuthStatus()
                if isSignedIn {
                    await viewModel.loadDebates()
                }
            }
            .sheet(isPresented: $showSignIn) {
                SignInSheet(isSignedIn: $isSignedIn)
                    .environmentObject(appState)
            }
            .alert(item: $viewModel.error) { error in
                Alert(
                    title: Text("Error"),
                    message: Text(error.message),
                    dismissButton: .default(Text("OK"))
                )
            }
        }
    }
    
    private func checkAuthStatus() async {
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

struct SignInSheet: View {
    @EnvironmentObject private var appState: AppState
    @Binding var isSignedIn: Bool
    @Environment(\.dismiss) private var dismiss
    @State private var isSigningIn = false
    @State private var error: ViewError?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                Text("Sign in to Bicker")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text("Sign in to track your stats, participate in debates, and more")
                    .font(.system(size: 16, design: .rounded))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                Button {
                    Task {
                        await signInWithGoogle()
                    }
                } label: {
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
                .disabled(isSigningIn)
                .padding(.horizontal)
                
                if isSigningIn {
                    ProgressView()
                        .padding()
                }
            }
            .padding()
            .navigationTitle("Sign In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .alert(item: $error) { error in
                Alert(
                    title: Text("Sign In Error"),
                    message: Text(error.message),
                    dismissButton: .default(Text("OK"))
                )
            }
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
        guard let signInURL = URL(string: "\(baseURL.absoluteString)/api/auth/signin/google") else {
            await MainActor.run {
                error = ViewError(message: "Invalid sign-in URL")
            }
            return
        }
        
        await MainActor.run {
            // Use SFSafariViewController approach for better cookie sharing
            // NextAuth redirects to the same domain, so we'll use the base URL scheme
            let callbackScheme = baseURL.scheme ?? "http"
            let session = ASWebAuthenticationSession(
                url: signInURL,
                callbackURLScheme: callbackScheme
            ) { callbackURL, authError in
                Task { @MainActor in
                    if let authError = authError {
                        let nsError = authError as NSError
                        if nsError.domain == ASWebAuthenticationSessionError.errorDomain,
                           nsError.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                            // User cancelled - don't show error
                            return
                        }
                        // For other errors, wait a bit and check if cookies were set anyway
                        try? await Task.sleep(nanoseconds: 1_000_000_000)
                        await checkAuthStatus()
                    } else {
                        // Success - cookies should be set
                        // Wait a moment for cookies to propagate
                        try? await Task.sleep(nanoseconds: 1_000_000_000)
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
                dismiss()
            }
        } catch {
            await MainActor.run {
                self.error = ViewError(message: "Sign in failed. Please try again.")
            }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String

    var body: some View {
        VStack(spacing: 8) {
            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.white)
            Text(title)
                .font(.system(.caption, design: .rounded))
                .foregroundColor(.white.opacity(0.9))
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct UserDebateCard: View {
    let debate: UserDebate

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(debate.instigateText ?? "")
                    .font(.system(.body, design: .rounded))
                    .foregroundColor(.white)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(red: 1.0, green: 0.3, blue: 0.3))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }

            HStack {
                Spacer()
                Text(debate.debateText ?? "")
                    .font(.system(.body, design: .rounded))
                    .foregroundColor(.white)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .background(Color(red: 0.3, green: 0.58, blue: 1.0))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }

            HStack {
                Text("Red: \(debate.votesRed ?? 0)")
                    .foregroundColor(.white)
                Spacer()
                Text("Blue: \(debate.votesBlue ?? 0)")
                    .foregroundColor(.white)
            }

            if let side = debate.userWroteSide {
                Text("You wrote: \(side.capitalized)")
                    .font(.system(.caption, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}

@MainActor
final class MyStatsViewModel: ObservableObject {
    @Published var debates: [UserDebate] = []
    @Published var totalDebates = 0
    @Published var wins = 0
    @Published var points = 0
    @Published var streak = 0
    @Published var badges: [String] = []
    @Published var sort = "newest"
    @Published var page = 1
    @Published var isLoading = false
    @Published var error: ViewError?

    var winRate: Int {
        totalDebates > 0 ? Int((Double(wins) / Double(totalDebates)) * 100) : 0
    }

    private var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func updateAPI(_ api: APIService) {
        self.api = api
    }

    func loadDebates() async {
        guard !isLoading else { return }
        await MainActor.run {
            isLoading = true
        }
        defer {
            Task { @MainActor in
                isLoading = false
            }
        }
        do {
            let response = try await api.fetchUserDebates(sort: sort, page: page)
            await MainActor.run {
                debates = response.debates
                totalDebates = response.totalDebates
                wins = response.wins
                points = response.points
                streak = response.streak
                badges = response.badges
            }
        } catch {
            await MainActor.run {
                let errorMsg = error.localizedDescription.contains("401") || error.localizedDescription.contains("Unauthorized")
                    ? "Please sign in to view your stats"
                    : error.localizedDescription
                self.error = ViewError(message: errorMsg)
            }
        }
    }
}

