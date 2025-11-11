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
            await MainActor.run {
                bannerViewModel.api = appState.apiService
            }
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
        GeometryReader { geometry in
            let isCompact = geometry.size.width < 600
            VStack(spacing: 0) {
                // Banner
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
                                .frame(maxWidth: .infinity)
                        case .failure:
                            EmptyView()
                        @unknown default:
                            EmptyView()
                        }
                    }
                    .frame(maxHeight: 200)
                }
                
                // Split screen
                if isCompact {
                    VStack(spacing: 0) {
                        // Top: Instigate (Red)
                        NavigationLink {
                            InstigateView()
                        } label: {
                            ZStack {
                                Color(red: 1.0, green: 0.3, blue: 0.3)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Instigate")
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Begin")
                                        .font(.system(size: 18, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(height: (geometry.size.height - (bannerViewModel.bannerURL != nil ? 200 : 0)) / 2)
                        }
                        .buttonStyle(.plain)
                        
                        // Bottom: Debate (Blue)
                        NavigationLink {
                            DebateView()
                        } label: {
                            ZStack {
                                Color(red: 0.3, green: 0.58, blue: 1.0)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Debate")
                                        .font(.system(size: 32, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Join")
                                        .font(.system(size: 18, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(height: (geometry.size.height - (bannerViewModel.bannerURL != nil ? 200 : 0)) / 2)
                        }
                        .buttonStyle(.plain)
                    }
                } else {
                    HStack(spacing: 0) {
                        // Left: Instigate (Red)
                        NavigationLink {
                            InstigateView()
                        } label: {
                            ZStack {
                                Color(red: 1.0, green: 0.3, blue: 0.3)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Instigate")
                                        .font(.system(size: 40, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Begin")
                                        .font(.system(size: 20, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(width: geometry.size.width / 2)
                        }
                        .buttonStyle(.plain)
                        
                        // Right: Debate (Blue)
                        NavigationLink {
                            DebateView()
                        } label: {
                            ZStack {
                                Color(red: 0.3, green: 0.58, blue: 1.0)
                                    .ignoresSafeArea()
                                
                                VStack(spacing: 12) {
                                    Text("Debate")
                                        .font(.system(size: 40, weight: .bold, design: .rounded))
                                        .foregroundColor(.white)
                                    Text("Click to Join")
                                        .font(.system(size: 20, weight: .medium, design: .rounded))
                                        .foregroundColor(.white.opacity(0.9))
                                }
                            }
                            .frame(width: geometry.size.width / 2)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .task {
            bannerViewModel.api = appState.apiService
            await bannerViewModel.loadBanner()
        }
    }

}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(AppState())
    }
}
