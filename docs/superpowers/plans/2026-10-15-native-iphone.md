# Native Gym iPhone App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein lokal installierbares Xcode-Projekt mit der bestehenden Trainingsoberfläche und nativer Satzpause auf dem Sperrbildschirm liefern.

**Architecture:** SwiftUI hostet die gebündelte Web-Oberfläche in einer persistenten WKWebView. Ein validierter Start-/Stop-Kanal steuert eine native Timerverwaltung, eine ActivityKit-Erweiterung und lokale Benachrichtigungen. Ein absoluter Endzeitpunkt verbindet alle Anzeigen ohne JavaScript-Ausführung im Hintergrund.

**Tech Stack:** Bestehendes JavaScript und CSS, esbuild ausschließlich als Entwicklungswerkzeug, Swift 5-Sprachmodus, SwiftUI, WebKit, ActivityKit, WidgetKit, UserNotifications; iOS 18.0+, Node.js 24 und Python 3 für die vorhandenen Prüfungen.

**Spec:** `docs/superpowers/specs/2026-10-15-native-iphone-design.md`

## Global Constraints

- „Kein Hosting, keine neue Registrierung und kein kostenpflichtiger Dienst für den Test auf dem eigenen Gerät.“
- „Die vorhandene schlichte Oberfläche mit Tagen, Zuhause-/Unterwegs-Plan, Satzprotokoll, letzten Trainingswerten und Übungshinweisen bleibt erhalten.“
- „Es gibt höchstens eine aktive Satzpause.“
- „Entfernen eines Häkchens startet keinen Timer.“
- „Die komplette Übung auf einmal abzuhaken startet keine zusätzliche Satzpause.“
- „Stop beendet beides.“ Gemeint sind Live Activity und geplante Benachrichtigung.
- „Normale Updates über Xcode sollen die App-Daten erhalten; Löschen der App entfernt sie.“
- „Erst nach erfolgreichem Build und dem Test auf seinem iPhone wird die native Fassung als funktionsfähig bestätigt.“
- Bestehenden isolierten Checkout `/workspace/Gym` verwenden; keinen Worktree anlegen. Die bestehende GitHub-Pages-App weiterhin funktionsfähig halten.
- Kein automatischer Datentransfer aus Safari, kein Datei-Export und keine App-Store-Veröffentlichung.

## Review Focus

- Schnell aufeinanderfolgende Start-/Stop-Befehle während einer Berechtigungsabfrage dürfen keinen alten Timer wiederbeleben (Task 2).
- Externe Navigation, Subframes und ungültige Nachrichten dürfen keine nativen Nebenwirkungen auslösen (Task 1/2).
- Wiederherstellung nach App-Abbruch darf weder eine zweite Live Activity noch einen abgelaufenen Alarm anlegen (Task 2/3).
- Lokal gebündelter Code muss ohne Netzwerk und ohne Service Worker laufen, einschließlich Dezimaleingaben und vorhandener Datenregeln (Task 1/4).
- Ein Personal-Team-Signing- oder Apple-SDK-Problem muss als unbestätigter Geräte-/Buildschritt sichtbar bleiben (Task 3/4).

## Dateien und Verantwortung

- `src/native-bridge.js`, `src/app.js`, `src/timer.js`: optionale Timer-Nachrichten; Web-App ohne native Umgebung unverändert bedienbar.
- `scripts/build-ios-web.mjs`, `package.json`, `package-lock.json`: reproduzierbares, lokal ladbares Web-Bundle mit esbuild; Ausgabe unter `ios/Gym/Web/`.
- `ios/Core/RestCommand.swift`, `ios/Core/RestSnapshot.swift`, `ios/Package.swift`, `ios/CoreTests/RestCoreTests.swift`: Foundation-basierte Validierung und Zustandsregeln ohne Apple-UI-SDK.
- `ios/Gym/GymApp.swift`, `ios/Gym/TrainingWebView.swift`, `ios/Gym/RestCoordinator.swift`, `ios/Gym/NotificationDelegate.swift`: App-Lebenszyklus, sichere WebView und native Effekte.
- `ios/Shared/RestActivityAttributes.swift`, `ios/GymActivity/GymActivity.swift`: gemeinsame Activity-Daten und Sperrbildschirm-/Dynamic-Island-Darstellung.
- `ios/Gym/Info.plist`, `ios/GymActivity/Info.plist`, `ios/Gym/Assets.xcassets/`: erforderliche Einstellungen und lokale App-Icons.
- `ios/Gym.xcodeproj/project.pbxproj`, `ios/Gym.xcodeproj/xcshareddata/xcschemes/Gym.xcscheme`: direkt zu öffnendes Projekt, zwei Targets und ein geteiltes Scheme.
- `tests/native-bridge.test.js`, `tests/ios-package.test.js`, `tests/ios.spec.js`: Bridge-, Paket- und Bundle-Browserprüfung.
- `ios/README.md`, `scripts/package-ios.mjs`: deutsche Geräteanleitung und vollständiges Download-Paket ohne Entwicklerkonto-Daten.

