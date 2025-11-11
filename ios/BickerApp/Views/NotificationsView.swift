import SwiftUI

struct NotificationsView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: NotificationsViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: NotificationsViewModel(api: placeholderService))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.3, green: 0.58, blue: 1.0)
                    .ignoresSafeArea()

                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else if viewModel.notifications.isEmpty {
                    VStack {
                        Text("No notifications")
                            .foregroundColor(.white)
                            .font(.system(.title2, design: .rounded))
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            ForEach(viewModel.notifications) { notification in
                                NotificationCard(notification: notification)
                            }
                        }
                        .padding(24)
                    }
                }
            }
            .navigationTitle("Notifications")
            .toolbarBackground(.hidden, for: .navigationBar)
            .task {
                viewModel.updateAPI(appState.apiService)
                await viewModel.loadNotifications()
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

struct NotificationCard: View {
    let notification: Notification

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(notification.message)
                    .font(.system(.body, design: .rounded))
                    .foregroundColor(.primary)
                if let date = notification.createdAt {
                    Text(date.formatted(.relative(presentation: .named)))
                        .font(.system(.caption, design: .rounded))
                        .foregroundColor(.secondary)
                }
            }
            Spacer()
            if !notification.read {
                Circle()
                    .fill(Color.blue)
                    .frame(width: 8, height: 8)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

@MainActor
final class NotificationsViewModel: ObservableObject {
    @Published var notifications: [Notification] = []
    @Published var page = 1
    @Published var isLoading = false
    @Published var error: ViewError?

    private var api: APIService

    init(api: APIService) {
        self.api = api
    }

    func updateAPI(_ api: APIService) {
        self.api = api
    }

    func loadNotifications() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let response = try await api.fetchNotifications(page: page)
            notifications = response.notifications
            // Mark unread notifications as read
            let unreadIds = notifications.filter { !$0.read }.map { $0.id }
            if !unreadIds.isEmpty {
                try? await api.markNotificationsRead(ids: unreadIds)
            }
        } catch {
            self.error = ViewError(message: error.localizedDescription)
        }
    }
}

