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
            viewModel.updateAPI(appState.apiService)
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
            // Aggressively filter out debates the user has already voted on
            // Check both myVote and votedBy array to be absolutely sure
            let unvoted = fetched.filter { debate in
                // First check: if myVote is set and not empty, exclude it
                if let myVote = debate.myVote, !myVote.isEmpty {
                    return false
                }
                // Second check: if votedBy array exists and has entries, we need to check if user voted
                // But since API should filter this, if myVote is nil, we assume user hasn't voted
                // This is a safety check - API should handle the main filtering
                return true
            }
            await MainActor.run {
                // Also filter out any debates that are already in our list (in case of duplicates)
                let existingIds = Set(deliberates.map { $0.id })
                let newUnvoted = unvoted.filter { !existingIds.contains($0.id) }
                
                // Replace the list entirely with fresh unvoted debates
                deliberates = newUnvoted.shuffled()
                currentIndex = 0
                currentDeliberate = deliberates.first
            }
        } catch {
            await MainActor.run {
                self.error = ViewError(message: error.localizedDescription)
            }
        }
    }

    func vote(side: String, index: Int) async {
        guard !isVoting, index < deliberates.count else { return }
        let current = deliberates[index]
        // Double-check: if myVote is set, don't allow voting
        if let myVote = current.myVote, !myVote.isEmpty {
            // Already voted - remove from list immediately
            await MainActor.run {
                deliberates.removeAll { $0.id == current.id }
                if currentIndex >= deliberates.count && !deliberates.isEmpty {
                    currentIndex = deliberates.count - 1
                } else if currentIndex >= deliberates.count {
                    currentIndex = 0
                }
                if currentIndex < deliberates.count {
                    currentDeliberate = deliberates[currentIndex]
                } else {
                    currentDeliberate = nil
                }
            }
            return
        }
        
        // Optimistically update vote counts immediately for smooth animation (like web version)
        await MainActor.run {
            isVoting = true
            if index < deliberates.count {
                var optimistic = deliberates[index]
                // Create updated vote counts
                let newVotesRed = side == "red" ? (optimistic.votesRed ?? 0) + 1 : (optimistic.votesRed ?? 0)
                let newVotesBlue = side == "blue" ? (optimistic.votesBlue ?? 0) + 1 : (optimistic.votesBlue ?? 0)
                // Create a new Deliberate with optimistic vote counts and myVote set
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
                // Use withAnimation for smooth transition
                withAnimation(.spring(response: 1.2, dampingFraction: 0.75)) {
                    deliberates[index] = optimisticDeliberate
                    if index == currentIndex {
                        currentDeliberate = optimisticDeliberate
                    }
                }
            }
        }
        
        defer {
            Task { @MainActor in
                isVoting = false
            }
        }
        
        do {
            let updated = try await api.voteOnDeliberate(id: current.id, side: side)
            await MainActor.run {
                if index < deliberates.count {
                    // Update with real API response (no animation needed, values should be same or very close)
                    deliberates[index] = updated
                    if index == currentIndex {
                        currentDeliberate = updated
                    }
                    // Immediately remove the voted debate from the list (don't wait for animation)
                    // This prevents the user from seeing it again
                    deliberates.removeAll { $0.id == current.id }
                    
                    // After animation, move to next debate
                    Task { @MainActor in
                        try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds for animation
                        // Adjust current index if needed
                        if currentIndex >= deliberates.count && !deliberates.isEmpty {
                            currentIndex = deliberates.count - 1
                        } else if currentIndex >= deliberates.count {
                            currentIndex = 0
                        }
                        if currentIndex < deliberates.count {
                            currentDeliberate = deliberates[currentIndex]
                        } else {
                            currentDeliberate = nil
                            // If no more debates, try reloading to get new ones
                            if deliberates.isEmpty {
                                await loadDeliberates()
                            }
                        }
                    }
                }
            }
        } catch {
            // On error, revert optimistic update
            await MainActor.run {
                if index < deliberates.count {
                    deliberates[index] = current
                    if index == currentIndex {
                        currentDeliberate = current
                    }
                }
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

