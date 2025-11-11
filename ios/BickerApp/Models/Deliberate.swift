import Foundation

struct Deliberate: Identifiable, Codable, Hashable {
    let id: String
    let instigateText: String?
    let debateText: String?
    let createdBy: String?
    let instigatedBy: String?
    let votesRed: Int?
    let votesBlue: Int?
    let reactions: Reactions?
    let myVote: String?
    let myReactions: MyReactions?
    let createdAt: Date?
    let updatedAt: Date?
    let creator: Creator?
    let instigator: Creator?
    let votedBy: [Vote]?
    
    struct Reactions: Codable, Hashable {
        let red: [String: Int]?
        let blue: [String: Int]?
    }
    
    struct MyReactions: Codable, Hashable {
        let red: String?
        let blue: String?
    }
    
    struct Creator: Codable, Hashable {
        let username: String?
        let profilePicture: String?
    }
    
    struct Vote: Codable, Hashable {
        let vote: String?
        let timestamp: Date?
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
        case creator
        case instigator
        case votedBy
    }
}

struct DeliberateResponse: Codable {
    let deliberation: Deliberate
}

