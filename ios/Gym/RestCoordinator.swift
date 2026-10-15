import ActivityKit
import Foundation
import SwiftUI
import UserNotifications

@MainActor
final class RestCoordinator: ObservableObject {
    @Published var permissionNotice: String?
    private let defaults: UserDefaults
    private let center = UNUserNotificationCenter.current()
    private let notificationDelegate = NotificationDelegate()
    private let stateKey = "gym.native.rest.v1"
    private let notificationPrefix = "gym-rest-end-"
    private var revision = 0
    private var operation: Task<Void, Never>?

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        center.delegate = notificationDelegate
    }

    func handle(_ command: RestCommand) {
        switch command {
        case let .start(deadline, duration):
            let snapshot = RestSnapshot(deadline: deadline, duration: duration)
            guard snapshot.isValid(at: Date()) else { return }
            apply(snapshot, requestPermission: true)
        case .stop:
            apply(nil, requestPermission: false)
        }
    }

    func restore() {
        if let data = defaults.data(forKey: stateKey),
           let snapshot = try? JSONDecoder().decode(RestSnapshot.self, from: data),
           snapshot.isValid(at: Date()) {
            apply(snapshot, requestPermission: false)
        } else {
            apply(nil, requestPermission: false)
        }
    }

    private func apply(_ snapshot: RestSnapshot?, requestPermission: Bool) {
        revision += 1
        let token = revision
        operation?.cancel()
        if let snapshot, let data = try? JSONEncoder().encode(snapshot) {
            defaults.set(data, forKey: stateKey)
        } else {
            defaults.removeObject(forKey: stateKey)
        }
        operation = Task { [weak self] in
            guard let self else { return }
            await self.reconcile(snapshot, token: token, requestPermission: requestPermission)
        }
    }

    private func isCurrent(_ token: Int) -> Bool { !Task.isCancelled && token == revision }

    private func reconcile(_ snapshot: RestSnapshot?, token: Int, requestPermission: Bool) async {
        let pending = await center.pendingNotificationRequests()
        guard isCurrent(token) else { return }
        center.removePendingNotificationRequests(withIdentifiers: pending.map(\.identifier).filter { $0.hasPrefix(notificationPrefix) })
        let delivered = await center.deliveredNotifications()
        guard isCurrent(token) else { return }
        center.removeDeliveredNotifications(withIdentifiers: delivered.map { $0.request.identifier }.filter { $0.hasPrefix(notificationPrefix) })

        var existing: Activity<RestActivityAttributes>?
        for activity in Activity<RestActivityAttributes>.activities {
            if let snapshot, snapshot.isActive(at: Date()), existing == nil,
               activity.activityState == .active,
               abs(activity.content.state.endDate.timeIntervalSince(snapshot.deadline)) < 0.5 {
                existing = activity
            } else {
                await activity.end(nil, dismissalPolicy: .immediate)
                guard isCurrent(token) else { return }
            }
        }
        guard isCurrent(token), let snapshot else { return }
        guard snapshot.isActive(at: Date()) else {
            apply(nil, requestPermission: false)
            return
        }
        var notices: [String] = []
        if ActivityAuthorizationInfo().areActivitiesEnabled {
            if existing == nil {
                do {
                    let content = ActivityContent(state: RestActivityAttributes.ContentState(
                        startDate: snapshot.deadline.addingTimeInterval(-snapshot.duration), endDate: snapshot.deadline), staleDate: snapshot.deadline)
                    _ = try Activity.request(attributes: RestActivityAttributes(), content: content, pushType: nil)
                } catch {
                    notices.append("Die Sperrbildschirm-Anzeige konnte nicht gestartet werden. Prüfe in den iPhone-Einstellungen, ob Live-Aktivitäten für Gym erlaubt sind.")
                }
            }
        } else {
            notices.append("Live-Aktivitäten sind deaktiviert. Die Pause bleibt in der App sichtbar.")
        }

        var settings = await center.notificationSettings()
        guard isCurrent(token) else { return }
        if settings.authorizationStatus == .notDetermined && requestPermission {
            _ = try? await center.requestAuthorization(options: [.alert, .sound])
            guard isCurrent(token) else { return }
            settings = await center.notificationSettings()
            guard isCurrent(token) else { return }
        }
        guard snapshot.isActive(at: Date()) else {
            apply(nil, requestPermission: false)
            return
        }
        let allowed = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional || settings.authorizationStatus == .ephemeral
        if allowed {
            let content = UNMutableNotificationContent()
            content.title = "Satzpause beendet"
            content.body = "Die nächste Übung oder der nächste Satz kann beginnen."
            content.sound = .default
            let identifier = notificationPrefix + UUID().uuidString
            let request = UNNotificationRequest(identifier: identifier, content: content,
                trigger: UNTimeIntervalNotificationTrigger(timeInterval: max(1, snapshot.remaining(at: Date())), repeats: false))
            do {
                try await center.add(request)
                if !isCurrent(token) {
                    center.removePendingNotificationRequests(withIdentifiers: [identifier])
                    center.removeDeliveredNotifications(withIdentifiers: [identifier])
                    return
                }
            } catch {
                guard isCurrent(token) else { return }
                notices.append("Der Hinweis zum Pausenende konnte nicht geplant werden.")
            }
        } else if settings.authorizationStatus == .denied {
            notices.append("Mitteilungen sind deaktiviert. Für einen Hinweis am Pausenende erlaube Gym-Mitteilungen in den iPhone-Einstellungen.")
        }
        guard isCurrent(token) else { return }
        permissionNotice = notices.isEmpty ? nil : notices.joined(separator: " ")
    }
}
