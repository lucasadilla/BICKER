import Foundation

struct Instigate: Identifiable, Codable, Hashable {
    let id: String
    let text: String
    let createdBy: String?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case text
        case createdBy
        case createdAt
        case updatedAt
    }
}

extension Array where Element == Instigate {
    func shuffledPreservingFirst() -> [Instigate] {
        guard count > 1 else { return self }
        let first = self[0]
        let rest = Array(self.dropFirst()).shuffled()
        return [first] + rest
    }
}
