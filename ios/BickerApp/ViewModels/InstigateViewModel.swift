import Foundation

@MainActor
final class InstigateViewModel: ObservableObject {
    @Published var instigates: [Instigate] = []
    @Published var text: String = ""
    @Published var isLoading = false
    @Published var isSubmitting = false
    @Published var error: ViewError?

    private var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func updateAPI(_ api: APIService) {
        self.api = api
    }

    func loadInstigates() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            instigates = try await api.fetchInstigates()
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }

    func submitInstigate() async {
        guard !isSubmitting else { return }
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            error = ViewError(message: "Please enter a topic before submitting.")
            return
        }
        guard trimmed.count <= 200 else {
            error = ViewError(message: "Instigates are limited to 200 characters.")
            return
        }
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            let instigate = try await api.submitInstigate(text: trimmed)
            text = ""
            instigates.insert(instigate, at: 0)
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }
}
