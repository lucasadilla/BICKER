import SwiftUI
import AuthenticationServices

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
        guard let signInURL = URL(string: "\(baseURL.absoluteString)/api/auth/signin/google") else {
            await MainActor.run {
                error = ViewError(message: "Invalid sign-in URL")
            }
            return
        }
        
        // Use ASWebAuthenticationSession for OAuth flow
        await MainActor.run {
            let session = ASWebAuthenticationSession(
                url: signInURL,
                callbackURLScheme: "bicker"
            ) { callbackURL, error in
                Task { @MainActor in
                    if let error = error {
                        self.error = ViewError(message: error.localizedDescription)
                    } else if callbackURL != nil {
                        // Sign in successful - check auth status
                        await checkAuthStatus()
                    }
                }
            }
            session.presentationContextProvider = SignInPresentationContextProvider()
            session.prefersEphemeralWebBrowserSession = false
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
            await MainActor.run {
                error = ViewError(message: "Sign in failed. Please try again.")
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

