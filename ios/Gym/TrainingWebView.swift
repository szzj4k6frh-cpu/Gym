import SwiftUI
import WebKit
import UIKit

@MainActor
struct TrainingWebView: UIViewRepresentable {
    let rest: RestCoordinator
    private static var indexURL: URL? { Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") }

    func makeCoordinator() -> Coordinator { Coordinator(rest: rest, indexURL: Self.indexURL) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(context.coordinator, name: "gymRest")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        view.uiDelegate = context.coordinator
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 16/255, green: 24/255, blue: 19/255, alpha: 1)
        view.scrollView.backgroundColor = view.backgroundColor
        if let url = Self.indexURL { view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent()) }
        return view
    }

    func updateUIView(_ view: WKWebView, context: Context) {}

    static func dismantleUIView(_ view: WKWebView, coordinator: Coordinator) {
        view.configuration.userContentController.removeScriptMessageHandler(forName: "gymRest")
        view.navigationDelegate = nil
        view.uiDelegate = nil
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate, WKUIDelegate {
        private let rest: RestCoordinator
        private let indexURL: URL?
        init(rest: RestCoordinator, indexURL: URL?) { self.rest = rest; self.indexURL = indexURL }

        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "gymRest", message.frameInfo.isMainFrame,
                  let expected = indexURL?.standardizedFileURL,
                  let source = message.frameInfo.request.url, source.isFileURL,
                  source.standardizedFileURL == expected,
                  JSONSerialization.isValidJSONObject(message.body),
                  let data = try? JSONSerialization.data(withJSONObject: message.body),
                  let command = try? RestCommand.decode(data, now: Date()) else { return }
            rest.handle(command)
        }

        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url, url.isFileURL,
                  let root = indexURL?.deletingLastPathComponent().resolvingSymlinksInPath().path,
                  url.resolvingSymlinksInPath().path.hasPrefix(root + "/") else {
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? { nil }

        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            guard frame.isMainFrame, let root = webView.window?.rootViewController else { completionHandler(false); return }
            var presenter = root
            while let shown = presenter.presentedViewController { presenter = shown }
            guard !(presenter is UIAlertController) else { completionHandler(false); return }
            let alert = UIAlertController(title: "Bestätigen", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Abbrechen", style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
            presenter.present(alert, animated: true)
        }
    }
}
