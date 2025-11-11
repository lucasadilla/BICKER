import Foundation

struct Notification: Identifiable, Codable, Hashable {
    let id: String
    let message: String
    let read: Bool
    let debateId: String?
    let url: String?
    let type: String?
    let createdAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case message
        case read
        case debateId
        case url
        case type
        case createdAt
    }
}

struct NotificationsResponse: Codable {
    let notifications: [Notification]
    let page: Int
    let totalPages: Int
}

