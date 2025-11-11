import SwiftUI

struct LeaderboardView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: LeaderboardViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: LeaderboardViewModel(api: placeholderService))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.3, green: 0.58, blue: 1.0)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Stats summary
                        HStack(spacing: 20) {
                            VStack {
                                Text("\(viewModel.totalDebates)")
                                    .font(.system(size: 32, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                Text("Total Debates")
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundColor(.white.opacity(0.9))
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 16))

                            VStack {
                                Text("\(viewModel.totalVotes)")
                                    .font(.system(size: 32, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                Text("Total Votes")
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundColor(.white.opacity(0.9))
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                        .padding(.horizontal, 24)

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
                        .onChange(of: viewModel.sort) { _ in
                            Task {
                                await viewModel.loadStats()
                            }
                        }

                        // Top Players button
                        Button {
                            viewModel.showTopPlayers.toggle()
                            if viewModel.showTopPlayers && viewModel.topPlayers == nil {
                                Task {
                                    await viewModel.loadTopPlayers()
                                }
                            }
                        } label: {
                            Text("Top Players")
                                .font(.system(.headline, design: .rounded))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                        .padding(.horizontal, 24)

                        // Top Players section
                        if viewModel.showTopPlayers, let topPlayers = viewModel.topPlayers {
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Top Players")
                                    .font(.system(.title2, design: .rounded))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 24)

                                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                    TopPlayersSection(title: "Highest Win Rate", players: topPlayers.highestWinRate)
                                    TopPlayersSection(title: "Most Votes", players: topPlayers.mostVotes)
                                    TopPlayersSection(title: "Most Debates", players: topPlayers.mostDebates)
                                    TopPlayersSection(title: "Lowest Win Rate", players: topPlayers.lowestWinRate)
                                }
                                .padding(.horizontal, 24)
                            }
                        }

                        // Debates list
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            VStack(spacing: 16) {
                                ForEach(viewModel.debates) { debate in
                                    DebateCard(debate: debate)
                                }
                            }
                            .padding(.horizontal, 24)
                        }
                    }
                    .padding(.vertical, 24)
                }
            }
            .navigationTitle("Leaderboard")
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                viewModel.updateAPI(appState.apiService)
                await viewModel.loadStats()
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

struct TopPlayersSection: View {
    let title: String
    let players: [PlayerStat]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(.headline, design: .rounded))
                .foregroundColor(.white)
            ForEach(Array(players.prefix(5).enumerated()), id: \.offset) { index, player in
                HStack {
                    Text("\(index + 1). \(player.username)")
                        .font(.system(.caption, design: .rounded))
                        .foregroundColor(.white.opacity(0.9))
                    Spacer()
                    if let winRate = player.winRate {
                        Text("\(Int(winRate * 100))%")
                            .font(.system(.caption, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                    } else if let votes = player.votes {
                        Text("\(votes)")
                            .font(.system(.caption, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                    } else if let debates = player.debates {
                        Text("\(debates)")
                            .font(.system(.caption, design: .rounded))
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct DebateCard: View {
    let debate: StatsDebate

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(debate.instigateText)
                    .font(.system(.body, design: .rounded))
                    .foregroundColor(.white)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(red: 1.0, green: 0.3, blue: 0.3))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }

            HStack {
                Spacer()
                Text(debate.debateText)
                    .font(.system(.body, design: .rounded))
                    .foregroundColor(.white)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .background(Color(red: 0.3, green: 0.58, blue: 1.0))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }

            HStack {
                Text("Red: \(debate.votesRed)")
                    .foregroundColor(.white)
                Spacer()
                Text("Blue: \(debate.votesBlue)")
                    .foregroundColor(.white)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}

@MainActor
final class LeaderboardViewModel: ObservableObject {
    @Published var debates: [StatsDebate] = []
    @Published var totalDebates = 0
    @Published var totalVotes = 0
    @Published var sort = "newest"
    @Published var showTopPlayers = false
    @Published var topPlayers: TopPlayersResponse?
    @Published var isLoading = false
    @Published var error: ViewError?

    private var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func updateAPI(_ api: APIService) {
        self.api = api
    }

    func loadStats() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let response = try await api.fetchStats(sort: sort)
            debates = response.debates
            totalDebates = response.totalDebates
            totalVotes = response.totalVotes
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }

    func loadTopPlayers() async {
        do {
            topPlayers = try await api.fetchTopPlayers()
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }
}

