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

    @discardableResult
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
