import SwiftUI

@main
struct GymApp: App {
    @StateObject private var rest = RestCoordinator()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            VStack(spacing: 0) {
                if let notice = rest.permissionNotice {
                    HStack(alignment: .top) {
                        Text(notice).font(.caption)
                        Button("OK") { rest.permissionNotice = nil }
                    }
                    .padding(12)
                    .background(Color(red: 0.25, green: 0.24, blue: 0.13))
                }
                TrainingWebView(rest: rest)
            }
            .background(Color(red: 16/255, green: 24/255, blue: 19/255))
            .preferredColorScheme(.dark)
            .task { rest.restore() }
            .onChange(of: scenePhase) { _, phase in
                if phase == .active { rest.restore() }
            }
        }
    }
}
