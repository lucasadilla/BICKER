import SwiftUI

struct InstigateView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var viewModel: InstigateViewModel

    init() {
        let placeholderService = APIService(configuration: AppConfiguration())
        _viewModel = StateObject(wrappedValue: InstigateViewModel(api: placeholderService))
    }

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Top: Input Section (50%)
                ZStack {
                    Color(red: 0.93, green: 0.26, blue: 0.26)
                        .ignoresSafeArea()
                    
                    VStack(spacing: 20) {
                        Text("Instigate")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                            .padding(.top, 60)
                        
                        ZStack(alignment: .topLeading) {
                            TextEditor(text: $viewModel.text)
                                .font(.system(size: 24, design: .rounded))
                                .foregroundColor(.black)
                                .padding(12)
                                .background(Color.white)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .onChange(of: viewModel.text) { oldValue, newValue in
                                    if newValue.count > 200 {
                                        Task { @MainActor in
                                            viewModel.text = String(newValue.prefix(200))
                                        }
                                    }
                                }
                            
                            if viewModel.text.isEmpty {
                                Text("Write your opinion here (max 200 characters)")
                                    .font(.system(size: 24, design: .rounded))
                                    .foregroundColor(.gray.opacity(0.5))
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 20)
                                    .allowsHitTesting(false)
                            }
                        }
                        .frame(height: 300)
                        .padding(.horizontal, 20)
                        
                        HStack {
                            Text("\(viewModel.text.count)/200")
                                .font(.system(.caption, design: .rounded))
                                .foregroundColor(.white.opacity(0.8))
                            Spacer()
                        }
                        .padding(.horizontal, 20)
                        
                        Button(action: submit) {
                            if viewModel.isSubmitting {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text("Submit Topic")
                                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .padding(.vertical, 16)
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .shadow(color: .black.opacity(0.25), radius: 8, x: 0, y: 6)
                        .disabled(viewModel.isSubmitting)
                        .padding(.horizontal, 20)
                        
                        Spacer()
                    }
                }
                .frame(height: geometry.size.height / 2)
                
                // Bottom: Debates Split View (50%)
                if let currentDebate = viewModel.currentDebate {
                    HStack(spacing: 0) {
                        // Left: Red - Instigate
                        ZStack {
                            Color(red: 1.0, green: 0.3, blue: 0.3)
                                .ignoresSafeArea()
                            
                            VStack(spacing: 20) {
                                Text(currentDebate.instigateText)
                                    .font(.system(size: 28, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                                    .padding(.top, 40)
                                
                                Spacer()
                            }
                        }
                        .frame(width: geometry.size.width / 2)
                        
                        // Right: Blue - Debate
                        ZStack {
                            Color(red: 0.3, green: 0.58, blue: 1.0)
                                .ignoresSafeArea()
                            
                            VStack(spacing: 20) {
                                Text(currentDebate.debateText)
                                    .font(.system(size: 28, weight: .bold, design: .rounded))
                                    .foregroundColor(.white)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                                    .padding(.top, 40)
                                
                                Spacer()
                            }
                        }
                        .frame(width: geometry.size.width / 2)
                    }
                    .frame(height: geometry.size.height / 2)
                } else {
                    ZStack {
                        Color(red: 0.3, green: 0.58, blue: 1.0)
                            .ignoresSafeArea()
                        
                        VStack {
                            Text("No debates yet")
                                .font(.system(size: 24, weight: .semibold, design: .rounded))
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                    .frame(height: geometry.size.height / 2)
                }
            }
        }
        .ignoresSafeArea()
        .task {
            viewModel.updateAPI(appState.apiService)
            await viewModel.loadInstigates()
            await viewModel.loadRecentDebate()
        }
        .alert(item: $viewModel.error) { error in
            Alert(
                title: Text("Something went wrong"),
                message: Text(error.message),
                dismissButton: .default(Text("OK"))
            )
        }
    }

    private func submit() {
        Task {
            await viewModel.submitInstigate()
            await viewModel.loadRecentDebate()
        }
    }
}

struct InstigateView_Previews: PreviewProvider {
    static var previews: some View {
        InstigateView()
            .environmentObject(AppState())
    }
}
