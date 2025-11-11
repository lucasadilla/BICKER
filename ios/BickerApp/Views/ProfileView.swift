import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: ProfileViewModel
    @Environment(\.dismiss) private var dismiss

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: ProfileViewModel(api: placeholderService))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.3, green: 0.58, blue: 1.0)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Profile Picture
                        if let profilePicture = viewModel.profilePicture, !profilePicture.isEmpty {
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
                        TextField("Username", text: $viewModel.username)
                            .textFieldStyle(.roundedBorder)
                            .padding(.horizontal, 24)

                        // Bio
                        TextField("Bio", text: $viewModel.bio, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(3...6)
                            .padding(.horizontal, 24)

                        // Badge selector
                        if !viewModel.badges.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Selected Badge")
                                    .font(.system(.headline, design: .rounded))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)

                                Picker("Badge", selection: $viewModel.selectedBadge) {
                                    Text("None").tag("")
                                    ForEach(viewModel.badges, id: \.self) { badge in
                                        Text(badge).tag(badge)
                                    }
                                }
                                .pickerStyle(.menu)
                                .padding(.horizontal, 24)
                            }
                        }

                        // Color Scheme
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Color Scheme")
                                .font(.system(.headline, design: .rounded))
                                .foregroundColor(.white)
                                .padding(.horizontal, 24)

                            Picker("Color Scheme", selection: $viewModel.colorScheme) {
                                Text("Default").tag("default")
                                Text("Dark").tag("dark")
                            }
                            .pickerStyle(.segmented)
                            .padding(.horizontal, 24)
                        }

                        // Save button
                        Button {
                            Task {
                                await viewModel.saveProfile()
                            }
                        } label: {
                            Text("Save")
                                .font(.system(.headline, design: .rounded))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                        .padding(.horizontal, 24)
                        .disabled(viewModel.isSaving)
                    }
                    .padding(.vertical, 24)
                }
            }
            .navigationTitle("Edit Profile")
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                viewModel.updateAPI(appState.apiService)
                await viewModel.loadProfile()
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

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var username = ""
    @Published var bio = ""
    @Published var profilePicture: String?
    @Published var selectedBadge = ""
    @Published var colorScheme = "default"
    @Published var badges: [String] = []
    @Published var isSaving = false
    @Published var error: ViewError?

    private var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func updateAPI(_ api: APIService) {
        self.api = api
    }

    func loadProfile() async {
        do {
            let user = try await api.fetchProfile()
            username = user.username ?? ""
            bio = user.bio ?? ""
            profilePicture = user.profilePicture
            selectedBadge = user.selectedBadge ?? ""
            colorScheme = user.colorScheme ?? "default"
            badges = user.badges
        } catch {
            let errorMsg = error.localizedDescription.contains("401") || error.localizedDescription.contains("Unauthorized")
                ? "Please sign in to edit your profile"
                : error.localizedDescription
            self.error = ViewError(message: errorMsg)
        }
    }

    func saveProfile() async {
        guard !isSaving else { return }
        isSaving = true
        defer { isSaving = false }
        do {
            _ = try await api.updateProfile(
                username: username.isEmpty ? nil : username,
                bio: bio.isEmpty ? nil : bio,
                profilePicture: profilePicture,
                selectedBadge: selectedBadge.isEmpty ? nil : selectedBadge,
                colorScheme: colorScheme
            )
        } catch {
            let errorMsg = error.localizedDescription.contains("401") || error.localizedDescription.contains("Unauthorized")
                ? "Please sign in to save your profile"
                : error.localizedDescription
            self.error = ViewError(message: errorMsg)
        }
    }
}

