import { SwiftSourceFile } from '../types/clock';

export const SWIFT_FILES: SwiftSourceFile[] = [
  {
    id: 'clock-app',
    name: 'ClockApp.swift',
    path: 'Sources/SwiftClock/ClockApp.swift',
    category: 'App & Architecture',
    description: 'Main SwiftUI App entry point with tab navigation, modern window style, and persistent state.',
    code: `import SwiftUI

/// SwiftClock Studio - The Modern iOS & macOS Clock Application
/// Built with Swift 6 and SwiftUI.
@main
struct ClockApp: App {
    @State private var selectedTab: ClockTab = .world
    @State private var alarmManager = AlarmManager()
    @State private var stopwatchEngine = StopwatchEngine()
    @State private var timerEngine = RadialTimerEngine()

    var body: some Scene {
        WindowGroup {
            TabView(selection: $selectedTab) {
                WorldClockView()
                    .tabItem {
                        Label("World Clock", systemImage: "globe")
                    }
                    .tag(ClockTab.world)

                AlarmListView(alarmManager: alarmManager)
                    .tabItem {
                        Label("Alarm", systemImage: "alarm.fill")
                    }
                    .tag(ClockTab.alarm)

                StopwatchView(engine: stopwatchEngine)
                    .tabItem {
                        Label("Stopwatch", systemImage: "stopwatch.fill")
                    }
                    .tag(ClockTab.stopwatch)

                TimerView(engine: timerEngine)
                    .tabItem {
                        Label("Timer", systemImage: "timer")
                    }
                    .tag(ClockTab.timer)
            }
            .tint(Color.orange)
            .preferredColorScheme(.dark)
        }
    }
}

enum ClockTab: Hashable, Sendable {
    case world
    case alarm
    case stopwatch
    case timer
}
`
  },
  {
    id: 'world-clock',
    name: 'WorldClockView.swift',
    path: 'Sources/SwiftClock/Views/WorldClockView.swift',
    category: 'Views',
    description: 'SwiftUI World Clock view displaying worldwide timezones, offset calculations, and mini analog clocks.',
    code: `import SwiftUI

public struct WorldClockView: View {
    @State private var cities: [CityTimeZone] = CityTimeZone.defaultCities
    @State private var isAddingCity = false

    public var body: some View {
        NavigationStack {
            List {
                ForEach(cities) { city in
                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(city.timeDifferenceDescription)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(city.name)
                                .font(.title3.weight(.medium))
                                .foregroundStyle(.primary)
                        }

                        Spacer()

                        // Mini analog face representation
                        MiniAnalogClock(timeZone: city.timeZone)
                            .frame(width: 50, height: 50)

                        // Digital time readout
                        TimelineView(.periodic(from: .now, by: 1.0)) { context in
                            Text(city.formattedTime(at: context.date))
                                .font(.system(.title2, design: .rounded, weight: .regular))
                                .monospacedDigit()
                        }
                    }
                    .padding(.vertical, 6)
                }
                .onDelete { indices in
                    cities.remove(atOffsets: indices)
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("World Clock")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isAddingCity = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundStyle(.orange)
                    }
                }
                ToolbarItem(placement: .topBarLeading) {
                    EditButton()
                        .foregroundStyle(.orange)
                }
            }
            .sheet(isPresented: $isAddingCity) {
                CityPickerSheet { newCity in
                    cities.append(newCity)
                }
            }
        }
    }
}

public struct CityTimeZone: Identifiable, Sendable {
    public let id = UUID()
    public let name: String
    public let country: String
    public let timeZone: TimeZone

    public var timeDifferenceDescription: String {
        let localOffset = TimeZone.current.secondsFromGMT()
        let targetOffset = timeZone.secondsFromGMT()
        let diffHours = (targetOffset - localOffset) / 3600
        if diffHours == 0 {
            return "Today, Same time"
        } else if diffHours > 0 {
            return "Today, +\\(diffHours)HRS"
        } else {
            return "Today, \\(diffHours)HRS"
        }
    }

    public func formattedTime(at date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeZone = timeZone
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }

    public static let defaultCities: [CityTimeZone] = [
        CityTimeZone(name: "Cupertino", country: "USA", timeZone: TimeZone(identifier: "America/Los_Angeles")!),
        CityTimeZone(name: "London", country: "UK", timeZone: TimeZone(identifier: "Europe/London")!),
        CityTimeZone(name: "Tokyo", country: "Japan", timeZone: TimeZone(identifier: "Asia/Tokyo")!),
        CityTimeZone(name: "New York", country: "USA", timeZone: TimeZone(identifier: "America/New_York")!)
    ]
}
`
  },
  {
    id: 'alarm-manager',
    name: 'AlarmManager.swift',
    path: 'Sources/SwiftClock/Models/AlarmManager.swift',
    category: 'Engines & Logic',
    description: 'Observable alarm manager scheduling notifications via UserNotifications with snooze support.',
    code: `import Foundation
import Observation
import UserNotifications

@Observable
public final class AlarmManager {
    public var alarms: [AlarmItem] = []

    public init() {
        self.alarms = [
            AlarmItem(time: DateComponents(hour: 6, minute: 30), label: "Morning Workout", isEnabled: true, repeatDays: [.monday, .wednesday, .friday]),
            AlarmItem(time: DateComponents(hour: 7, minute: 15), label: "Work Wakeup", isEnabled: true, repeatDays: [.monday, .tuesday, .wednesday, .thursday, .friday]),
            AlarmItem(time: DateComponents(hour: 9, minute: 0), label: "Weekend Brunch", isEnabled: false, repeatDays: [.saturday, .sunday])
        ]
        requestNotificationPermission()
    }

    public func toggleAlarm(id: UUID) {
        guard let index = alarms.firstIndex(where: { $0.id == id }) else { return }
        alarms[index].isEnabled.toggle()
        if alarms[index].isEnabled {
            scheduleAlarmNotification(for: alarms[index])
        } else {
            cancelAlarmNotification(for: alarms[index])
        }
    }

    public func addAlarm(_ alarm: AlarmItem) {
        alarms.append(alarm)
        if alarm.isEnabled {
            scheduleAlarmNotification(for: alarm)
        }
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Notification permission granted")
            }
        }
    }

    private func scheduleAlarmNotification(for alarm: AlarmItem) {
        let content = UNMutableNotificationContent()
        content.title = "Alarm"
        content.body = alarm.label.isEmpty ? "Wake up!" : alarm.label
        content.sound = .defaultCritical

        var dateComponents = DateComponents()
        dateComponents.hour = alarm.time.hour
        dateComponents.minute = alarm.time.minute

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: !alarm.repeatDays.isEmpty)
        let request = UNNotificationRequest(identifier: alarm.id.uuidString, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request)
    }

    private func cancelAlarmNotification(for alarm: AlarmItem) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [alarm.id.uuidString])
    }
}

public struct AlarmItem: Identifiable, Codable, Sendable {
    public var id = UUID()
    public var time: DateComponents
    public var label: String
    public var isEnabled: boolean = true
    public var repeatDays: Set<Weekday>
    public var sound: String = "Radar"
    public var allowsSnooze: boolean = true

    public enum Weekday: Int, Codable, CaseIterable, Sendable {
        case sunday = 1, monday, tuesday, wednesday, thursday, friday, saturday
    }
}
`
  },
  {
    id: 'stopwatch-engine',
    name: 'StopwatchEngine.swift',
    path: 'Sources/SwiftClock/Models/StopwatchEngine.swift',
    category: 'Engines & Logic',
    description: 'High-precision stopwatch engine using Swift 6 ContinuousClock with lap splits and stats.',
    code: `import Foundation
import Observation

@Observable
public final class StopwatchEngine {
    public var state: StopwatchState = .idle
    public var elapsedTime: Duration = .zero
    public var laps: [LapRecord] = []

    private var clock = ContinuousClock()
    private var startInstant: ContinuousClock.Instant?
    private var accumulatedDuration: Duration = .zero
    private var lastLapDuration: Duration = .zero
    private var timerTask: Task<Void, Never>?

    public enum StopwatchState: Sendable {
        case idle
        case running
        case paused
    }

    public func start() {
        guard state != .running else { return }
        state = .running
        startInstant = clock.now

        timerTask = Task { @MainActor [weak self] in
            guard let self else { return }
            while !Task.isCancelled && self.state == .running {
                try? await Task.sleep(for: .milliseconds(16)) // ~60fps refresh
                guard let start = self.startInstant else { break }
                let current = self.clock.now
                self.elapsedTime = self.accumulatedDuration + (current - start)
            }
        }
    }

    public func stop() {
        guard state == .running else { return }
        state = .paused
        timerTask?.cancel()
        timerTask = nil
        if let start = startInstant {
            accumulatedDuration += clock.now - start
            elapsedTime = accumulatedDuration
        }
    }

    public func reset() {
        stop()
        state = .idle
        elapsedTime = .zero
        accumulatedDuration = .zero
        lastLapDuration = .zero
        laps.removeAll()
    }

    public func lap() {
        guard state == .running else { return }
        let currentLapTime = elapsedTime - lastLapDuration
        lastLapDuration = elapsedTime

        let newLap = LapRecord(
            lapNumber: laps.count + 1,
            lapDuration: currentLapTime,
            totalDuration: elapsedTime
        )
        laps.insert(newLap, at: 0)
    }
}

public struct LapRecord: Identifiable, Sendable {
    public let id = UUID()
    public let lapNumber: Int
    public let lapDuration: Duration
    public let totalDuration: Duration
}
`
  },
  {
    id: 'radial-timer',
    name: 'RadialTimerView.swift',
    path: 'Sources/SwiftClock/Views/RadialTimerView.swift',
    category: 'Views',
    description: 'Circular radial countdown timer with animated progress arc, time picker, and completion chime.',
    code: `import SwiftUI

public struct RadialTimerView: View {
    @Bindable var engine: RadialTimerEngine

    public var body: some View {
        VStack(spacing: 36) {
            ZStack {
                // Background Track
                Circle()
                    .stroke(Color(.systemGray6), lineWidth: 14)

                // Animated Progress Ring
                Circle()
                    .trim(from: 0, to: engine.progress)
                    .stroke(
                        Color.orange,
                        style: StrokeStyle(lineWidth: 14, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 0.1), value: engine.progress)

                // Countdown Text Readout
                VStack(spacing: 8) {
                    Text(engine.formattedRemainingTime)
                        .font(.system(size: 64, weight: .thin, design: .rounded))
                        .monospacedDigit()

                    if engine.isRunning {
                        Label(engine.finishTimeText, systemImage: "bell.fill")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .frame(width: 280, height: 280)
            .padding(.top, 40)

            // Control Buttons (Cancel / Pause / Start)
            HStack(spacing: 80) {
                Button(action: engine.cancel) {
                    Text("Cancel")
                        .font(.callout.weight(.medium))
                        .frame(width: 80, height: 80)
                        .background(Color(.systemGray5))
                        .foregroundStyle(.primary)
                        .clipShape(Circle())
                }

                Button(action: engine.toggleStartPause) {
                    Text(engine.isRunning ? "Pause" : "Start")
                        .font(.callout.weight(.medium))
                        .frame(width: 80, height: 80)
                        .background(engine.isRunning ? Color.orange.opacity(0.2) : Color.green.opacity(0.2))
                        .foregroundStyle(engine.isRunning ? Color.orange : Color.green)
                        .clipShape(Circle())
                }
            }
        }
        .padding()
    }
}
`
  },
  {
    id: 'analog-face',
    name: 'AnalogClockFace.swift',
    path: 'Sources/SwiftClock/Views/AnalogClockFace.swift',
    category: 'Views',
    description: 'SwiftUI vector Canvas clock face rendering ticks, numerals, hour/minute hands, and smooth orange second hand.',
    code: `import SwiftUI

public struct AnalogClockFace: View {
    public var date: Date
    public var showSeconds: Bool = true
    public var style: FaceStyle = .cupertino

    public enum FaceStyle: Sendable {
        case cupertino, california, chronograph, minimal
    }

    public var body: some View {
        Canvas { context, size in
            let center = CGPoint(x: size.width / 2, y: size.height / 2)
            let radius = min(size.width, size.height) / 2

            // Draw outer dial background
            let dialRect = CGRect(origin: .zero, size: size)
            context.fill(Path(ellipseIn: dialRect), with: .color(Color(.systemBackground)))

            // Draw 60 Tick Marks
            for tick in 0..<60 {
                let angle = Angle.degrees(Double(tick) * 6)
                let isMajor = tick % 5 == 0
                let tickLength = isMajor ? radius * 0.12 : radius * 0.05
                let strokeWidth = isMajor ? 3.0 : 1.0
                let strokeColor = isMajor ? Color.primary : Color.secondary.opacity(0.4)

                var path = Path()
                let outerPoint = pointOnCircle(center: center, radius: radius * 0.95, angle: angle)
                let innerPoint = pointOnCircle(center: center, radius: radius * 0.95 - tickLength, angle: angle)
                path.move(to: outerPoint)
                path.addLine(to: innerPoint)

                context.stroke(path, with: .color(strokeColor), lineWidth: strokeWidth)
            }

            let calendar = Calendar.current
            let hour = Double(calendar.component(.hour, from: date) % 12)
            let minute = Double(calendar.component(.minute, from: date))
            let second = Double(calendar.component(.second, from: date)) + (date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: 1))

            // Hour Hand
            let hourAngle = Angle.degrees((hour + minute / 60.0) * 30.0 - 90.0)
            drawHand(context: context, center: center, length: radius * 0.52, width: 6.0, angle: hourAngle, color: .primary)

            // Minute Hand
            let minuteAngle = Angle.degrees((minute + second / 60.0) * 6.0 - 90.0)
            drawHand(context: context, center: center, length: radius * 0.78, width: 4.0, angle: minuteAngle, color: .primary)

            // Second Hand (Apple Orange with counterweight)
            if showSeconds {
                let secondAngle = Angle.degrees(second * 6.0 - 90.0)
                drawHand(context: context, center: center, length: radius * 0.88, width: 1.8, angle: secondAngle, color: .orange)

                // Central Pin
                let pinPath = Path(ellipseIn: CGRect(x: center.x - 4, y: center.y - 4, width: 8, height: 8))
                context.fill(pinPath, with: .color(.orange))
            }
        }
    }

    private func pointOnCircle(center: CGPoint, radius: Double, angle: Angle) -> CGPoint {
        CGPoint(
            x: center.x + radius * cos(angle.radians - .pi / 2),
            y: center.y + radius * sin(angle.radians - .pi / 2)
        )
    }

    private func drawHand(context: GraphicsContext, center: CGPoint, length: Double, width: Double, angle: Angle, color: Color) {
        var path = Path()
        let endX = center.x + length * cos(angle.radians)
        let endY = center.y + length * sin(angle.radians)
        path.move(to: center)
        path.addLine(to: CGPoint(x: endX, y: endY))
        context.stroke(path, with: .color(color), style: StrokeStyle(lineWidth: width, lineCap: .round))
    }
}
`
  },
  {
    id: 'swift-cloc-cli',
    name: 'SwiftCLOC.swift',
    path: 'Sources/SwiftCLOC/SwiftCLOC.swift',
    category: 'CLI Tool',
    description: 'Authentic Swift CLI implementation of CLOC (Count Lines of Code) with regex parsing, docstrings, and ANSI formatting.',
    code: `import Foundation
import ArgumentParser

/// SwiftCLOC - Command Line Tool to Count Lines of Code in Swift Projects
/// Analyzes blank lines, comments (single-line & nested blocks), docstrings, and code declarations.
@main
struct SwiftCLOC: AsyncParsableCommand {
    static let configuration = CommandConfiguration(
        commandName: "swift-cloc",
        abstract: "Count physical lines of Swift source code, comments, and declarations.",
        version: "1.0.0"
    )

    @Argument(help: "Root path of Swift project or source files to analyze.")
    var targetPath: String = "."

    @Flag(name: .shortAndLong, help: "Display detailed file-by-file breakdown.")
    var byFile: Bool = false

    @Flag(name: .long, help: "Output results as formatted JSON.")
    var json: Bool = false

    mutating func run() async throws {
        let analyzer = SwiftCodeAnalyzer()
        let results = try await analyzer.analyzeDirectory(at: URL(fileURLWithPath: targetPath))

        if json {
            let data = try JSONEncoder().encode(results)
            print(String(decoding: data, as: UTF8.self))
        } else {
            printAnsiTable(results: results, showFiles: byFile)
        }
    }

    private func printAnsiTable(results: ClocReport, showFiles: Bool) {
        print("\\u{001B}[1;36m--------------------------------------------------------------------------------\\u{001B}[0m")
        print("\\u{001B}[1;37m Language              Files       Blank     Comment        Code       Total\\u{001B}[0m")
        print("\\u{001B}[1;36m--------------------------------------------------------------------------------\\u{001B}[0m")
        print(String(format: " Swift               %7d   %9d   %9d   %9d   %9d",
                     results.fileCount, results.totalBlank, results.totalComment, results.totalCode, results.totalLines))
        print("\\u{001B}[1;36m--------------------------------------------------------------------------------\\u{001B}[0m")
        print(String(format: " SUM:                %7d   %9d   %9d   %9d   %9d",
                     results.fileCount, results.totalBlank, results.totalComment, results.totalCode, results.totalLines))
        print("\\u{001B}[1;36m--------------------------------------------------------------------------------\\u{001B}[0m")
        print("Comment Density: \\(String(format: "%.1f", results.commentRatio * 100))%")
        print("Constructs: Structs: \\(results.totalStructs), Classes: \\(results.totalClasses), Actors: \\(results.totalActors), Protocols: \\(results.totalProtocols)")
    }
}

/// Tokenizer that parses Swift source files, taking into account nested /* /* */ */ blocks.
public final class SwiftCodeAnalyzer {
    public init() {}

    public func analyzeFile(content: String, path: String) -> FileMetric {
        let lines = content.components(separatedBy: "\\n")
        var blank = 0
        var comment = 0
        var docComment = 0
        var code = 0
        var inBlockComment = 0 // Depth counter for nested Swift comments!

        var structs = 0, classes = 0, actors = 0, protocols = 0, functions = 0, macros = 0

        for rawLine in lines {
            let line = rawLine.trimmingCharacters(in: .whitespaces)

            if line.isEmpty {
                blank += 1
                continue
            }

            // Check nested block comment start/end
            if inBlockComment > 0 {
                comment += 1
                if line.contains("/*") { inBlockComment += 1 }
                if line.contains("*/") { inBlockComment -= 1 }
                continue
            }

            if line.starts(with: "///") {
                docComment += 1
                comment += 1
            } else if line.starts(with: "//") {
                comment += 1
            } else if line.starts(with: "/*") {
                comment += 1
                inBlockComment += 1
                if line.contains("*/") { inBlockComment -= 1 }
            } else {
                code += 1

                // Swift construct discovery
                if line.contains("struct ") { structs += 1 }
                if line.contains("class ") { classes += 1 }
                if line.contains("actor ") { actors += 1 }
                if line.contains("protocol ") { protocols += 1 }
                if line.contains("func ") { functions += 1 }
                if line.starts(with: "@") { macros += 1 }
            }
        }

        return FileMetric(
            path: path,
            blank: blank,
            comment: comment,
            docComment: docComment,
            code: code,
            total: lines.count,
            structs: structs,
            classes: classes,
            actors: actors,
            protocols: protocols,
            functions: functions,
            macros: macros
        )
    }
}
`
  },
  {
    id: 'package-manifest',
    name: 'Package.swift',
    path: 'Package.swift',
    category: 'App & Architecture',
    description: 'Swift Package Manager manifest defining dependencies, targets, and Swift 6 compiler toolchain settings.',
    code: `// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SwiftClockStudio",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
        .watchOS(.v11)
    ],
    products: [
        .library(name: "SwiftClock", targets: ["SwiftClock"]),
        .executable(name: "swift-cloc", targets: ["SwiftCLOC"])
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.5.0")
    ],
    targets: [
        .target(
            name: "SwiftClock",
            dependencies: [],
            path: "Sources/SwiftClock"
        ),
        .executableTarget(
            name: "SwiftCLOC",
            dependencies: [
                .product(name: "ArgumentParser", package: "swift-argument-parser")
            ],
            path: "Sources/SwiftCLOC"
        ),
        .testTarget(
            name: "SwiftClockTests",
            dependencies: ["SwiftClock"]
        )
    ]
)
`
  }
];
