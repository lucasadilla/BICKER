import Foundation

@MainActor
final class BannerViewModel: ObservableObject {
    @Published var bannerURL: URL?
    @Published var isLoading = false

    var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func loadBanner() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            bannerURL = try await api.fetchBanner()
        } catch {
            bannerURL = nil
        }
    }
}
