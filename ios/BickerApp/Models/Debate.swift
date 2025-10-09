import Foundation

struct Debate: Identifiable, Codable, Hashable {
    let id: String
    let instigateText: String
    let debateText: String
    let createdBy: String
    let instigatedBy: String?
    let createdAt: Date?
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case instigateText
        case debateText
        case createdBy
        case instigatedBy
        case createdAt
        case updatedAt
    }
}

struct DebateResponse: Codable {
    let success: Bool
    let debate: Debate
}