### Task 1: Native Schnittstelle und offline ladbares Web-Bundle

**Interfaces:**
- `notifyRestStarted(deadlineMs: number, durationSeconds: number): void`, `notifyRestStopped(): void` aus `src/native-bridge.js`.
- Optionale Schnittstelle: `window.webkit.messageHandlers.gymRest.postMessage({action:'start',deadlineMs,durationSeconds})` beziehungsweise `{action:'stop'}`. Kein native Handler bedeutet normale Web-Nutzung; fehlgeschlagene native Kommunikation darf die Satzspeicherung nicht blockieren.
- Timer ergänzt `getDeadline(): number | null`; app.js sendet Start erst nach erfolgreichem Start und Stop erst nach erfolgreichem Stop. Dauerwechsel und Häkchenrücknahme senden nichts.
- `npm run build:ios` bündelt src/app.js als klassisches, nicht minimiertes IIFE nach `ios/Gym/Web/app.js`. HTML referenziert dieses lokale Skript und lokale CSS-/Icon-Dateien. Native Ausführung registriert keinen Service Worker.

- [ ] **1. Failing Tests schreiben:** Nachrichten enthalten den tatsächlichen Timer-Endzeitpunkt und die Dauer 120/180; fehlender oder werfender Handler lässt die Web-App laufen. Browser-Injektion zeichnet Start beim Satz-Häkchen und Stop auf; Rücknahme und Dauerwechsel erzeugen keinen neuen Start.
- [ ] **2. Rot bestätigen:** `node --test tests/native-bridge.test.js`; neue Browserfälle müssen ohne Bridge fehlschlagen.
- [ ] **3. Implementieren:** esbuild als exakt gespeicherte Entwicklungsabhängigkeit installieren und Lockfile behalten. Buildskript liest ausschließlich Projektdateien, erzeugt lokales HTML/CSS/JS und Icons, keine externe Laufzeitabhängigkeit. Die Modul-Bündelung übernimmt esbuild, keine selbstgeschriebene Import-Ersetzung. Web-Bridge und Timer-Hooks ergänzen; Service Worker nur bei http(s) registrieren.
- [ ] **4. Grün bestätigen:** `npm test`, `npm run build:ios`; Pakettest prüft lokale Referenzen und das Fehlen von Modulimporten im Bundle. Neue Bridge-Browserfälle mit Chromium ausführen; normale Webtests bleiben grün.
- [ ] **5. Commit:** `feat: bundle training UI and add optional native timer bridge`.

### Task 2: Native Timerverwaltung und lokale WebView

