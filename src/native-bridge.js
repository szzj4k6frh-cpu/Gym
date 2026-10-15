function send(message) {
 try {globalThis.window?.webkit?.messageHandlers?.gymRest?.postMessage(message)}
 catch {/* Training remains usable if the native host is unavailable. */}
}
export function notifyRestStarted(deadlineMs,durationSeconds) {send({action:'start',deadlineMs,durationSeconds})}
export function notifyRestStopped() {send({action:'stop'})}
