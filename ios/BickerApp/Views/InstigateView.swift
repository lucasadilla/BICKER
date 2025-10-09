import SwiftUI

struct InstigateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: InstigateViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: InstigateViewModel(api: placeholderService))
    }

    var body: some View {
        ZStack {
            Color(red: 0.93, green: 0.26, blue: 0.26)
                .ignoresSafeArea()
            ScrollView {
                VStack(spacing: 24) {
                    header
                    entryCard
                    historySection
                }
                .padding(24)
            }
        }
        .navigationTitle("Instigate")
        .toolbarBackground(Color.clear, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .task {
            viewModel.updateAPI(appState.apiService)
            await viewModel.loadInstigates()
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
        VStack(spacing: 12) {
            Text("Start the conversation")
                .font(.system(.title2, design: .rounded))
                .fontWeight(.semibold)
                .foregroundStyle(.white.opacity(0.9))
            Text("Share a 200 character prompt to kick off a new debate.")
                .font(.system(.body, design: .rounded))
                .foregroundStyle(.white.opacity(0.8))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical)
    }

    private var entryCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Your prompt")
                .font(.system(.headline, design: .rounded))
            TextEditor(text: $viewModel.text)
                .frame(height: 220)
                .padding(12)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.black.opacity(0.15), lineWidth: 1)
                )
                .font(.system(size: 20, weight: .regular, design: .rounded))
                .onChange(of: viewModel.text) { newValue in
                    if newValue.count > 200 {
                        viewModel.text = String(newValue.prefix(200))
                    }
                }

            HStack {
                Text("\(viewModel.text.count)/200")
                    .font(.system(.caption, design: .rounded))
                    .foregroundColor(.secondary)
                Spacer()
                Button(action: submit) {
                    if viewModel.isSubmitting {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Submit topic")
                            .font(.system(.headline, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                    }
                }
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity)
                .background(Color.blue)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .shadow(color: .black.opacity(0.25), radius: 8, x: 0, y: 6)
                .disabled(viewModel.isSubmitting)
            }
        }
        .padding(20)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent instigates")
                    .font(.system(.headline, design: .rounded))
                Spacer()
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                }
            }

            if viewModel.instigates.isEmpty {
                Text("Instigates you create will appear here after they are posted.")
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.leading)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(viewModel.instigates.prefix(10)) { instigate in
                        VStack(alignment: .leading, spacing: 8) {
                            Text(instigate.text)
                                .font(.system(.body, design: .rounded))
                                .foregroundColor(.primary)
                            if let author = instigate.createdBy {
                                Text(author)
                                    .font(.system(.caption, design: .rounded))
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                        .shadow(color: .black.opacity(0.08), radius: 6, x: 0, y: 4)
                    }
                }
            }
        }
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    }

    private func submit() {
        Task {
            await viewModel.submitInstigate()
        }
    }
}

struct InstigateView_Previews: PreviewProvider {
    static var previews: some View {
        InstigateView()
            .environmentObject(AppState())
    }
}
