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
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 1.0, green: 0.3, blue: 0.3),
                        Color(red: 0.3, green: 0.58, blue: 1.0)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else if let current = viewModel.currentDeliberate {
                    ScrollView {
                        VStack(spacing: 24) {
                            // Instigate bubble (red/left)
                            HStack {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(current.instigateText)
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                        .padding(20)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .background(Color(red: 1.0, green: 0.3, blue: 0.3))
                                        .clipShape(RoundedRectangle(cornerRadius: 20))
                                        .shadow(radius: 8)
                                }
                                Spacer()
                            }
                            .padding(.horizontal, 24)

                            // Debate bubble (blue/right)
                            HStack {
                                Spacer()
                                VStack(alignment: .trailing, spacing: 12) {
                                    Text(current.debateText)
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.white)
                                        .padding(20)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                        .background(Color(red: 0.3, green: 0.58, blue: 1.0))
                                        .clipShape(RoundedRectangle(cornerRadius: 20))
                                        .shadow(radius: 8)
                                }
                            }
                            .padding(.horizontal, 24)

                            // Vote buttons
                            HStack(spacing: 20) {
                                Button {
                                    Task {
                                        await viewModel.vote(side: "red")
                                    }
                                } label: {
                                    Text("Vote Red")
                                        .font(.system(.headline, design: .rounded))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color(red: 1.0, green: 0.3, blue: 0.3))
                                        .clipShape(RoundedRectangle(cornerRadius: 16))
                                }
                                .disabled(viewModel.isVoting)

                                Button {
                                    Task {
                                        await viewModel.vote(side: "blue")
                                    }
                                } label: {
                                    Text("Vote Blue")
                                        .font(.system(.headline, design: .rounded))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color(red: 0.3, green: 0.58, blue: 1.0))
                                        .clipShape(RoundedRectangle(cornerRadius: 16))
                                }
                                .disabled(viewModel.isVoting)
                            }
                            .padding(.horizontal, 24)

                            // Vote counts
                            HStack {
                                Text("Red: \(current.votesRed)")
                                    .foregroundColor(.white)
                                Spacer()
                                Text("Blue: \(current.votesBlue)")
                                    .foregroundColor(.white)
                            }
                            .padding(.horizontal, 24)

                            // Reactions
                            if let reactions = current.reactions {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Reactions")
                                        .font(.system(.headline, design: .rounded))
                                        .foregroundColor(.white)
                                    
                                    HStack {
                                        VStack {
                                            Text("Red")
                                                .foregroundColor(.white)
                                            ForEach(Array(reactions.red.keys.sorted()), id: \.self) { emoji in
                                                Text("\(emoji) \(reactions.red[emoji] ?? 0)")
                                                    .foregroundColor(.white)
                                            }
                                        }
                                        Spacer()
                                        VStack {
                                            Text("Blue")
                                                .foregroundColor(.white)
                                            ForEach(Array(reactions.blue.keys.sorted()), id: \.self) { emoji in
                                                Text("\(emoji) \(reactions.blue[emoji] ?? 0)")
                                                    .foregroundColor(.white)
                                            }
                                        }
                                    }
                                }
                                .padding(20)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: 20))
                                .padding(.horizontal, 24)
                            }

                            // Next button
                            Button {
                                viewModel.nextDeliberate()
                            } label: {
                                Text("Next Debate")
                                    .font(.system(.headline, design: .rounded))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(.ultraThinMaterial)
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                            }
                            .padding(.horizontal, 24)
                            .padding(.bottom, 32)
                        }
                        .padding(.top, 24)
                    }
                } else {
                    VStack {
                        Text("No debates available")
                            .foregroundColor(.white)
                            .font(.system(.title2, design: .rounded))
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
        isLoading = true
        defer { isLoading = false }
        do {
            deliberates = try await api.fetchDeliberates()
            deliberates.shuffle()
            currentIndex = 0
            currentDeliberate = deliberates.first
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }

    func vote(side: String) async {
        guard !isVoting, let current = currentDeliberate else { return }
        isVoting = true
        defer { isVoting = false }
        do {
            let updated = try await api.voteOnDeliberate(id: current.id, side: side)
            if let index = deliberates.firstIndex(where: { $0.id == updated.id }) {
                deliberates[index] = updated
            }
            currentDeliberate = updated
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }

    func nextDeliberate() {
        guard !deliberates.isEmpty else { return }
        currentIndex = (currentIndex + 1) % deliberates.count
        currentDeliberate = deliberates[currentIndex]
    }
}

