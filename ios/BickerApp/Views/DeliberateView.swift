import SwiftUI

struct DeliberateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: DeliberateViewModel
    @Environment(\.scenePhase) private var scenePhase

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: DeliberateViewModel(api: placeholderService))
    }

    var body: some View {
        Group {
            if viewModel.isLoading {
                ZStack {
                    Color(red: 1.0, green: 0.3, blue: 0.3)
                        .ignoresSafeArea()
                    ProgressView()
                        .tint(.white)
                }
            } else if !viewModel.deliberates.isEmpty {
                GeometryReader { geometry in
                    ScrollViewReader { proxy in
                        ScrollView(.vertical, showsIndicators: false) {
                            VStack(spacing: 0) {
                                ForEach(Array(viewModel.deliberates.enumerated()), id: \.element.id) { index, current in
                                    DeliberateCardView(
                                        deliberate: current,
                                        viewModel: viewModel,
                                        index: index
                                    )
                                    .frame(height: geometry.size.height)
                                    .id(index)
                                }
                            }
                        }
                        .scrollTargetBehavior(.paging)
                        .onChange(of: viewModel.currentIndex) { oldValue, newValue in
                            withAnimation(.easeOut(duration: 0.3)) {
                                proxy.scrollTo(newValue, anchor: .top)
                            }
                        }
                        .onAppear {
                            proxy.scrollTo(viewModel.currentIndex, anchor: .top)
                        }
                    }
                }
                .ignoresSafeArea()
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
        .task {
            await viewModel.updateAPI(appState.apiService)
            await viewModel.loadDeliberates()
        }
        .onChange(of: scenePhase) { oldPhase, newPhase in
            // Reload when app becomes active to ensure fresh data
            if newPhase == .active {
                Task {
                    await viewModel.loadDeliberates()
                }
            }
        }
        .sheet(item: $viewModel.selectedUsername) { username in
            UserProfileView(username: username.value)
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

struct UsernameWrapper: Identifiable {
    let id = UUID()
    let value: String
}

struct VibrantButtonStyle: ButtonStyle {
    let isDisabled: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(isDisabled ? 0.7 : (configuration.isPressed ? 0.9 : 1.0))
    }
}

struct DeliberateCardView: View {
    let deliberate: Deliberate
    @ObservedObject var viewModel: DeliberateViewModel
    let index: Int
    
    var body: some View {
        GeometryReader { geometry in
            let isCompact = geometry.size.width < 600
            // Check if user has voted - if myVote is set and not empty, they've voted
            let hasVoted = if let myVote = deliberate.myVote {
                !myVote.isEmpty
            } else {
                false
            }
            let totalVotes = (deliberate.votesRed ?? 0) + (deliberate.votesBlue ?? 0)
            let redPercent = totalVotes > 0 ? Double(deliberate.votesRed ?? 0) / Double(totalVotes) : 0.5
            let bluePercent = 1.0 - redPercent
            let showVotes = hasVoted && totalVotes > 0
            
            if isCompact {
                // Mobile: Stack vertically
                VStack(spacing: 0) {
                    // Top Side: Red - Instigate
                    Button {
                        Task {
                            await viewModel.vote(side: "red", index: index)
                        }
                    } label: {
                        ZStack {
                            Color(red: 1.0, green: 0.3, blue: 0.3)
                                .ignoresSafeArea()
                            
                            VStack(spacing: 20) {
                                Text(deliberate.instigateText ?? "")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                                
                                if let instigator = deliberate.instigator {
                                    Button {
                                        if let username = instigator.username {
                                            viewModel.selectedUsername = UsernameWrapper(value: username)
                                        }
                                    } label: {
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
                                    .buttonStyle(.plain)
                                }
                                
                                // Reactions
                                if let reactions = deliberate.reactions, let redReactions = reactions.red, !redReactions.isEmpty {
                                    VStack(spacing: 8) {
                                        ForEach(Array(redReactions.keys.sorted()), id: \.self) { emoji in
                                            Text("\(emoji) \(redReactions[emoji] ?? 0)")
                                                .font(.system(.caption, design: .rounded))
                                                .foregroundColor(.white.opacity(0.9))
                                        }
                                    }
                                }
                                
                                if showVotes {
                                    VStack(spacing: 4) {
                                        Text("Votes: \(deliberate.votesRed ?? 0)")
                                            .font(.system(size: 20, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                        Text("\(Int(redPercent * 100))%")
                                            .font(.system(size: 16, weight: .medium, design: .rounded))
                                            .foregroundColor(.white.opacity(0.9))
                                    }
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting || hasVoted)
                    .frame(height: showVotes ? geometry.size.height * redPercent : geometry.size.height / 2)
                    .animation(.spring(response: 1.2, dampingFraction: 0.75), value: redPercent)
                    
                    // Bottom Side: Blue - Debate
                    Button {
                        Task {
                            await viewModel.vote(side: "blue", index: index)
                        }
                    } label: {
                        ZStack {
                            Color(red: 0.3, green: 0.58, blue: 1.0)
                                .ignoresSafeArea()
                            
                            VStack(spacing: 20) {
                                Text(deliberate.debateText ?? "")
                                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                                
                                if let creator = deliberate.creator {
                                    Button {
                                        if let username = creator.username {
                                            viewModel.selectedUsername = UsernameWrapper(value: username)
                                        }
                                    } label: {
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
                                    .buttonStyle(.plain)
                                }
                                
                                // Reactions
                                if let reactions = deliberate.reactions, let blueReactions = reactions.blue, !blueReactions.isEmpty {
                                    VStack(spacing: 8) {
                                        ForEach(Array(blueReactions.keys.sorted()), id: \.self) { emoji in
                                            Text("\(emoji) \(blueReactions[emoji] ?? 0)")
                                                .font(.system(.caption, design: .rounded))
                                                .foregroundColor(.white.opacity(0.9))
                                        }
                                    }
                                }
                                
                                if showVotes {
                                    VStack(spacing: 4) {
                                        Text("Votes: \(deliberate.votesBlue ?? 0)")
                                            .font(.system(size: 20, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                        Text("\(Int(bluePercent * 100))%")
                                            .font(.system(size: 16, weight: .medium, design: .rounded))
                                            .foregroundColor(.white.opacity(0.9))
                                    }
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting || hasVoted)
                    .frame(height: showVotes ? geometry.size.height * bluePercent : geometry.size.height / 2)
                    .animation(.spring(response: 1.2, dampingFraction: 0.75), value: bluePercent)
                }
            } else {
                // Desktop: Side by side
                HStack(spacing: 0) {
                    // Left Side: Red - Instigate
                    Button {
                        Task {
                            await viewModel.vote(side: "red", index: index)
                        }
                    } label: {
                        ZStack {
                            Color(red: 1.0, green: 0.3, blue: 0.3)
                                .ignoresSafeArea()
                            
                            VStack(spacing: 20) {
                                Text(deliberate.instigateText ?? "")
                                    .font(.system(size: 36, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                                
                                if let instigator = deliberate.instigator {
                                    Button {
                                        if let username = instigator.username {
                                            viewModel.selectedUsername = UsernameWrapper(value: username)
                                        }
                                    } label: {
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
                                    .buttonStyle(.plain)
                                }
                                
                                // Reactions
                                if let reactions = deliberate.reactions, let redReactions = reactions.red, !redReactions.isEmpty {
                                    VStack(spacing: 8) {
                                        ForEach(Array(redReactions.keys.sorted()), id: \.self) { emoji in
                                            Text("\(emoji) \(redReactions[emoji] ?? 0)")
                                                .font(.system(.caption, design: .rounded))
                                                .foregroundColor(.white.opacity(0.9))
                                        }
                                    }
                                }
                                
                                if showVotes {
                                    VStack(spacing: 4) {
                                        Text("Votes: \(deliberate.votesRed ?? 0)")
                                            .font(.system(size: 28, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                        Text("\(Int(redPercent * 100))%")
                                            .font(.system(size: 20, weight: .medium, design: .rounded))
                                            .foregroundColor(.white.opacity(0.9))
                                    }
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting || hasVoted)
                    .frame(width: showVotes ? geometry.size.width * redPercent : geometry.size.width / 2)
                    .animation(.spring(response: 1.2, dampingFraction: 0.75), value: redPercent)
                    
                    // Right Side: Blue - Debate
                    Button {
                        Task {
                            await viewModel.vote(side: "blue", index: index)
                        }
                    } label: {
                        ZStack {
                            Color(red: 0.3, green: 0.58, blue: 1.0)
                                .ignoresSafeArea()
                            
                            VStack(spacing: 20) {
                                Text(deliberate.debateText ?? "")
                                    .font(.system(size: 36, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                                
                                if let creator = deliberate.creator {
                                    Button {
                                        if let username = creator.username {
                                            viewModel.selectedUsername = UsernameWrapper(value: username)
                                        }
                                    } label: {
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
                                    .buttonStyle(.plain)
                                }
                                
                                // Reactions
                                if let reactions = deliberate.reactions, let blueReactions = reactions.blue, !blueReactions.isEmpty {
                                    VStack(spacing: 8) {
                                        ForEach(Array(blueReactions.keys.sorted()), id: \.self) { emoji in
                                            Text("\(emoji) \(blueReactions[emoji] ?? 0)")
                                                .font(.system(.caption, design: .rounded))
                                                .foregroundColor(.white.opacity(0.9))
                                        }
                                    }
                                }
                                
                                if showVotes {
                                    VStack(spacing: 4) {
                                        Text("Votes: \(deliberate.votesBlue ?? 0)")
                                            .font(.system(size: 28, weight: .semibold, design: .rounded))
                                            .foregroundColor(.white)
                                        Text("\(Int(bluePercent * 100))%")
                                            .font(.system(size: 20, weight: .medium, design: .rounded))
                                            .foregroundColor(.white.opacity(0.9))
                                    }
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting || hasVoted)
                    .frame(width: showVotes ? geometry.size.width * bluePercent : geometry.size.width / 2)
                    .animation(.spring(response: 1.2, dampingFraction: 0.75), value: bluePercent)
                }
            }
        }
        .ignoresSafeArea()
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
    @Published var selectedUsername: UsernameWrapper?

    var api: APIService
    private let voteStore: DeliberateVoteStore

    init(api: APIService, voteStore: DeliberateVoteStore = DeliberateVoteStore()) {
        self.api = api
        self.voteStore = voteStore
    }

    func updateAPI(_ api: APIService) async {
        self.api = api
        await voteStore.updateUserIdentifier(baseURL: api.configuration.baseURL)
    }

    func loadDeliberates() async {
        guard !isLoading else { return }
        await voteStore.updateUserIdentifier(baseURL: api.configuration.baseURL)
        isLoading = true
        defer { isLoading = false }
        do {
            let fetched = try await api.fetchDeliberates()
            let filtered = await voteStore.filterUnvotedDebates(fetched)
            let existingIds = Set(deliberates.map { $0.id })
            let newUnvoted = filtered.filter { !existingIds.contains($0.id) }

            deliberates = newUnvoted.shuffled()
            currentIndex = 0
            currentDeliberate = deliberates.first
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }

    func vote(side: String, index: Int) async {
        guard !isVoting, index < deliberates.count else { return }
        let current = deliberates[index]
        // Double-check: if we've already recorded this debate as voted, remove it immediately
        if await voteStore.hasVoted(id: current.id) || !(current.myVote?.isEmpty ?? true) {
            await voteStore.markVoted(id: current.id)
            removeDebate(withId: current.id, delayedAdvance: false)
            return
        }

        isVoting = true
        defer { isVoting = false }

        if index < deliberates.count {
            let optimistic = deliberates[index]
            let newVotesRed = side == "red" ? (optimistic.votesRed ?? 0) + 1 : (optimistic.votesRed ?? 0)
            let newVotesBlue = side == "blue" ? (optimistic.votesBlue ?? 0) + 1 : (optimistic.votesBlue ?? 0)

            let optimisticDeliberate = Deliberate(
                id: optimistic.id,
                instigateText: optimistic.instigateText,
                debateText: optimistic.debateText,
                createdBy: optimistic.createdBy,
                instigatedBy: optimistic.instigatedBy,
                votesRed: newVotesRed,
                votesBlue: newVotesBlue,
                reactions: optimistic.reactions,
                myVote: side,
                myReactions: optimistic.myReactions,
                createdAt: optimistic.createdAt,
                updatedAt: optimistic.updatedAt,
                creator: optimistic.creator,
                instigator: optimistic.instigator,
                votedBy: optimistic.votedBy
            )

            withAnimation(.spring(response: 1.2, dampingFraction: 0.75)) {
                deliberates[index] = optimisticDeliberate
                if index == currentIndex {
                    currentDeliberate = optimisticDeliberate
                }
            }
        }

        do {
            let updated = try await api.voteOnDeliberate(id: current.id, side: side)
            if index < deliberates.count {
                deliberates[index] = updated
                if index == currentIndex {
                    currentDeliberate = updated
                }
            }
            await voteStore.markVoted(id: current.id)
            removeDebate(withId: current.id, delayedAdvance: true)
        } catch {
            if index < deliberates.count {
                deliberates[index] = current
                if index == currentIndex {
                    currentDeliberate = current
                }
            }
            self.error = ViewError(message: error.localizedDescription)

            if case let APIError.serverError(message) = error,
               message.localizedCaseInsensitiveContains("already voted") {
                await voteStore.markVoted(id: current.id)
                removeDebate(withId: current.id, delayedAdvance: false)
            }
        }
    }

    func nextDeliberate() {
        guard !deliberates.isEmpty else { return }
        currentIndex = (currentIndex + 1) % deliberates.count
        currentDeliberate = deliberates[currentIndex]
    }

    private func removeDebate(withId id: String, delayedAdvance: Bool) {
        deliberates.removeAll { $0.id == id }

        let delay: UInt64 = delayedAdvance ? 2_000_000_000 : 0

        Task { @MainActor in
            if delay > 0 {
                try? await Task.sleep(nanoseconds: delay)
            }

            if deliberates.isEmpty {
                currentIndex = 0
                currentDeliberate = nil
                await loadDeliberates()
                return
            }

            if currentIndex >= deliberates.count {
                currentIndex = deliberates.count - 1
            }

            if currentIndex < deliberates.count {
                currentDeliberate = deliberates[currentIndex]
            } else {
                currentDeliberate = nil
            }
        }
    }
}

