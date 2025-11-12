import Foundation
import CryptoKit

actor DeliberateVoteStore {
    private let baseKey = "deliberate.voted.ids"
    private let cookieNames = ["__Secure-next-auth.session-token", "next-auth.session-token"]
    private let userDefaults: UserDefaults

    private var storageKey: String
    private var cachedIDs: Set<String>

    init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        self.storageKey = baseKey
        if let stored = userDefaults.array(forKey: baseKey) as? [String] {
            self.cachedIDs = Set(stored)
        } else {
            self.cachedIDs = []
        }
    }

    func updateUserIdentifier(baseURL: URL) {
        let identifier = resolveUserIdentifier(for: baseURL)
        let newKey = identifier.map { "\(baseKey).\($0)" } ?? baseKey

        guard newKey != storageKey else { return }

        storageKey = newKey
        if let stored = userDefaults.array(forKey: storageKey) as? [String] {
            cachedIDs = Set(stored)
        } else {
            cachedIDs.removeAll(keepingCapacity: false)
        }
    }

    func hasVoted(id: String) -> Bool {
        cachedIDs.contains(id)
    }

    func markVoted(id: String) {
        guard !id.isEmpty else { return }
        let (inserted, _) = cachedIDs.insert(id)
        if inserted {
            persist()
        }
    }

    func filterUnvotedDebates(_ debates: [Deliberate]) -> [Deliberate] {
        guard !debates.isEmpty else { return [] }

        var needsSave = false
        let filtered = debates.filter { debate in
            if let myVote = debate.myVote, !myVote.isEmpty {
                let (inserted, _) = cachedIDs.insert(debate.id)
                needsSave = needsSave || inserted
                return false
            }

            return !cachedIDs.contains(debate.id)
        }

        if needsSave {
            persist()
        }

        return filtered
    }

    private func persist() {
        userDefaults.set(Array(cachedIDs), forKey: storageKey)
    }

    private func resolveUserIdentifier(for baseURL: URL) -> String? {
        let cookies = HTTPCookieStorage.shared.cookies ?? []
        let host = baseURL.host?.lowercased()

        guard let tokenCookie = cookies.first(where: { cookie in
            cookieNames.contains(cookie.name) && matchesHost(cookie: cookie, host: host)
        }) else {
            return nil
        }

        let tokenValue = tokenCookie.value
        guard !tokenValue.isEmpty else { return nil }

        return [host ?? "unknown", hash(tokenValue)].joined(separator: ":")
    }

    private func matchesHost(cookie: HTTPCookie, host: String?) -> Bool {
        guard let host else { return true }
        let domain = cookie.domain.lowercased()
        if domain.hasPrefix(".") {
            let trimmed = String(domain.dropFirst())
            return host == trimmed || host.hasSuffix("." + trimmed)
        }
        return host == domain || host.hasSuffix("." + domain)
    }

    private func hash(_ value: String) -> String {
        let digest = SHA256.hash(data: Data(value.utf8))
        return digest.map { String(format: "%02x", $0) }.joined()
    }
}
