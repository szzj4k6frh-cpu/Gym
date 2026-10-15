# Gym auf deinem iPhone

Dieses Projekt übernimmt die bestehende Gym-Oberfläche und ergänzt eine native Satzpause mit Live Activity und lokalen Mitteilungen. Es benötigt iOS 18 oder neuer und ein aktuelles Xcode auf deinem Mac.

**Stand:** Web-/Paketprüfungen können in der Entwicklungsumgebung ausgeführt werden. Der Swift-/Xcode-Build und die echte Sperrbildschirm-Funktion sind erst nach dem Test auf deinem Mac und iPhone bestätigt. Es ist kein fertig signiertes App-Installationspaket.

## Installation ohne Entwicklerabo

1. ZIP entpacken und im Ordner **Gym** auf **Gym.xcodeproj** doppelklicken. Du brauchst kein neues Projekt anzulegen.
2. In Xcode links oben auf das blaue Projekt **Gym** klicken.
3. Unter **TARGETS → Gym → Signing & Capabilities** bei **Team** dein **Personal Team** auswählen. „Automatically manage signing“ bleibt aktiviert.
4. Dasselbe bei **TARGETS → GymActivity** machen.
5. Oben neben dem Play-Button das Scheme **Gym** und dein verbundenes **iPhone** auswählen.
6. Auf **▶ Run** klicken. Falls Xcode fragt, ob die Erweiterung oder die App gestartet werden soll, **Gym** wählen.
7. Falls das iPhone Entwickler-Modus verlangt: **Einstellungen → Datenschutz & Sicherheit → Entwicklermodus** einschalten und den angezeigten Neustart-/Bestätigungsschritten folgen. Bei einem Vertrauenshinweis nur deinem eigenen Entwicklerkonto vertrauen; die genaue Stelle nennt iOS gegebenenfalls unter **Allgemein → VPN & Geräteverwaltung**.

Falls beim Bundle Identifier steht, dass er nicht verfügbar ist: unter Gym beispielsweise `de.deinname.gymplan` eintragen, unter GymActivity denselben Text mit `.activity` am Ende. Danach beide Targets weiterhin mit demselben Personal Team signieren.

Mit einem kostenlosen Apple-Konto ist die Gerätesignierung normalerweise nur sieben Tage gültig. Danach das Projekt erneut mit **Run** installieren. Die App möglichst nicht löschen: Ein Update derselben App soll die gespeicherten Einträge erhalten, Löschen der App entfernt sie. Die tatsächliche Verfügbarkeit von Live Activities mit deinem Personal Team muss auf dem Gerät geprüft werden. Falls Xcode einen Fehler zeigt, bitte dessen genauen Text oder einen Screenshot schicken; kein Entwicklerabo buchen.

## Erster Test auf dem iPhone

1. Einen Gym-Tag wählen, Übung aufklappen und einen Satz abhaken. Die Satzpause startet automatisch.
2. Beim ersten Timer die gewünschten Mitteilungen erlauben. In den iPhone-Einstellungen müssen Live-Aktivitäten für Gym erlaubt sein.
3. iPhone sperren: Der Countdown sollte auf dem Sperrbildschirm erscheinen; die Dynamic Island hängt von Geräteeinstellungen und Systemzustand ab.
4. Nach Ablauf den Hinweis prüfen. Lautlosmodus, Fokus und Mitteilungseinstellungen können den Ton unterdrücken. Das ist kein Timer der Uhr-App und kein Alarm, der diese Einstellungen übergeht.
5. Neuen Satz abhaken: Er ersetzt die alte Pause. **Stop** entfernt die Aktivität und den geplanten Hinweis.
6. App erneut öffnen, Satzwerte prüfen und einen Offline-Start testen. Keine Internetverbindung und kein Hosting sind erforderlich.

Wenn Benachrichtigungen oder Live Activities nicht erlaubt sind, bleibt das Trainingsprotokoll nutzbar und die App zeigt einen kurzen Hinweis. Bei vollständig ausgeschaltetem iPhone gibt es keine aktive Anzeige.

## Daten

Die App besitzt einen eigenen lokalen Datenspeicher. Safari und die bisherige Home-Bildschirm-Web-App teilen ihre Einträge nicht automatisch mit dieser App. Die bisherigen Daten bleiben dort erhalten. Es gibt keine Synchronisierung und keinen Datei-Export/-Import.

## Für technische Prüfung und Weiterentwicklung

Im vollständigen Repository: `npm ci`, `npm run build:ios`, `npm test`, `npm run test:e2e -- --project=chromium`, `npm run package:ios`. Die beigelegte Web-Version ist bereits gebündelt; zum normalen Öffnen in Xcode sind weder npm noch ein Server nötig.

Auf dem Mac optional:

```sh
xcodebuild -list -project Gym.xcodeproj
xcodebuild -project Gym.xcodeproj -scheme Gym -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
swift test
```

Die Swift-Core-Tests prüfen Nachrichtenvalidierung, gültige Endzeiten und Wiederherstellung. Zusätzlich am Gerät prüfen: Live Activities deaktiviert, Mitteilungen verweigert, schnellen Satzwechsel und Stop während der Berechtigungsabfrage, abgelaufene Pause nach Wiederöffnung, Tagesreset bestätigen/abbrechen und Austausch des dritten Satzes.

Aus Sicherheitsgründen verarbeitet die native Schnittstelle nur Start-/Stop-Nachrichten aus dem lokalen Hauptdokument. Externe Navigation wird blockiert. Zum Verhindern von Rennen zwischen ersetzten Pausen besitzen lokale Mitteilungen eindeutige IDs mit gemeinsamem `gym-rest-end-`-Präfix.