**Interfaces:**
- `RestCommand.decode(_ data: Data, now: Date) throws -> RestCommand`, Fälle `.start(deadline: Date, duration: TimeInterval)` und `.stop`.
- Nur 120 oder 180 Sekunden; numerischer endlicher Millisekunden-Zeitpunkt; verbleibende Zeit >0 und höchstens gewählte Dauer +5 Sekunden. Boolesche Werte, fremde actions und fehlende Felder zurückweisen.
- `RestSnapshot: Codable, Equatable` enthält `deadline: Date` und `duration: TimeInterval`, mit `remaining(at: Date) -> TimeInterval` (mindestens 0) und `isActive(at: Date) -> Bool`.
- `@MainActor RestCoordinator: ObservableObject` bietet `handle(_ command: RestCommand)`, `restore()`, `permissionNotice: String?`. Persistenz über einen eigenen UserDefaults-Schlüssel; eine feste Notification-ID `gym-rest-end`.
- `TrainingWebView: UIViewRepresentable` lädt ausschließlich `Web/index.html` aus dem Bundle mit readAccess innerhalb von Web/. Bridge-Nachrichten nur aus dem Hauptframe mit lokaler Index-URL akzeptieren. Navigation außerhalb des gebündelten Web-Verzeichnisses sowie neue Fenster blockieren. JavaScript-confirm für Tagesreset/Satzentfernung über native Bestätigung abbilden.

- [ ] **1. Failing Tests schreiben:** Swift-Core-Tests für Start/Stop, NaN/Bool/Strings/falsche actions, überlange und abgelaufene Endzeiten, Codable-Restore und Restzeit nach Hintergrundzeit. Bridge-Herkunft und Validierungsfehler in Xcode-Test-/Geräteprüfliste aufnehmen; keine remote Seiten zum Nachladen zulassen.
- [ ] **2. Rot prüfen:** Falls Swift verfügbar, `swift test --package-path ios`; sonst fehlenden Compiler dokumentieren und Tests als unrun markieren. Kein Erfolg allein aus existierenden Swift-Dateien ableiten.
- [ ] **3. Implementieren:** Swift-Core ohne SwiftUI-Abhängigkeit erstellen. Coordinator verwaltet native Effekte in einer abbrechbaren Task mit monotoner Revision; nach jedem await nur dann Änderungen anwenden, wenn Revision noch aktuell ist. Neuer Start ersetzt bestehende Aktivität/Notification, Stop entfernt gespeicherten Zustand und geplante sowie bereits angezeigte Timer-Benachrichtigung. Zwischenzeitlich abgelaufene Pausen nicht nachträglich neu planen.
- [ ] **4. Berechtigungen und Lebenszyklus:** Benachrichtigungen im Zusammenhang mit dem ersten Timerstart anfragen, Ablehnung verständlich anzeigen. ActivityAuthorizationInfo berücksichtigen. App im Vordergrund versöhnt gespeicherten Zustand und bereits existierende Activities, statt Duplikate anzulegen. NotificationDelegate zeigt erlaubte Benachrichtigungen auch im Vordergrund. WebView verwendet WKWebsiteDataStore.default und verhindert retain cycles im Handler. SwiftUI-Hülle zeigt nur WebView und nötige knappe Berechtigungshinweise.
- [ ] **5. Verifizieren:** JavaScript-Suite grün; Swift-Core-Tests nur bei vorhandenem Compiler als ausgeführt melden. macOS-Prüfliste muss schnellen Start→Stop während Permission-Dialog, abgelehnte Berechtigungen, Restored Timer und lokale Bestätigungsdialoge enthalten.
- [ ] **6. Commit:** `feat: add native rest state and restricted local webview`.

### Task 3: Live Activity und Xcode-Projekt

**Interfaces:**
- `RestActivityAttributes: ActivityAttributes` mit `ContentState: Codable, Hashable { startDate: Date, endDate: Date }`; keine Widget-interne Trainingsdatenbank und keine App Groups.
- ActivityConfiguration verwendet das absolute Intervall mit countdown Text(timerInterval:countsDown:) und zeigt bei abgelaufenem/stalem Zustand keinen negativen Countdown. Dynamic Island erhält kompakte/minimale/erweiterte Darstellung. Anzeigen heißen sachlich „Satzpause“.
- App und Extension kompilieren dieselbe Attributes-Datei. Nur App-Target enthält WebView/Coordinator/Core-Dateien und Web-Ressourcen; nur Extension-Target enthält Widget-Einstiegspunkt.

