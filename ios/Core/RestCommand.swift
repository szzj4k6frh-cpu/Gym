import Foundation

public enum RestCommand: Equatable {
    case start(deadline: Date, duration: TimeInterval)
    case stop

    private struct Message: Decodable {
        let action: String
        let deadlineMs: Double?
        let durationSeconds: Double?
    }
    public enum ValidationError: Error { case invalidMessage }

    public static func decode(_ data: Data, now: Date) throws -> RestCommand {
        guard data.count <= 4096 else { throw ValidationError.invalidMessage }
        let message = try JSONDecoder().decode(Message.self, from: data)
        if message.action == "stop" { return .stop }
        guard message.action == "start", let milliseconds = message.deadlineMs,
              let duration = message.durationSeconds, milliseconds.isFinite,
              duration == 120 || duration == 180 else { throw ValidationError.invalidMessage }
        let snapshot = RestSnapshot(deadline: Date(timeIntervalSince1970: milliseconds / 1000), duration: duration)
        guard snapshot.isValid(at: now) else { throw ValidationError.invalidMessage }
        return .start(deadline: snapshot.deadline, duration: duration)
    }
}
