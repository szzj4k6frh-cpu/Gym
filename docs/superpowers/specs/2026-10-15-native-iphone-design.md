# Gym auf dem eigenen iPhone: native Hülle und Satzpause

## Ziel

Die bestehende Gym-App soll auf dem iPhone 16 direkt aus Xcode installiert werden. Die vorhandene schlichte Oberfläche mit Tagen, Zuhause-/Unterwegs-Plan, Satzprotokoll, letzten Trainingswerten und Übungshinweisen bleibt erhalten. Nach dem Abhaken eines Satzes startet automatisch eine 2- oder 3-minütige Pause mit Anzeige auf dem Sperrbildschirm. Kein Hosting, keine neue Registrierung und kein kostenpflichtiger Dienst für den Test auf dem eigenen Gerät.

Der Nutzer hat Xcode installiert, sein Apple-Konto hinzugefügt und das iPhone per Kabel verbunden. Kostenloses Personal-Team-Signing wird zuerst auf dem eigenen Mac verwendet; Provisionierungsgrenzen (normalerweise sieben Tage) bleiben bestehen. Der Quellcode ist bereits in einem öffentlichen GitHub-Repository; die native Installation erfordert keine App-Store-Veröffentlichung.

## Gewählter Aufbau und Alternativen

Empfohlen ist eine native SwiftUI-App mit lokal gebündelter WKWebView-Oberfläche. Vorhandene Trainingslogik und Darstellung werden wiederverwendet, die Pause erhält eine kleine native Swift-Komponente. Das vermeidet eine zweite, abweichende Implementierung des Plans und der Eingaben.

Ein vollständiger SwiftUI-Neubau würde sämtliche Oberflächen und Datenregeln duplizieren und ist für den gewünschten Sperrbildschirm-Timer nicht erforderlich. Die bisherige reine Web-App bleibt nutzbar, kann selbst jedoch keine iOS Live Activity bereitstellen.

## Bestandteile

- Ein fertig vorbereitetes Xcode-Projekt unter `ios/`, mit App- und Widget-/Live-Activity-Target, Mindestversion iOS 18.0.
- Lokal gebündelte HTML-/CSS-/JavaScript-Dateien: Die native App läuft ohne Internet. Die JavaScript-Module werden vor der Paketierung zu einer lokal ladbaren Datei gebündelt, damit WKWebView keine Modulimporte über file-URLs benötigt. Ein reproduzierbares Skript erzeugt das Bundle aus dem bestehenden Web-Code, keine manuell gepflegte zweite Kopie.
- Standardmäßiger persistenter WKWebView-Datenspeicher für die Trainingsdaten. Keine Cloud-Synchronisierung, keine Export-/Import-Oberfläche.
- Ein eng begrenzter Nachrichtenkanal zwischen Web-Oberfläche und Swift akzeptiert ausschließlich Start/Stop der Satzpause und validiert Werte sowie Herkunft der Nachricht. Remote-Seiten erhalten keinen Zugriff auf native Funktionen; die WebView lädt ausschließlich lokale App-Dateien.
- Native Timerverwaltung speichert Endzeit und Dauer lokal; sie stellt die laufende Pause beim erneuten Öffnen wieder her. Es gibt höchstens eine aktive Satzpause. Ein neuer abgehakter Satz ersetzt den alten Timer, Stop entfernt Anzeige und geplante Benachrichtigung.
- ActivityKit-/WidgetKit-Erweiterung zeigt den Countdown auf dem Sperrbildschirm und bei unterstützter Einstellung in der Dynamic Island. Die Anzeige verwendet die absolute Endzeit, keine im Hintergrund laufende JavaScript-Schleife.
- Eine lokale iOS-Benachrichtigung informiert über das Pausenende, sofern der Nutzer sie erlaubt hat. Kein Push-Server und keine Push-Berechtigung erforderlich. Im Vordergrund wird die Benachrichtigung ebenfalls entsprechend den erteilten Rechten angezeigt.

