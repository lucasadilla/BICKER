import Foundation

struct StatsDebate: Identifiable, Codable, Hashable {
    let id: String
    let instigateText: String?
    let debateText: String?
    let votesRed: Int?
    let votesBlue: Int?
    let reactionCounts: Reactions?
    let reactionTotals: ReactionTotals?
    let totalReactions: Int?
    let createdAt: Date?
    let updatedAt: Date?
    
    struct Reactions: Codable, Hashable {
        let red: [String: Int]
        let blue: [String: Int]
    }
    
    struct ReactionTotals: Codable, Hashable {
        let red: Int
        let blue: Int
    }
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case instigateText
        case debateText
        case votesRed
        case votesBlue
        case reactionCounts
        case reactionTotals
        case totalReactions
        case createdAt
        case updatedAt
    }
}

struct StatsResponse: Codable {
    let debates: [StatsDebate]
    let totalDebates: Int?
    let totalVotes: Int?
    let totalReactions: Int?
}

struct TopPlayersResponse: Codable {
    let highestWinRate: [PlayerStat]
    let mostVotes: [PlayerStat]
    let mostDebates: [PlayerStat]
    let lowestWinRate: [PlayerStat]
}

struct PlayerStat: Codable, Hashable {
    let username: String
    let winRate: Double?
    let votes: Int?
    let debates: Int?
}

struct UserDebatesResponse: Codable {
    let debates: [UserDebate]
    let totalDebates: Int
    let wins: Int
    let winRate: Int?
    let instigateCount: Int?
    let points: Int
    let streak: Int
    let badges: [String]
}

struct UserDebate: Identifiable, Codable, Hashable {
    let id: String
    let instigateText: String?
    let debateText: String?
    let votesRed: Int?
    let votesBlue: Int?
    let userWroteSide: String?
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case instigateText
        case debateText
        case votesRed
        case votesBlue
        case userWroteSide
        case createdAt
        case updatedAt
    }
}

