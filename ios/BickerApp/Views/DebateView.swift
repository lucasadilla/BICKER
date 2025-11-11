import SwiftUI

struct DebateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: DebateViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: DebateViewModel(api: placeholderService))
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 1.0, green: 0.3, blue: 0.3), Color(red: 0.3, green: 0.55, blue: 1.0)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    searchBar
                    instigateFocus
                    responseComposer
                    debateFeed
                }
                .padding(24)
            }
        }
        .navigationTitle("Debate")
        .toolbarBackground(Color.clear, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .task {
            viewModel.updateAPI(appState.apiService)
            await viewModel.load()
        }
        .alert(item: $viewModel.error) { error in
            Alert(
                title: Text("Something went wrong"),
                message: Text(error.message),
                dismissButton: .default(Text("OK"))
            )
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Join the debate")
                .font(.system(.largeTitle, design: .rounded))
                .fontWeight(.bold)
                .foregroundColor(.white)
            Text("Choose an instigate to respond to, add your 200 character argument, and share it with the community.")
                .font(.system(.body, design: .rounded))
                .foregroundColor(.white.opacity(0.85))
        }
    }

    private var searchBar: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Find an instigate")
                .font(.system(.headline, design: .rounded))
                .foregroundColor(.white.opacity(0.9))
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.secondary)
                TextField("Search prompts", text: $viewModel.searchTerm)
                    .textInputAutocapitalization(.sentences)
                    .disableAutocorrection(false)
                    .submitLabel(.search)
                    .onSubmit {
                        Task {
                            await viewModel.loadInstigates(searchTerm: viewModel.searchTerm)
                        }
                    }
                if !viewModel.searchTerm.isEmpty {
                    Button {
                        Task { @MainActor in
                            viewModel.searchTerm = ""
                            await viewModel.loadInstigates()
                        }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding(14)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
    }

    private var instigateFocus: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Current instigate")
                    .font(.system(.headline, design: .rounded))
                Spacer()
                Button("Next") {
                    Task { @MainActor in
                        viewModel.nextInstigate()
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(Color(red: 1.0, green: 0.45, blue: 0.45))
                .disabled(viewModel.instigates.count <= 1)
            }

            if let instigate = viewModel.currentInstigate {
                VStack(alignment: .leading, spacing: 12) {
                    Text(instigate.text)
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                    if let author = instigate.createdBy {
                        Text("Instigated by \(author)")
                            .font(.system(.caption, design: .rounded))
                            .foregroundColor(.secondary)
                    }
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
            } else {
                Text("No instigates available yet. Pull to refresh or create one from the Instigate tab.")
                    .font(.system(.body, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
            }

            if !viewModel.instigates.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(viewModel.instigates) { instigate in
                            Button {
                                Task { @MainActor in
                                    viewModel.selectInstigate(instigate)
                                }
                            } label: {
                                Text(instigate.text)
                                    .font(.system(.subheadline, design: .rounded))
                                    .foregroundColor(.white)
                                    .lineLimit(2)
                                    .multilineTextAlignment(.leading)
                                    .padding(12)
                                    .frame(width: 220, alignment: .leading)
                                    .background(
                                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                                            .fill(instigate.id == viewModel.currentInstigate?.id ? Color.blue.opacity(0.8) : Color.black.opacity(0.25))
                                    )
                            }
                        }
                    }
                }
            }
        }
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private var responseComposer: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Your response")
                .font(.system(.headline, design: .rounded))
            TextEditor(text: $viewModel.debateText)
                .frame(height: 160)
                .padding(12)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.black.opacity(0.1), lineWidth: 1)
                )
                .onChange(of: viewModel.debateText) { newValue in
                    if newValue.count > 200 {
                        Task { @MainActor in
                            viewModel.debateText = String(newValue.prefix(200))
                        }
                    }
                }
            HStack {
                Text("\(viewModel.debateText.count)/200")
                    .font(.system(.caption, design: .rounded))
                    .foregroundColor(.secondary)
                Spacer()
                Button {
                    Task {
                        await viewModel.submitDebate()
                    }
                } label: {
                    if viewModel.isSubmitting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Submit debate")
                            .font(.system(.headline, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                    }
                }
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity)
                .background(Color.blue)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .shadow(color: .black.opacity(0.25), radius: 8, x: 0, y: 6)
                .disabled(viewModel.isSubmitting || viewModel.currentInstigate == nil)
            }
        }
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private var debateFeed: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Latest debates")
                    .font(.system(.headline, design: .rounded))
                Spacer()
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                }
            }

            if viewModel.debates.isEmpty {
                Text("Debates that you submit will show up here alongside other community responses.")
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundColor(.white.opacity(0.8))
            } else {
                VStack(spacing: 16) {
                    ForEach(viewModel.debates.prefix(20)) { debate in
                        VStack(alignment: .leading, spacing: 10) {
                            Text(debate.instigateText)
                                .font(.system(.subheadline, design: .rounded))
                                .foregroundColor(.secondary)
                            Text(debate.debateText)
                                .font(.system(.body, design: .rounded))
                                .foregroundColor(.primary)
                            HStack {
                                Text("By \(debate.createdBy)")
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundColor(.secondary)
                                Spacer()
                                if let date = debate.createdAt {
                                    Text(date.formatted(.relative(presentation: .named)))
                                        .font(.system(.caption, design: .rounded))
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(18)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                        .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 4)
                    }
                }
            }
        }
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }
}

struct DebateView_Previews: PreviewProvider {
    static var previews: some View {
        DebateView()
            .environmentObject(AppState())
    }
}
