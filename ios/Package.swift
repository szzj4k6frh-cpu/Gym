// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "GymRestCore", products: [.library(name: "GymRestCore", targets: ["GymRestCore"])], targets: [.target(name: "GymRestCore", path: "Core"), .testTarget(name: "GymRestCoreTests", dependencies: ["GymRestCore"], path: "CoreTests")])
