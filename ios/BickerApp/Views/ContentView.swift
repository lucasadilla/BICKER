import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var bannerViewModel: BannerViewModel
    @State private var selectedTab = 0

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _bannerViewModel = StateObject(wrappedValue: BannerViewModel(api: placeholderService))
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            InstigateView()
                .tabItem {
                    Label("Instigate", systemImage: "sparkles")
                }
                .tag(1)
            
            DebateView()
                .tabItem {
                    Label("Debate", systemImage: "message.fill")
                }
                .tag(2)
            
            DeliberateView()
                .tabItem {
                    Label("Deliberate", systemImage: "hand.raised.fill")
                }
                .tag(3)
            
            LeaderboardView()
                .tabItem {
                    Label("Leaderboard", systemImage: "trophy.fill")
                }
                .tag(4)
            
            MyStatsView()
                .tabItem {
                    Label("My Stats", systemImage: "chart.bar.fill")
                }
                .tag(5)
        }
        .task {
            bannerViewModel.api = appState.apiService
            await bannerViewModel.loadBanner()
        }
    }
}

struct HomeView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var bannerViewModel: BannerViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _bannerViewModel = StateObject(wrappedValue: BannerViewModel(api: placeholderService))
    }

    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                let isCompact = geometry.size.width < 600
                ZStack {
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color(red: 1.0, green: 0.3, blue: 0.3),
                            Color(red: 0.3, green: 0.58, blue: 1.0)
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .ignoresSafeArea()

                    VStack(spacing: 24) {
                        if let url = bannerViewModel.bannerURL {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .empty:
                                    ProgressView()
                                        .tint(.white)
                                        .frame(maxWidth: .infinity)
                                case .success(let image):
                                    image
                                        .resizable()
                                        .scaledToFit()
                                        .frame(maxWidth: 600)
                                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                        .shadow(radius: 10)
                                case .failure:
                                    EmptyView()
                                @unknown default:
                                    EmptyView()
                                }
                            }
                            .padding(.top, 16)
                        }

                        if isCompact {
                            VStack(spacing: 16) {
                                landingOption(
                                    title: "Instigate",
                                    subtitle: "Tap to begin",
                                    color: Color(red: 1.0, green: 0.3, blue: 0.3),
                                    destination: InstigateView()
                                )
                                landingOption(
                                    title: "Debate",
                                    subtitle: "Tap to join",
                                    color: Color(red: 0.3, green: 0.58, blue: 1.0),
                                    destination: DebateView()
                                )
                            }
                            .padding(.horizontal, 24)
                            .padding(.bottom, 32)
                        } else {
                            HStack(spacing: 20) {
                                landingOption(
                                    title: "Instigate",
                                    subtitle: "Tap to begin",
                                    color: Color(red: 1.0, green: 0.3, blue: 0.3),
                                    destination: InstigateView()
                                )
                                landingOption(
                                    title: "Debate",
                                    subtitle: "Tap to join",
                                    color: Color(red: 0.3, green: 0.58, blue: 1.0),
                                    destination: DebateView()
                                )
                            }
                            .padding(.horizontal, 40)
                            .frame(maxHeight: .infinity)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .navigationTitle("Bicker")
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                bannerViewModel.api = appState.apiService
                await bannerViewModel.loadBanner()
            }
        }
    }

    private func landingOption<Destination: View>(
        title: String,
        subtitle: String,
        color: Color,
        destination: Destination
    ) -> some View {
        NavigationLink {
            destination
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 32, style: .continuous)
                    .fill(color)
                    .shadow(color: .black.opacity(0.2), radius: 12, x: 0, y: 6)

                VStack(spacing: 12) {
                    Text(title)
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text(subtitle.uppercased())
                        .font(.system(size: 18, weight: .semibold, design: .rounded))
                        .foregroundColor(Color.white.opacity(0.9))
                        .tracking(1.5)
                }
                .padding(24)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 220)
        }
        .buttonStyle(.plain)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
    }
}
