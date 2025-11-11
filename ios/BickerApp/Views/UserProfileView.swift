import SwiftUI

struct UserProfileView: View {
    let username: String
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: UserProfileViewModel
    @Environment(\.dismiss) private var dismiss
    
    init(username: String) {
        self.username = username
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: UserProfileViewModel(api: placeholderService))
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.3, green: 0.58, blue: 1.0)
                    .ignoresSafeArea()
                
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else if let user = viewModel.user {
                    ScrollView {
                        VStack(spacing: 24) {
                            // Profile Picture
                            if let profilePicture = user.profilePicture, !profilePicture.isEmpty {
                                AsyncImage(url: URL(string: profilePicture)) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 150, height: 150)
                                            .clipShape(Circle())
                                    default:
                                        Circle()
                                            .fill(.ultraThinMaterial)
                                            .frame(width: 150, height: 150)
                                    }
                                }
                            } else {
                                Circle()
                                    .fill(.ultraThinMaterial)
                                    .frame(width: 150, height: 150)
                            }
                            
                            // Username
                            Text(user.username ?? username)
                                .font(.system(size: 32, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            // Bio
                            if let bio = user.bio, !bio.isEmpty {
                                Text(bio)
                                    .font(.system(.body, design: .rounded))
                                    .foregroundColor(.white.opacity(0.9))
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 24)
                            }
                            
                            // Badges
                            if !user.badges.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Badges")
                                        .font(.system(.title2, design: .rounded))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 24)
                                    
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: 12) {
                                            ForEach(user.badges, id: \.self) { badge in
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
                            
                            // Debates
                            if !viewModel.debates.isEmpty {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Debates")
                                        .font(.system(.title2, design: .rounded))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 24)
                                    
                                    VStack(spacing: 16) {
                                        ForEach(viewModel.debates) { debate in
                                            UserProfileDebateCard(debate: debate)
                                                .padding(.horizontal, 24)
                                        }
                                    }
                                }
                            } else {
                                Text("No debates yet")
                                    .font(.system(.body, design: .rounded))
                                    .foregroundColor(.white.opacity(0.7))
                                    .padding()
                            }
                        }
                        .padding(.vertical, 24)
                    }
                } else {
                    VStack {
                        Text("User not found")
                            .font(.system(.title2, design: .rounded))
                            .foregroundColor(.white)
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                viewModel.updateAPI(appState.apiService)
                await viewModel.loadProfile(username: username)
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
}

struct UserProfileDebateCard: View {
    let debate: Deliberate
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Instigate
            if let instigateText = debate.instigateText {
                HStack {
                    Text(instigateText)
                        .font(.system(.body, design: .rounded))
                        .foregroundColor(.white)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(red: 1.0, green: 0.3, blue: 0.3))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
            }
            
            // Debate
            if let debateText = debate.debateText {
                HStack {
                    Spacer()
                    Text(debateText)
                        .font(.system(.body, design: .rounded))
                        .foregroundColor(.white)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .background(Color(red: 0.3, green: 0.58, blue: 1.0))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
            }
            
            // Votes
            HStack {
                Text("Red: \(debate.votesRed ?? 0)")
                    .foregroundColor(.white)
                Spacer()
                Text("Blue: \(debate.votesBlue ?? 0)")
                    .foregroundColor(.white)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}

@MainActor
final class UserProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var debates: [Deliberate] = []
    @Published var isLoading = false
    @Published var error: ViewError?
    
    var api: APIService
    
    init(api: APIService) {
        self.api = api
    }
    
    func updateAPI(_ api: APIService) {
        self.api = api
    }
    
    func loadProfile(username: String) async {
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
            let profile = try await api.fetchUserProfile(username: username)
            await MainActor.run {
                user = profile.user
                debates = profile.debates
            }
        } catch {
            await MainActor.run {
                self.error = ViewError(message: error.localizedDescription)
            }
        }
    }
}