- [ ] **1. Failing Pakettests schreiben:** PBX-Projekt hat App plus App-Extension, Widget ist eingebettet, lokale Web-Ressourcen sind im App-Target, gemeinsamer Attributes-Typ in beiden Targets, Scheme referenziert App. Plists enthalten NSSupportsLiveActivities=true beziehungsweise WidgetKit-Erweiterungskennung. Keine Team-ID, Signierzertifikate, Push-/App-Group-Entitlements oder Secrets im Paket.
- [ ] **2. Rot bestätigen:** `node --test tests/ios-package.test.js` findet die noch fehlenden Projektdateien nicht.
- [ ] **3. Implementieren:** ActivityKit-/WidgetKit-Code und eindeutige Platzhalter-Bundle-IDs `local.gym.personal` und `local.gym.personal.activity`. Automatic Signing mit leerem DEVELOPMENT_TEAM, iOS 18.0, Swift-Sprachmodus 5, Gerät und Simulator unterstützen. Extension ist abhängiges Target und im Copy-Files-Schritt eingebettet. Eigenes bestehendes Icon als App-Icon übernehmen; keine zusätzliche Gestaltung. Keine versteckten kostenpflichtigen Capabilities aktivieren.
- [ ] **4. Xcode prüfen:** XML-Plists/Scheme und Projektdateistruktur hier prüfen. Auf dem Mac `xcodebuild -list -project ios/Gym.xcodeproj`, danach Simulator-Build ohne Gerätesignierung und anschließend Personal-Team-Build aufs iPhone. Ohne macOS bleibt der native Build ausdrücklich unbestätigt. Signing-Team auf beiden Targets auswählen; Bundle-ID bei Kollision anpassen, ohne die Eltern-/Extension-Beziehung zu verlieren.
- [ ] **5. Commit:** `feat: add lock-screen rest activity and Xcode project`.

### Task 4: Paket, Regression und Geräteübergabe

**Interfaces:** `npm run package:ios` erzeugt ein ZIP mit Xcode-Projekt, Swift-Dateien, Plists, Icons, Web-Bundle und Anleitung. Es funktioniert nach Entpacken ohne npm oder Netzwerk auf dem Mac; das Web-Bundle wird vor der ZIP-Erstellung erneuert. Die Archivstruktur hat einen klaren Gym-Ordner und keine absoluten Pfade.

- [ ] **1. Failing Browser-/Pakettests:** Bundle mit blockierten Netzwerkanfragen starten, Häkchen, Dezimaleingabe, Reload, letzte Werte und Timer-Bridge ausführen; keine externe Ressource notwendig. ZIP-Inhalt muss alle Projektverweise auflösen und darf node_modules, Git-Metadaten, Testausgaben und persönliche Daten nicht enthalten.
- [ ] **2. Implementieren:** build:ios/package:ios automatisieren, ios/README.md mit wenigen konkreten Schritten schreiben: ZIP entpacken → Gym.xcodeproj öffnen → Personal Team für App und Extension → iPhone auswählen → Run. Bei Bedarf Entwickler-Modus auf dem iPhone aktivieren und explizit angezeigten Gerätehinweisen folgen. Kein neues Cloud-Konto nötig.
- [ ] **3. Vollständige Cloud-Verifikation:** `npm test`, `npm run build:ios`, `npm run test:e2e -- --project=chromium`, `npm run package:ios`, `git diff --check`. WebKit nur bei tatsächlich vorhandenem Browser prüfen. Ausgeführte Testzahlen und nicht ausführbare Apple-SDK-Schritte getrennt berichten.
- [ ] **4. Unabhängiges Review:** Gesamtänderung mit frischem Reviewer prüfen lassen; konkrete wichtige Befunde mit Regression beheben. Kein zusätzlicher Implementierungsagent nötig: gewählter Ablauf ist Umsetzung hier im Chat.
- [ ] **5. Übergabe:** ZIP verlinken, vorhandene Web-Daten bleiben separat erwähnen, genau den nächsten Xcode-Schritt nennen. Nativ funktionsfähig erst nach Nutzer-Build und echtem Sperrbildschirm-Test bestätigen. Bei Signing-/Berechtigungsfehlern Fehlermeldung/Screenshot diagnostizieren und keinen kostenpflichtigen Tarif als Voraussetzung erfinden.
- [ ] **6. Commit:** `docs: package native app and document iPhone verification`.
