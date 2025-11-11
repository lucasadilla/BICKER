import Foundation

struct APIService {
    var configuration: AppConfiguration
    var session: URLSession = .shared

    init(configuration: AppConfiguration, session: URLSession = .shared) {
        self.configuration = configuration
        self.session = session
    }

    private var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }

    private func url(for path: String, queryItems: [URLQueryItem] = []) throws -> URL {
        guard var components = URLComponents(url: configuration.baseURL, resolvingAgainstBaseURL: false) else {
            throw APIError.invalidURL
        }
        components.path = path.hasPrefix("/") ? path : "/" + path
        if !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        guard let url = components.url else { throw APIError.invalidURL }
        return url
    }

    private func request(for path: String, method: HTTPMethod, body: Data? = nil, queryItems: [URLQueryItem] = []) throws -> URLRequest {
        var request = URLRequest(url: try url(for: path, queryItems: queryItems))
        request.httpMethod = method.rawValue
        if let body = body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        return request
    }

    private func send<T: Decodable>(_ type: T.Type, request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if !(200...299).contains(httpResponse.statusCode) {
            if let error = try? decoder.decode(ServerErrorResponse.self, from: data) {
                throw APIError.serverError(error.error)
            } else {
                throw APIError.serverError("Request failed with status code \(httpResponse.statusCode)")
            }
        }

        return try decoder.decode(T.self, from: data)
    }

    private func send(request: URLRequest) async throws {
        let (_, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
    }
}

extension APIService {
    func fetchBanner() async throws -> URL? {
        let request = try request(for: "/api/banner", method: .get)
        let response = try await send(BannerResponse.self, request: request)
        guard !response.imageUrl.isEmpty else { return nil }
        return URL(string: response.imageUrl)
    }

    func fetchInstigates(searchTerm: String? = nil) async throws -> [Instigate] {
        var items: [URLQueryItem] = []
        if let term = searchTerm, !term.isEmpty {
            items.append(URLQueryItem(name: "search", value: term))
        }
        let request = try request(for: "/api/instigate", method: .get, queryItems: items)
        return try await send([Instigate].self, request: request)
    }

    func submitInstigate(text: String) async throws -> Instigate {
        let payload = try JSONEncoder().encode(["text": text])
        let request = try request(for: "/api/instigate", method: .post, body: payload)
        return try await send(Instigate.self, request: request)
    }

    func fetchDebates() async throws -> [Debate] {
        let request = try request(for: "/api/debate", method: .get)
        return try await send([Debate].self, request: request)
    }

    @discardableResult
    func submitDebate(instigateId: String, text: String) async throws -> Debate {
        let payload = try JSONEncoder().encode([
            "instigateId": instigateId,
            "debateText": text
        ])
        let request = try request(for: "/api/debate", method: .post, body: payload)
        let response = try await send(DebateResponse.self, request: request)
        return response.debate
    }
    
    func fetchDeliberates() async throws -> [Deliberate] {
        let request = try request(for: "/api/deliberate", method: .get)
        return try await send([Deliberate].self, request: request)
    }
    
    func fetchDeliberate(id: String) async throws -> Deliberate {
        let request = try request(for: "/api/deliberate/\(id)", method: .get)
        let response = try await send(DeliberateResponse.self, request: request)
        return response.deliberation
    }
    
    func voteOnDeliberate(id: String, side: String) async throws -> Deliberate {
        let payload = try JSONEncoder().encode(["side": side])
        let request = try request(for: "/api/deliberate/\(id)", method: .post, body: payload)
        let response = try await send(DeliberateResponse.self, request: request)
        return response.deliberation
    }
    
    func reactToDeliberate(id: String, side: String, emoji: String) async throws -> Deliberate {
        let payload = try JSONEncoder().encode([
            "side": side,
            "emoji": emoji
        ])
        let request = try request(for: "/api/deliberate/\(id)", method: .post, body: payload)
        let response = try await send(DeliberateResponse.self, request: request)
        return response.deliberation
    }
    
    func fetchStats(sort: String = "newest") async throws -> StatsResponse {
        let items = [URLQueryItem(name: "sort", value: sort)]
        let request = try request(for: "/api/stats", method: .get, queryItems: items)
        return try await send(StatsResponse.self, request: request)
    }
    
    func fetchTopPlayers() async throws -> TopPlayersResponse {
        let request = try request(for: "/api/topplayers", method: .get)
        return try await send(TopPlayersResponse.self, request: request)
    }
    
    func fetchUserDebates(sort: String = "newest", page: Int = 1) async throws -> UserDebatesResponse {
        let items = [
            URLQueryItem(name: "sort", value: sort),
            URLQueryItem(name: "page", value: String(page)),
            URLQueryItem(name: "limit", value: "25")
        ]
        let request = try request(for: "/api/user/debates", method: .get, queryItems: items)
        return try await send(UserDebatesResponse.self, request: request)
    }
    
    func fetchProfile() async throws -> User {
        let request = try request(for: "/api/profile", method: .get)
        return try await send(User.self, request: request)
    }
    
    func updateProfile(username: String?, bio: String?, profilePicture: String?, selectedBadge: String?, colorScheme: String?) async throws -> User {
        var payloadDict: [String: Any] = [:]
        if let username = username { payloadDict["username"] = username }
        if let bio = bio { payloadDict["bio"] = bio }
        if let profilePicture = profilePicture { payloadDict["profilePicture"] = profilePicture }
        if let selectedBadge = selectedBadge { payloadDict["selectedBadge"] = selectedBadge }
        if let colorScheme = colorScheme { payloadDict["colorScheme"] = colorScheme }
        let payload = try JSONSerialization.data(withJSONObject: payloadDict)
        let request = try request(for: "/api/profile", method: .post, body: payload)
        return try await send(User.self, request: request)
    }
    
    func fetchNotifications(page: Int = 1) async throws -> NotificationsResponse {
        let items = [URLQueryItem(name: "page", value: String(page))]
        let request = try request(for: "/api/notifications", method: .get, queryItems: items)
        let response = try await send([Notification].self, request: request)
        // Note: The API doesn't return pagination info, so we'll handle it client-side
        return NotificationsResponse(notifications: response, page: page, totalPages: 1)
    }
    
    func markNotificationsRead(ids: [String]) async throws {
        let payload = try JSONEncoder().encode(["ids": ids])
        let request = try request(for: "/api/notifications", method: .post, body: payload)
        try await send(request: request)
    }
    
    func fetchUserProfile(username: String) async throws -> UserProfile {
        let encodedUsername = username.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? username
        let request = try request(for: "/api/user/\(encodedUsername)", method: .get)
        return try await send(UserProfile.self, request: request)
    }
    
    func toggleSupport(identifier: String) async throws -> [String: Any] {
        let payload = try JSONEncoder().encode(["identifier": identifier])
        let request = try request(for: "/api/user/supports", method: .post, body: payload)
        let data = try await session.data(for: request).0
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw APIError.invalidResponse
        }
        return json
    }
}

extension APIService {
    enum HTTPMethod: String {
        case get = "GET"
        case post = "POST"
        case delete = "DELETE"
    }

    struct ServerErrorResponse: Decodable {
        let error: String
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Unable to create URL for request."
        case .invalidResponse:
            return "The server returned an invalid response."
        case .serverError(let message):
            return message
        }
    }
}
