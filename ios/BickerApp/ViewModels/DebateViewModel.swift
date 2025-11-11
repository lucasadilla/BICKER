import Foundation

@MainActor
final class DebateViewModel: ObservableObject {
    @Published var instigates: [Instigate] = []
    @Published var currentInstigate: Instigate?
    @Published var debateText: String = ""
    @Published var searchTerm: String = ""
    @Published var debates: [Debate] = []
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

    func load() async {
        await loadInstigates()
        await loadDebates()
    }

    func loadInstigates(searchTerm: String? = nil) async {
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
            let fetched = try await api.fetchInstigates(searchTerm: searchTerm)
            await MainActor.run {
                instigates = fetched.shuffled()
                currentInstigate = instigates.first
            }
        } catch {
            await MainActor.run {
                self.error = ViewError(message: error.localizedDescription)
            }
        }
    }

    func loadDebates() async {
        do {
            debates = try await api.fetchDebates()
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }

    func nextInstigate() {
        guard !instigates.isEmpty else { return }
        guard let current = currentInstigate,
              let index = instigates.firstIndex(of: current) else {
            currentInstigate = instigates.first
            return
        }
        let nextIndex = instigates.index(after: index)
        currentInstigate = nextIndex < instigates.endIndex ? instigates[nextIndex] : instigates.first
        debateText = ""
    }

    func selectInstigate(_ instigate: Instigate) {
        currentInstigate = instigate
        debateText = ""
    }

    func submitDebate() async {
        guard !isSubmitting else { return }
        guard let instigate = currentInstigate else {
            error = ViewError(message: "Select an instigate before debating.")
            return
        }
        let trimmed = debateText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            error = ViewError(message: "Add your perspective before submitting.")
            return
        }
        guard trimmed.count <= 200 else {
            error = ViewError(message: "Debate responses are limited to 200 characters.")
            return
        }
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            let debate = try await api.submitDebate(instigateId: instigate.id, text: trimmed)
            debateText = ""
            instigates.removeAll { $0.id == instigate.id }
            currentInstigate = instigates.first
            debates.insert(debate, at: 0)
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }
}
