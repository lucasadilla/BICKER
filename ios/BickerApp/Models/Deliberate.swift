import Foundation

struct Deliberate: Identifiable, Codable, Hashable {
    let id: String
    let instigateText: String
    let debateText: String
    let createdBy: String?
    let instigatedBy: String?
    let votesRed: Int
    let votesBlue: Int
    let reactions: Reactions?
    let myVote: String?
    let myReactions: MyReactions?
    let createdAt: Date?
    let updatedAt: Date?
    
    struct Reactions: Codable, Hashable {
        let red: [String: Int]
        let blue: [String: Int]
    }
    
    struct MyReactions: Codable, Hashable {
        let red: String?
        let blue: String?
    }
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case instigateText
        case debateText
        case createdBy
        case instigatedBy
        case votesRed
        case votesBlue
        case reactions
        case myVote
        case myReactions
        case createdAt
        case updatedAt
    }
}

struct DeliberateResponse: Codable {
    let deliberation: Deliberate
}

