import Foundation

@MainActor
final class AppState: ObservableObject {
    @Published var configuration = AppConfiguration()

    var apiService: APIService {
        APIService(configuration: configuration)
    }
}
