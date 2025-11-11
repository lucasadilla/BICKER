import Foundation

struct User: Identifiable, Codable, Hashable {
    let id: String
    let email: String
    let username: String?
    let bio: String?
    let profilePicture: String?
    let badges: [String]
    let selectedBadge: String?
    let points: Int?
    let streak: Int?
    let supporters: [String]?
    let supports: [String]?
    let colorScheme: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case email
        case username
        case bio
        case profilePicture
        case badges
        case selectedBadge
        case points
        case streak
        case supporters
        case supports
        case colorScheme
    }
}

struct UserProfile: Codable {
    let user: User
    let debates: [Deliberate]
    let requestedIdentifier: String
}

