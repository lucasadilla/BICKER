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

enum VoteRevealTiming {
    static let neutralFill: Double = 0.5
    static let fillResponse: Double = 1.6
    static let fillDamping: Double = 0.78
    static let fillBlend: Double = 0.4
    static let revealDelay: Double = 1.65
    static let revealDuration: Double = 0.55
    static let resetDuration: Double = 0.45
    static let postRevealPause: Double = 3.0

    private static func secondsToNanoseconds(_ seconds: Double) -> UInt64 {
        UInt64((seconds * 1_000_000_000).rounded())
    }

    static var revealDelayNanoseconds: UInt64 { secondsToNanoseconds(revealDelay) }
    static var advanceDelayNanoseconds: UInt64 {
        secondsToNanoseconds(revealDelay + revealDuration + postRevealPause)
    }

    static var fillAnimation: Animation {
        .spring(response: fillResponse, dampingFraction: fillDamping, blendDuration: fillBlend)
    }

    static var revealAnimation: Animation {
        .easeOut(duration: revealDuration)
    }

    static var resetAnimation: Animation {
        .easeInOut(duration: resetDuration)
    }
}

struct DeliberateCardView: View {
    let deliberate: Deliberate
    @ObservedObject var viewModel: DeliberateViewModel
    let index: Int
    @State private var redFill: Double = VoteRevealTiming.neutralFill
    @State private var blueFill: Double = VoteRevealTiming.neutralFill
    @State private var showVoteDetails = false
    @State private var revealTask: Task<Void, Never>?

    var body: some View {
        let hasVoted = if let myVote = deliberate.myVote {
            !myVote.isEmpty
        } else {
            false
        }
        let totalVotes = (deliberate.votesRed ?? 0) + (deliberate.votesBlue ?? 0)
        let redPercent = totalVotes > 0 ? Double(deliberate.votesRed ?? 0) / Double(totalVotes) : 0.5
        let bluePercent = 1.0 - redPercent
        let showVotes = hasVoted && totalVotes > 0

        GeometryReader { geometry in
            let isCompact = geometry.size.width < 600
            let clampedRedFill = max(0.0, min(1.0, redFill))
            let clampedBlueFill = max(0.0, min(1.0, blueFill))

            if isCompact {
                // Mobile: Stack vertically
                VStack(spacing: 0) {
                    // Top Side: Red - Instigate
                    Button {
                        guard !hasVoted, !viewModel.isVoting else { return }
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
                                
                                ProfilePreview(
                                    user: deliberate.instigator,
                                    textColor: .white.opacity(0.9)
                                ) { username in
                                    viewModel.selectedUsername = UsernameWrapper(value: username)
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
                                    .opacity(showVoteDetails ? 1 : 0)
                                    .scaleEffect(showVoteDetails ? 1 : 0.96)
                                    .animation(.easeOut(duration: 0.35), value: showVoteDetails)
                                }

                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting)
                    .frame(height: geometry.size.height * clampedRedFill)
                    
                    // Bottom Side: Blue - Debate
                    Button {
                        guard !hasVoted, !viewModel.isVoting else { return }
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
                                
                                ProfilePreview(
                                    user: deliberate.creator,
                                    textColor: .white.opacity(0.9)
                                ) { username in
                                    viewModel.selectedUsername = UsernameWrapper(value: username)
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
                                    .opacity(showVoteDetails ? 1 : 0)
                                    .scaleEffect(showVoteDetails ? 1 : 0.96)
                                    .animation(.easeOut(duration: 0.35), value: showVoteDetails)
                                }

                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting)
                    .frame(height: geometry.size.height * clampedBlueFill)
                }
            } else {
                // Desktop: Side by side
                HStack(spacing: 0) {
                    // Left Side: Red - Instigate
                    Button {
                        guard !hasVoted, !viewModel.isVoting else { return }
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
                                
                                ProfilePreview(
                                    user: deliberate.instigator,
                                    textColor: .white.opacity(0.9)
                                ) { username in
                                    viewModel.selectedUsername = UsernameWrapper(value: username)
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
                                    .opacity(showVoteDetails ? 1 : 0)
                                    .scaleEffect(showVoteDetails ? 1 : 0.96)
                                    .animation(.easeOut(duration: 0.35), value: showVoteDetails)
                                }

                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting)
                    .frame(width: geometry.size.width * clampedRedFill)

                    // Right Side: Blue - Debate
                    Button {
                        guard !hasVoted, !viewModel.isVoting else { return }
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
                                
                                ProfilePreview(
                                    user: deliberate.creator,
                                    textColor: .white.opacity(0.9)
                                ) { username in
                                    viewModel.selectedUsername = UsernameWrapper(value: username)
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
                                    .opacity(showVoteDetails ? 1 : 0)
                                    .scaleEffect(showVoteDetails ? 1 : 0.96)
                                    .animation(.easeOut(duration: 0.35), value: showVoteDetails)
                                }

                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(VibrantButtonStyle(isDisabled: viewModel.isVoting || hasVoted))
                    .disabled(viewModel.isVoting)
                    .frame(width: geometry.size.width * clampedBlueFill)
                }
            }
        }
        .onAppear {
            syncToCurrentState(showVotes: showVotes, redPercent: redPercent, bluePercent: bluePercent)
        }
        .onChange(of: deliberate.id) { _ in
            syncToCurrentState(showVotes: showVotes, redPercent: redPercent, bluePercent: bluePercent)
        }
        .onChange(of: showVotes) { newValue in
            if newValue {
                startVoteReveal(redPercent: redPercent, bluePercent: bluePercent)
            } else {
                settleToNeutral()
            }
        }
        .onChange(of: deliberate.votesRed ?? 0) { _ in
            guard showVotes else { return }
            withAnimation(VoteRevealTiming.fillAnimation) {
                redFill = redPercent
            }
        }
        .onChange(of: deliberate.votesBlue ?? 0) { _ in
            guard showVotes else { return }
            withAnimation(VoteRevealTiming.fillAnimation) {
                blueFill = bluePercent
            }
        }
        .onDisappear {
            revealTask?.cancel()
            revealTask = nil
        }
        .ignoresSafeArea()
    }

    private func syncToCurrentState(showVotes: Bool, redPercent: Double, bluePercent: Double) {
        revealTask?.cancel()
        revealTask = nil
        if showVotes {
            redFill = redPercent
            blueFill = bluePercent
            showVoteDetails = true
        } else {
            redFill = VoteRevealTiming.neutralFill
            blueFill = VoteRevealTiming.neutralFill
            showVoteDetails = false
        }
    }

    private func startVoteReveal(redPercent: Double, bluePercent: Double) {
        revealTask?.cancel()
        revealTask = nil
        showVoteDetails = false
        redFill = VoteRevealTiming.neutralFill
        blueFill = VoteRevealTiming.neutralFill

        revealTask = Task { @MainActor in
            defer { revealTask = nil }
            withAnimation(VoteRevealTiming.fillAnimation) {
                redFill = redPercent
                blueFill = bluePercent
            }

            try? await Task.sleep(nanoseconds: VoteRevealTiming.revealDelayNanoseconds)

            withAnimation(VoteRevealTiming.revealAnimation) {
                showVoteDetails = true
            }
        }
    }

    private func settleToNeutral() {
        revealTask?.cancel()
        revealTask = nil
        withAnimation(VoteRevealTiming.resetAnimation) {
            redFill = VoteRevealTiming.neutralFill
            blueFill = VoteRevealTiming.neutralFill
            showVoteDetails = false
        }
    }
}

struct ProfilePreview: View {
    let user: Deliberate.Creator?
    let textColor: Color
    let onTap: (String) -> Void