## Timerverhalten

Antippen eines einzelnen Satz-Häkchens startet die ausgewählte Dauer. Entfernen eines Häkchens startet keinen Timer. Die Auswahl 2/3 Minuten gilt für den nächsten Satz und verändert die gerade laufende Pause nicht. Die komplette Übung auf einmal abzuhaken startet keine zusätzliche Satzpause.

Eine neue Pause ersetzt die bisherige Live Activity und die geplante Benachrichtigung. Stop beendet beides. Nach Ablauf zählt die Anzeige nicht negativ weiter; die native App bereinigt abgelaufene Aktivitäten beim Öffnen. Eine Countdown-Anzeige und ein vom System geplanter Hinweis funktionieren unabhängig davon, ob die WebView gerade aktiv ist.

## Grenzen und Berechtigungen

Die App zeigt gegebenenfalls eine knappe deutsche Erklärung zu deaktivierten Live Activities oder Benachrichtigungen. Ablehnung verhindert weder Satzprotokoll noch den sichtbaren Timer in der App.

Live Activities und Benachrichtigungen unterliegen den iOS-Einstellungen. Ton kann durch Lautlosmodus, Fokus oder Benachrichtigungseinstellungen unterdrückt werden. Diese Version startet nicht den Systemtimer der Uhr-App und verspricht keinen Alarm, der diese Einstellungen übergeht. Bei vollständig ausgeschaltetem iPhone läuft keine aktive Anzeige.

Vorhandene Daten aus Safari beziehungsweise der bisherigen Home-Bildschirm-Web-App werden von iOS nicht automatisch in WKWebView geteilt. Die native App startet deshalb mit einem eigenen Trainingsdatenspeicher; die bisherigen Daten bleiben in der Web-App. Eine Datei-Sicherung oder Datenübertragung wird nicht hinzugefügt, da der Nutzer diese Funktion abgelehnt hat. Normale Updates über Xcode sollen die App-Daten erhalten; Löschen der App entfernt sie.

Die Verfügbarkeit von Live Activities mit dem persönlichen kostenlosen Signing-Team muss am echten Gerät geprüft werden. Eine nicht nutzbare Berechtigung wird als konkreter Blocker gemeldet; es wird weder eine kostenpflichtige Mitgliedschaft gebucht noch eine öffentliche Veröffentlichung ausgelöst.

## Umsetzung und Prüfung

- Webtests prüfen den Nachrichtenkanal: Set-Häkchen startet, Rücknahme startet nicht, Stop beendet und normale Safari-Nutzung funktioniert ohne native Schnittstelle.
- Der gebündelte Web-Code wird im Browser getestet; Satzprotokoll, Dezimalzahlen, letztes Training und lokale Speicherung müssen weiterhin funktionieren.
- Native Timerzustände und ungültige Nachrichten werden soweit ohne Apple-SDK möglich mit isolierter Logik geprüft.
- Ein Xcode-Build auf macOS ist erforderlich. Die Cloud-Umgebung kann den Apple-SDK-Build und die Gerätesignierung nicht ersetzen; erfolgreiche JavaScript-Tests belegen keine native Kompilierung.
- Auf dem iPhone prüfen: Erstinstallation, offline starten, Satz erfassen, automatische Pause, Display sperren, Countdown, Pausenende mit erlaubten Benachrichtigungen, Wechsel 2/3 Minuten, neuer Satz ersetzt alte Pause, Stop und Daten nach erneutem App-Start.
- Bei verweigerten Berechtigungen bleibt die App bedienbar und behauptet keinen aktiven Sperrbildschirm-Alarm.

## Übergabe

Ein herunterladbares Xcode-Projekt mit allen benötigten lokalen Ressourcen und einer kurzen Anleitung. Der Nutzer öffnet das Projekt, wählt sein Personal Team und sein iPhone und startet es über Run. Erst nach erfolgreichem Build und dem Test auf seinem iPhone wird die native Fassung als funktionsfähig bestätigt.
