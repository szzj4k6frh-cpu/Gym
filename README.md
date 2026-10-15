# Gym · Dein Training

Kostenlose, deutschsprachige Trainings-Web-App für das iPhone. Ohne Konto, Cloud oder externe Laufzeitdienste. Zuhause- und Calisthenics-Plan, Wochenübersicht und Häkchen pro Datum; offline nutzbar nach vollständigem ersten Laden. Übungen lassen sich für einzelne Sätze, Gewichte, Wiederholungen und Ausführungshinweise aufklappen. Frühere protokollierte Werte derselben Übung erscheinen direkt darunter.

## Lokal starten

Python 3 genügt, kein Build nötig:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Die App über den lokalen HTTP-Server öffnen, nicht als Datei. Service Worker benötigen HTTPS oder localhost.

## Entwickeln und testen

Node.js 24 und Python 3 verwenden:

```sh
npm ci --cache /tmp/gym-npm-cache
npm test
TZ=Europe/Berlin npm test
TZ=America/Los_Angeles npm test
npx playwright install chromium webkit
npm run test:e2e
```

Falls `/usr/bin/chromium` existiert, nutzt die Chromium-Testkonfiguration diesen Browser. Sonst wird Playwrights Chromium verwendet. Für Browserdateien an einem abweichenden Ort `PLAYWRIGHT_BROWSERS_PATH` beim Installieren und Testen identisch setzen. Nur Chromium testen: `npm run test:e2e -- --project=chromium`.

Tests prüfen Plan, lokale Wochen-/Datumswechsel, getrennte Varianten, gemeinsame Zusatzübungen, Speicherung nach Neuladen, Reset, Speicherfehler und Offline-Neustarts sowohl an der Domainwurzel als auch unter `/Gym/`. Ein separater Testserver lässt gezielt eine Cache-Datei fehlen.

## Kostenlos aufs iPhone bringen

Die App benötigt eine erreichbare HTTPS-Adresse. Sie ist noch nicht veröffentlicht.

GitHub Pages ist eine Option, wenn es für Sichtbarkeit und Tarif dieses Repositories kostenlos verfügbar ist. Die Eignung konnte aus dieser Umgebung wegen gesperrtem GitHub-API-Zugriff nicht bestätigt werden. Ein privates Repository nicht ungefragt öffentlich stellen.

Nach Übernahme der App in das GitHub-Repository: Settings → Pages → Deploy from a branch → Branch mit den App-Dateien auswählen, Ordner `/ (root)` → Save. Die von GitHub angezeigte HTTPS-Adresse öffnen und prüfen. Falls Pages für dieses Repository einen kostenpflichtigen Tarif voraussetzt, keinen Tarif buchen; stattdessen einen kostenlosen statischen Hostingtarif verwenden. Es werden nur `index.html`, `styles.css`, `src/`, `sw.js`, `manifest.webmanifest` und `icons/` benötigt; keine Tests, Dokumentation oder node_modules veröffentlichen.

Auf dem iPhone 16:

1. Die veröffentlichte Adresse in Safari öffnen und den Plan vollständig laden lassen.
2. Teilen → Zum Home-Bildschirm → gegebenenfalls „Als Web-App öffnen“ aktivieren → Hinzufügen.
3. App vom Home-Bildschirm starten und den Plan einmal mit Internetverbindung vollständig laden lassen.
4. Eine Übung abhaken, App schließen und erneut öffnen: Häkchen muss bleiben.
5. Flugmodus aktivieren, App erneut starten und beide Trainingsvarianten prüfen.

Browserprüfungen ersetzen diesen echten Safari-/iPhone-Test nicht.

## Satzprotokoll und Pausen

Die Schaltfläche links hakt eine ganze Übung ab. Tippen auf den Namen öffnet die einzelnen Sätze. Bei 2–3 Sätzen startet die Ansicht mit zwei und bietet einen optionalen dritten Satz an. Kurzhantelgewichte werden je Hantel eingetragen. Zeitübungen haben Sekunden- statt Wiederholungsfelder; Antritte ein Meterfeld. Ausführungshinweise sind unter der jeweiligen Übung aufklappbar.

Nach dem Abhaken eines einzelnen Satzes startet automatisch eine Pause. Mit „2 Min.“ oder „3 Min.“ wählt man die Dauer für den nächsten Satz; eine laufende Pause wird dadurch nicht neu gestartet. „Stop“ beendet sie. Dauer und Endzeit werden lokal gespeichert und nach einem Neuladen wiederhergestellt. Bei gesperrtem Bildschirm oder angehaltener Web-App ist kein zuverlässiger Alarm möglich. Nach dem Öffnen berechnet der Timer die Restzeit neu.

## Daten und Updates

Häkchen, Satzwerte und Variante werden lokal pro Datum gespeichert. Vorhandene Häkchen der ersten App-Version werden in das neue Speicherformat übernommen; der ursprüngliche Datensatz wird dabei nicht überschrieben. Neue Wochen starten leer, vergangene Trainings bleiben über die Wochenpfeile erreichbar. Der Tagesreset löscht nach Bestätigung alle Häkchen und Satzwerte dieses Datums, auch die andere Variante.

Keine Synchronisierung und kein Backup. Beim Löschen der Website-Daten können Einträge verloren gehen. Safari und die installierte App können getrennte Speicher haben. Speicherfehler werden angezeigt; die App bleibt mit Häkchen für die aktuelle Sitzung bedienbar. Beschädigte Daten werden nicht still überschrieben.

Bei einer Änderung an App-Dateien die Cache-Version in `sw.js` erhöhen. Ein neuer Worker wartet, bis bisherige App-Fenster geschlossen wurden, bevor er aktiv wird; danach startet die aktualisierte Fassung. Der Service Worker entfernt nur alte Caches mit dem eigenen Präfix `gym-app-`.
