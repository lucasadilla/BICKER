import SwiftUI

struct DebateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: DebateViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: DebateViewModel(api: placeholderService))
    }

    var body: some View {
        GeometryReader { geometry in
            let isCompact = geometry.size.width < 600
            
            if isCompact {
                // Mobile: Stack vertically like web
                VStack(spacing: 0) {
                    // Top: Red - Instigate Display
                    ZStack {
                        Color(red: 1.0, green: 0.3, blue: 0.3)
                            .ignoresSafeArea()
                        
                        VStack(spacing: 20) {
                            // Search bar at top
                            VStack(spacing: 12) {
                                HStack {
                                    Image(systemName: "magnifyingglass")
                                        .foregroundColor(.white.opacity(0.7))
                                    TextField("Search prompts", text: $viewModel.searchTerm)
                                        .foregroundColor(.white)
                                        .textInputAutocapitalization(.sentences)
                                        .disableAutocorrection(false)
                                        .submitLabel(.search)
                                        .onChange(of: viewModel.searchTerm) { oldValue, newValue in
                                            Task {
                                                await viewModel.loadInstigates(searchTerm: newValue.isEmpty ? nil : newValue)
                                            }
                                        }
                                        .onSubmit {
                                            Task {
                                                await viewModel.loadInstigates(searchTerm: viewModel.searchTerm.isEmpty ? nil : viewModel.searchTerm)
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
                                                .foregroundColor(.white.opacity(0.7))
                                        }
                                    }
                                }
                                .padding(14)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: 18))
                            }
                            .padding(.horizontal, 20)
                            .padding(.top, 60)
                            
                            // Current instigate - entire area below search bar is clickable
                            Button {
                                Task { @MainActor in
                                    viewModel.nextInstigate()
                                }
                            } label: {
                                ZStack {
                                    Color.clear
                                    if let instigate = viewModel.currentInstigate {
                                        VStack(spacing: 16) {
                                            Text(instigate.text)
                                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                                .foregroundColor(.white)
                                                .multilineTextAlignment(.center)
                                                .padding(.horizontal, 20)
                                        }
                                    } else {
                                        Text("No topics available")
                                            .font(.system(size: 24, weight: .bold, design: .rounded))
                                            .foregroundColor(.white)
                                            .multilineTextAlignment(.center)
                                            .padding(.horizontal, 20)
                                    }
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .frame(height: geometry.size.height / 2)
                    
                    // Bottom: Blue - Response Input
                    ZStack {
                        Color(red: 0.3, green: 0.58, blue: 1.0)
                            .ignoresSafeArea()
                        
                        VStack(spacing: 20) {
                            Spacer()
                                .frame(height: 40)
                            
                            TextEditor(text: $viewModel.debateText)
                                .font(.system(size: 20, design: .rounded))
                                .foregroundColor(.black)
                                .frame(height: 150)
                                .padding(12)
                                .background(Color.white)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
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
                                    .foregroundColor(.white.opacity(0.8))
                                Spacer()
                            }
                            .padding(.horizontal, 20)
                            
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
                                    Text("Submit Debate")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                }
                            }
                            .padding(.vertical, 16)
                            .frame(maxWidth: .infinity)
                            .background(Color.blue.opacity(0.8))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .shadow(color: .black.opacity(0.25), radius: 8, x: 0, y: 6)
                            .disabled(viewModel.isSubmitting || viewModel.currentInstigate == nil)
                            .padding(.horizontal, 20)
                            
                            Spacer()
                        }
                        .padding(.horizontal, 20)
                    }
                    .frame(height: geometry.size.height / 2)
                }
            } else {
                // Desktop: Side by side
                HStack(spacing: 0) {
                    // Left Side: Red - Instigate Display
                    ZStack {
                        Color(red: 1.0, green: 0.3, blue: 0.3)
                            .ignoresSafeArea()
                        
                        VStack(spacing: 20) {
                            // Search bar at top
                            VStack(spacing: 12) {
                                HStack {
                                    Image(systemName: "magnifyingglass")
                                        .foregroundColor(.white.opacity(0.7))
                                    TextField("Search prompts", text: $viewModel.searchTerm)
                                        .foregroundColor(.white)
                                        .textInputAutocapitalization(.sentences)
                                        .disableAutocorrection(false)
                                        .submitLabel(.search)
                                        .onChange(of: viewModel.searchTerm) { oldValue, newValue in
                                            Task {
                                                await viewModel.loadInstigates(searchTerm: newValue.isEmpty ? nil : newValue)
                                            }
                                        }
                                        .onSubmit {
                                            Task {
                                                await viewModel.loadInstigates(searchTerm: viewModel.searchTerm.isEmpty ? nil : viewModel.searchTerm)
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
                                                .foregroundColor(.white.opacity(0.7))
                                        }
                                    }
                                }
                                .padding(14)
                                .background(.ultraThinMaterial)
                                .clipShape(RoundedRectangle(cornerRadius: 18))
                            }
                            .padding(.horizontal, 20)
                            .padding(.top, 60)
                            
                            // Current instigate - entire area below search bar is clickable
                            Button {
                                Task { @MainActor in
                                    viewModel.nextInstigate()
                                }
                            } label: {
                                ZStack {
                                    Color.clear
                                    if let instigate = viewModel.currentInstigate {
                                        VStack(spacing: 16) {
                                            Text(instigate.text)
                                                .font(.system(size: 36, weight: .bold, design: .rounded))
                                                .foregroundColor(.white)
                                                .multilineTextAlignment(.center)
                                                .padding(.horizontal, 20)
                                        }
                                    } else {
                                        Text("No topics available")
                                            .font(.system(size: 36, weight: .bold, design: .rounded))
                                            .foregroundColor(.white)
                                            .multilineTextAlignment(.center)
                                            .padding(.horizontal, 20)
                                    }
                                }
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .contentShape(Rectangle())
                            }
                            .buttonStyle(.plain)
                            
                            // Instigate carousel
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
                                                    .frame(width: 200, alignment: .leading)
                                                    .background(
                                                        RoundedRectangle(cornerRadius: 16)
                                                            .fill(instigate.id == viewModel.currentInstigate?.id ? Color.white.opacity(0.3) : Color.white.opacity(0.15))
                                                    )
                                            }
                                        }
                                    }
                                    .padding(.horizontal, 20)
                                }
                                .padding(.bottom, 20)
                            }
                        }
                    }
                    .frame(width: geometry.size.width / 2)
                    
                    // Right Side: Blue - Response Input
                    ZStack {
                        Color(red: 0.3, green: 0.58, blue: 1.0)
                            .ignoresSafeArea()
                        
                        VStack(spacing: 20) {
                            Spacer()
                                .frame(height: 80)
                            
            TextEditor(text: $viewModel.debateText)
                                .font(.system(size: 28, design: .rounded))
                                .foregroundColor(.black)
                                .frame(height: 400)
                .padding(12)
                .background(Color.white)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
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
                                    .foregroundColor(.white.opacity(0.8))
                Spacer()
                            }
                            .padding(.horizontal, 20)
                            
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
                                    Text("Submit Debate")
                                        .font(.system(size: 28, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                    }
                }
                            .padding(.vertical, 16)
                .frame(maxWidth: .infinity)
                            .background(Color.blue.opacity(0.8))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(color: .black.opacity(0.25), radius: 8, x: 0, y: 6)
                .disabled(viewModel.isSubmitting || viewModel.currentInstigate == nil)
                            .padding(.horizontal, 20)
                            
                                Spacer()
                        }
                        .padding(.horizontal, 20)
                    }
                    .frame(width: geometry.size.width / 2)
                }
            }
        }
        .ignoresSafeArea()
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

}

struct DebateView_Previews: PreviewProvider {
    static var previews: some View {
        DebateView()
            .environmentObject(AppState())
    }
}