    var body: some View {
        Group {
            if let user, let username = user.username {
                HStack(spacing: 8) {
                    profileImage(for: user)
                    Text(username)
                        .font(.system(.caption, design: .rounded))
                        .foregroundColor(textColor)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(textColor.opacity(0.15))
                .clipShape(Capsule())
                .contentShape(Rectangle())
                .onTapGesture {
                    onTap(username)
                }
                .accessibilityElement(children: .combine)
                .accessibilityAddTraits(.isButton)
                .accessibilityLabel("View profile for \(username)")
            }
        }
    }

    @ViewBuilder
    private func profileImage(for user: Deliberate.Creator) -> some View {
        if let profilePicture = user.profilePicture,
           let url = URL(string: profilePicture) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 24, height: 24)
                        .clipShape(Circle())
                default:
                    placeholder
                }
            }
        } else {
            placeholder
        }
    }

    private var placeholder: some View {
        Circle()
            .fill(textColor.opacity(0.2))
            .frame(width: 24, height: 24)
            .overlay(
                Image(systemName: "person.fill")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(textColor.opacity(0.7))
            )
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

            var shouldDisplayError = true
            if case let APIError.serverError(message) = error,
               message.localizedCaseInsensitiveContains("already voted") {
                await voteStore.markVoted(id: current.id)
                removeDebate(withId: current.id, delayedAdvance: false)
                shouldDisplayError = false
            }

            if shouldDisplayError {
                self.error = ViewError(message: error.localizedDescription)
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

        let delay: UInt64 = delayedAdvance ? VoteRevealTiming.advanceDelayNanoseconds : 0

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

