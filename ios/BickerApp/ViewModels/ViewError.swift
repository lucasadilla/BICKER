import Foundation

struct ViewError: Identifiable, Error {
    let id = UUID()
    let message: String
}
