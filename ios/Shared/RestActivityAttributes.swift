import ActivityKit
import Foundation

struct RestActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        let startDate: Date
        let endDate: Date
    }
}
