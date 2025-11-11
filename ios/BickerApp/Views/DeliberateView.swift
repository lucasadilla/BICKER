import SwiftUI

struct DeliberateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: DeliberateViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: DeliberateViewModel(api: placeholderService))
    }

    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                let isCompact = geometry.size.width < 600
                
                if viewModel.isLoading {
                    ZStack {
                        Color(red: 1.0, green: 0.3, blue: 0.3)
                            .ignoresSafeArea()
                        ProgressView()
                            .tint(.white)
                    }
                } else if let current = viewModel.currentDeliberate {
                    let totalVotes = (current.votesRed ?? 0) + (current.votesBlue ?? 0)
                    let redPercent = totalVotes > 0 ? Double(current.votesRed ?? 0) / Double(totalVotes) : 0.5
                    let bluePercent = 1.0 - redPercent
                    let showVotes = totalVotes > 0
                    
                    HStack(spacing: 0) {
                        // Left Side: Red - Instigate
                        Button {
                            Task {
                                await viewModel.vote(side: "red")
                            }
                        } label: {
                            ZStack {
                                Color(red: 1.0, green: 0.3, blue: 0.3)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 20) {
                                    Text(current.instigateText ?? "")
                                        .font(.system(size: isCompact ? 24 : 36, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, 20)
                                    
                                    if let instigator = current.instigator {
                                        HStack(spacing: 8) {
                                            if let profilePicture = instigator.profilePicture,
                                               let url = URL(string: profilePicture) {
                                                AsyncImage(url: url) { phase in
                                                    if case .success(let image) = phase {
                                                        image
                                                            .resizable()
                                                            .scaledToFill()
                                                            .frame(width: 24, height: 24)
                                                            .clipShape(Circle())
                                                    }
                                                }
                                            }
                                            if let username = instigator.username {
                                                Text(username)
                                                    .font(.system(.caption, design: .rounded))
                                                    .foregroundColor(.white.opacity(0.9))
                                            }
                                        }
                                    }
                                    
                                    // Reactions
                                    if let reactions = current.reactions, let redReactions = reactions.red, !redReactions.isEmpty {
                                        VStack(spacing: 8) {
                                            ForEach(Array(redReactions.keys.sorted()), id: \.self) { emoji in
                                                Text("\(emoji) \(redReactions[emoji] ?? 0)")
                                                    .font(.system(.caption, design: .rounded))
                                                    .foregroundColor(.white.opacity(0.9))
                                            }
                                        }
                                    }
                                    
                                    if showVotes {
                                        Text("Votes: \(current.votesRed ?? 0)")
                                            .font(.system(size: isCompact ? 20 : 28, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                    }
                                    
                                    Spacer()
                                }
                                .padding(.top, 60)
                            }
                        }
                        .buttonStyle(.plain)
                        .disabled(viewModel.isVoting)
                        .frame(width: isCompact ? geometry.size.width : (showVotes ? geometry.size.width * redPercent : geometry.size.width / 2))
                        .animation(.easeInOut(duration: 1.0), value: redPercent)
                        
                        // Right Side: Blue - Debate
                        Button {
                            Task {
                                await viewModel.vote(side: "blue")
                            }
                        } label: {
                            ZStack {
                                Color(red: 0.3, green: 0.58, blue: 1.0)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 20) {
                                    Text(current.debateText ?? "")
                                        .font(.system(size: isCompact ? 24 : 36, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, 20)
                                    
                                    if let creator = current.creator {
                                        HStack(spacing: 8) {
                                            if let profilePicture = creator.profilePicture,
                                               let url = URL(string: profilePicture) {
                                                AsyncImage(url: url) { phase in
                                                    if case .success(let image) = phase {
                                                        image
                                                            .resizable()
                                                            .scaledToFill()
                                                            .frame(width: 24, height: 24)
                                                            .clipShape(Circle())
                                                    }
                                                }
                                            }
                                            if let username = creator.username {
                                                Text(username)
                                                    .font(.system(.caption, design: .rounded))
                                                    .foregroundColor(.white.opacity(0.9))
                                            }
                                        }
                                    }
                                    
                                    // Reactions
                                    if let reactions = current.reactions, let blueReactions = reactions.blue, !blueReactions.isEmpty {
                                        VStack(spacing: 8) {
                                            ForEach(Array(blueReactions.keys.sorted()), id: \.self) { emoji in
                                                Text("\(emoji) \(blueReactions[emoji] ?? 0)")
                                                    .font(.system(.caption, design: .rounded))
                                                    .foregroundColor(.white.opacity(0.9))
                                            }
                                        }
                                    }
                                    
                                    if showVotes {
                                        Text("Votes: \(current.votesBlue ?? 0)")
                                            .font(.system(size: isCompact ? 20 : 28, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                    }
                                    
                                    Spacer()
                                }
                                .padding(.top, 60)
                            }
                        }
                        .buttonStyle(.plain)
                        .disabled(viewModel.isVoting)
                        .frame(width: isCompact ? geometry.size.width : (showVotes ? geometry.size.width * bluePercent : geometry.size.width / 2))
                        .animation(.easeInOut(duration: 1.0), value: bluePercent)
                    }
                    .overlay(alignment: .center) {
                        // Skip button
                        Button {
                            Task { @MainActor in
                                viewModel.nextDeliberate()
                            }
                        } label: {
                            Text("Skip")
                                .font(.system(.headline, design: .rounded))
                                .foregroundColor(.primary)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 10)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        .position(
                            x: isCompact ? geometry.size.width / 2 : (showVotes ? geometry.size.width * redPercent : geometry.size.width / 2),
                            y: isCompact ? (showVotes ? geometry.size.height * redPercent : geometry.size.height / 2) : geometry.size.height / 2
                        )
                        .animation(.easeInOut(duration: 1.0), value: redPercent)
                    }
                } else {
                    ZStack {
                        Color(red: 1.0, green: 0.3, blue: 0.3)
                            .ignoresSafeArea()
                        VStack {
                            Text("No debates available")
                                .foregroundColor(.white)
                                .font(.system(.title2, design: .rounded))
                        }
                    }
                }
            }
            .navigationTitle("Deliberate")
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                viewModel.updateAPI(appState.apiService)
                await viewModel.loadDeliberates()
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
final class DeliberateViewModel: ObservableObject {
    @Published var deliberates: [Deliberate] = []
    @Published var currentDeliberate: Deliberate?
    @Published var currentIndex = 0
    @Published var isLoading = false
    @Published var isVoting = false
    @Published var error: ViewError?

    private var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func updateAPI(_ api: APIService) {
        self.api = api
    }

    func loadDeliberates() async {
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
            let fetched = try await api.fetchDeliberates()
            await MainActor.run {
                deliberates = fetched.shuffled()
                currentIndex = 0
                currentDeliberate = deliberates.first
            }
        } catch {
            await MainActor.run {
                self.error = ViewError(message: error.localizedDescription)
            }
        }
    }

    func vote(side: String) async {
        guard !isVoting, let current = currentDeliberate else { return }
        await MainActor.run {
            isVoting = true
        }
        defer {
            Task { @MainActor in
                isVoting = false
            }
        }
        do {
            let updated = try await api.voteOnDeliberate(id: current.id, side: side)
            await MainActor.run {
                if let index = deliberates.firstIndex(where: { $0.id == updated.id }) {
                    deliberates[index] = updated
                }
                currentDeliberate = updated
            }
        } catch {
            await MainActor.run {
                self.error = ViewError(message: error.localizedDescription)
            }
        }
    }

    func nextDeliberate() {
        guard !deliberates.isEmpty else { return }
        currentIndex = (currentIndex + 1) % deliberates.count
        currentDeliberate = deliberates[currentIndex]
    }
}

