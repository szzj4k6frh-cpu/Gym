import Foundation

public struct RestSnapshot: Codable, Equatable {
    public let deadline: Date
    public let duration: TimeInterval
    public init(deadline: Date, duration: TimeInterval) {
        self.deadline = deadline
        self.duration = duration
    }
    public func remaining(at now: Date) -> TimeInterval { max(0, deadline.timeIntervalSince(now)) }
    public func isActive(at now: Date) -> Bool { deadline > now }
    public func isValid(at now: Date) -> Bool {
        (duration == 120 || duration == 180) && deadline.timeIntervalSince1970.isFinite
            && isActive(at: now) && remaining(at: now) <= duration + 5
    }
}
