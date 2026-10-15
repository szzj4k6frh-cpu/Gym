import ActivityKit
import SwiftUI
import WidgetKit

@main
struct GymActivity: Widget {
    private let accent = Color(red: 198.0/255, green: 245.0/255, blue: 132.0/255)
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RestActivityAttributes.self) { context in
            VStack(alignment: .leading, spacing: 10) {
                Label("Satzpause", systemImage: "timer").font(.headline)
                countdown(context).font(.system(size: 36, weight: .semibold, design: .rounded))
            }
            .foregroundStyle(accent)
            .padding(20)
            .activityBackgroundTint(Color(red: 16.0/255, green: 24.0/255, blue: 19.0/255))
            .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.center) {
                    Label("Satzpause", systemImage: "timer").font(.headline)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    countdown(context).font(.system(size: 30, weight: .semibold, design: .rounded)).foregroundStyle(accent)
                }
            } compactLeading: {
                Image(systemName: "timer").foregroundStyle(accent)
            } compactTrailing: {
                countdown(context).font(.caption).foregroundStyle(accent).frame(maxWidth: 54)
            } minimal: {
                Image(systemName: "timer").foregroundStyle(accent)
            }
            .keylineTint(accent)
        }
    }
    @ViewBuilder
    private func countdown(_ context: ActivityViewContext<RestActivityAttributes>) -> some View {
        if context.isStale {
            Text("Beendet")
        } else {
            Text(timerInterval: context.state.startDate...context.state.endDate, countsDown: true, showsHours: false)
                .monospacedDigit()
        }
    }
}
