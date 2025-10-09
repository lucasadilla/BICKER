import Foundation

struct AppConfiguration: Equatable {
    var baseURL: URL

    init(baseURL: URL? = nil) {
        if let provided = baseURL {
            self.baseURL = provided
        } else if let string = Bundle.main.object(forInfoDictionaryKey: "BickerAPIBaseURL") as? String,
                  let url = URL(string: string) {
            self.baseURL = url
        } else {
            self.baseURL = URL(string: "http://localhost:3000")!
        }
    }
}
