import SwiftUI

struct DeliberateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: DeliberateViewModel

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
                TabView(selection: $viewModel.currentIndex) {
                    ForEach(Array(viewModel.deliberates.enumerated()), id: \.element.id) { index, current in
                        DeliberateCardView(
                            deliberate: current,
                            viewModel: viewModel,
                            index: index
                        )
                        .tag(index)
                    }
                }
                .tabViewStyle(.page)
                .indexViewStyle(.page(backgroundDisplayMode: .never))
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
        .alert(item: $viewModel.error) { error in
            Alert(
                title: Text("Error"),
                message: Text(error.message),
                dismissButton: .default(Text("OK"))
            )
        }
    }
}

struct DeliberateCardView: View {
    let deliberate: Deliberate
    @ObservedObject var viewModel: DeliberateViewModel
    let index: Int
    
    var body: some View {
        GeometryReader { geometry in
            let isCompact = geometry.size.width < 600
            let totalVotes = (deliberate.votesRed ?? 0) + (deliberate.votesBlue ?? 0)
            let redPercent = totalVotes > 0 ? Double(deliberate.votesRed ?? 0) / Double(totalVotes) : 0.5
            let bluePercent = 1.0 - redPercent
            let showVotes = totalVotes > 0
            
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
                                    Text("Votes: \(deliberate.votesRed ?? 0)")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(.plain)
                    .disabled(viewModel.isVoting)
                    .frame(height: max(geometry.size.height * 0.3, showVotes ? geometry.size.height * redPercent : geometry.size.height / 2))
                    .animation(.easeInOut(duration: 1.0), value: redPercent)
                    
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
                                    Text("Votes: \(deliberate.votesBlue ?? 0)")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(.plain)
                    .disabled(viewModel.isVoting)
                    .frame(height: max(geometry.size.height * 0.3, showVotes ? geometry.size.height * bluePercent : geometry.size.height / 2))
                    .animation(.easeInOut(duration: 1.0), value: bluePercent)
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
                                    Text("Votes: \(deliberate.votesRed ?? 0)")
                                        .font(.system(size: 28, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(.plain)
                    .disabled(viewModel.isVoting)
                    .frame(width: max(geometry.size.width * 0.3, showVotes ? geometry.size.width * redPercent : geometry.size.width / 2))
                    .animation(.easeInOut(duration: 1.0), value: redPercent)
                    
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
                                    Text("Votes: \(deliberate.votesBlue ?? 0)")
                                        .font(.system(size: 28, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                }
                                
                                Spacer()
                            }
                            .padding(.top, 60)
                        }
                    }
                    .buttonStyle(.plain)
                    .disabled(viewModel.isVoting)
                    .frame(width: max(geometry.size.width * 0.3, showVotes ? geometry.size.width * bluePercent : geometry.size.width / 2))
                    .animation(.easeInOut(duration: 1.0), value: bluePercent)
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

    func vote(side: String, index: Int) async {
        guard !isVoting, index < deliberates.count else { return }
        let current = deliberates[index]
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
                if index < deliberates.count {
                    deliberates[index] = updated
                    if index == currentIndex {
                        currentDeliberate = updated
                    }
                }
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

