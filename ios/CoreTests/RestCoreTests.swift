import XCTest
@testable import GymRestCore
final class RestCoreTests: XCTestCase {
    let now = Date(timeIntervalSince1970: 1_000)
    func decode(_ json: String) throws -> RestCommand { try RestCommand.decode(Data(json.utf8), now: now) }
    func testStartAndStop() throws {
        XCTAssertEqual(try decode("{\"action\":\"start\",\"deadlineMs\":1120000,\"durationSeconds\":120}"), .start(deadline: now.addingTimeInterval(120), duration: 120))
        XCTAssertEqual(try decode("{\"action\":\"stop\"}"), .stop)
    }
    func testRejectMalformedAndExpiredMessages() {
        for json in ["{}", "{\"action\":\"other\"}", "{\"action\":\"start\",\"deadlineMs\":true,\"durationSeconds\":120}", "{\"action\":\"start\",\"deadlineMs\":\"1120000\",\"durationSeconds\":120}", "{\"action\":\"start\",\"deadlineMs\":990000,\"durationSeconds\":120}", "{\"action\":\"start\",\"deadlineMs\":1190000,\"durationSeconds\":120}", "{\"action\":\"start\",\"deadlineMs\":1120000,\"durationSeconds\":999}"] { XCTAssertThrowsError(try decode(json), json) }
    }
    func testRestoreAndRemainingTime() throws {
        let value = RestSnapshot(deadline: now.addingTimeInterval(120), duration: 120)
        XCTAssertEqual(value.remaining(at: now.addingTimeInterval(75)), 45)
        XCTAssertEqual(value.remaining(at: now.addingTimeInterval(180)), 0)
        XCTAssertFalse(value.isActive(at: now.addingTimeInterval(180)))
        let restored = try JSONDecoder().decode(RestSnapshot.self, from: JSONEncoder().encode(value))
        XCTAssertEqual(restored, value)
        XCTAssertTrue(restored.isValid(at: now))
        XCTAssertFalse(RestSnapshot(deadline: now.addingTimeInterval(999), duration: 120).isValid(at: now))
    }
}
