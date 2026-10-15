# Persönliche Trainings-App fürs iPhone

## Ziel und bestätigter Umfang

Eine deutschsprachige, kostenlose Web-App für das iPhone 16. Sie ersetzt den bisherigen interaktiven Trainingsplan. Der Nutzer kann sie über Safari zum Home-Bildschirm hinzufügen und nach dem ersten vollständigen Laden offline verwenden. Kein Konto, Abonnement, kostenpflichtiger Dienst oder App-Store-Vertrieb. Die erste Version erfasst erledigte Übungen, keine tatsächlich verwendeten Gewichte oder erreichten Wiederholungen.

## Wochenplan

| Tag | Bereiche |
| --- | --- |
| Montag | Gym, Nacken, Fußgewölbe |
| Dienstag | Fußgewölbe |
| Mittwoch | Gym, Nacken, Fußgewölbe |
| Donnerstag | Regeneration / Fußball |
| Freitag | Gym, Athletik & Koordination |
| Samstag | Regeneration / Fußball |
| Sonntag | Regeneration / Fußball |

Die App öffnet den heutigen lokalen Kalendertag. Eine Wochentagsleiste und Navigation zur vorherigen/nächsten Woche ermöglichen den Zugriff auf vergangene Trainings. Ein Heute-Button führt zurück. Das gewählte Datum ist sichtbar.

### Gym: Zuhause

Der interaktive Entwurf ist die maßgebliche, spezifischere Fassung.

| Übung | Vorgabe |
| --- | --- |
| Kurzhantel-Schulterdrücken | 2–3 × 6–10 |
| Seitheben | 2 × 10–15 |
| Butterfly | 2–3 × 6–10 |
| Enger Latzug | 2–3 × 6–10 |
| Sitzendes Kabelrudern | 2–3 × 6–10 |
| Trizeps-Pushdowns | 2–3 × 6–10 |
| Preacher Curls | 2–3 × 6–10 |
| Stehender Beinbeuger (einbeinig) | 2–3 × 6–10 je Bein |
| Goblet Squats | 2–3 × 6–10 |

Bereichshinweis: 2–3 Minuten Pause.

### Gym: Unterwegs

An Gym-Tagen kann zwischen Zuhause und Unterwegs gewechselt werden. Unterwegs ersetzt diese Liste ausschließlich den Gym-Bereich. Es gibt keine zusätzliche Alternative für Seitheben.

| Übung | Vorgabe |
| --- | --- |
| Pike Push-ups | 2–3 × 6–12 |
| Breite Liegestütze | 2–3 × 8–15 |
| Reverse Snow Angels (Rücken) | 2–3 × 12–15 |
| Superman Pulls (Rücken) | 2–3 × 10–15 |
| Enge Liegestütze (Trizeps) | 2–3 × 6–12 |
| Selbstwiderstands-Curls (Bizeps) | 2–3 × 10–15 |
| Sliding Leg Curls (Handtuch) | 2–3 × 8–12 |
| Bulgarian Split Squats | 2–3 × 8–12 je Bein |

### Ergänzende Bereiche

Nacken, Montag und Mittwoch: Neck Curls 2 × 15, Neck Extensions 2 × 15, seitliches Halsheben 2 × 15 je Seite. Hinweis: 5–10 Minuten, zunächst ohne Zusatzgewicht.

Fußgewölbe, Montag bis Mittwoch: Short Foot 2 × 10 je Fuß (Gewölbe anheben, ohne Zehenkrallen), Einbeinstand 2 × 30 Sekunden je Seite, Wadenheben 2 × 15 (Gewicht gleichmäßig über dem Vorfuß). Hinweis: circa 5 Minuten.

Athletik & Koordination, Freitag: Koordinationsleiter / Bodenlinien 3 × 30 Sekunden (schnelle, kontrollierte Schritte), seitliche Shuffle-Schritte 3 × 20 Sekunden, einbeinige Standwaage 2 × 8 je Seite, kurze Antritte 4 × 10 Meter bei zunächst 60–70 % Tempo. Hinweis: circa 10 Minuten.

Die hochgeladene HG60-Anleitung ist Hintergrundmaterial; ihre allgemeinen Trainingsvorschläge überschreiben den persönlichen Plan nicht. Eine integrierte PDF-Anzeige gehört nicht zum bestätigten Umfang.

## Bedienung und Daten

Große, gut lesbare Übungskarten zeigen Namen und Vorgaben. Antippen markiert eine ganze Übung als erledigt oder offen. Zähler und Fortschrittsbalken beziehen sich auf die sichtbaren Übungen des Datums und der gewählten Variante. Ruhetage zeigen den entsprechenden Hinweis ohne irreführenden Fortschrittswert.

Die Variante wird pro Datum gespeichert; Standard ist Zuhause. Beide Gym-Varianten haben getrennte Häkchen. Beim Umschalten bleiben ihre Zustände erhalten, ergänzende Bereiche teilen ihren Zustand unabhängig von der Variante. Ein bestätigter Tagesreset löscht sämtliche Häkchen des gewählten Datums für beide Varianten; andere Daten bleiben erhalten.

Lokale Speicherung mit versioniertem Datenschema und stabilen Übungskennungen. Schlüssel verwenden das lokale Datum (YYYY-MM-DD), keine UTC-Umrechnung. Neue Wochen beginnen dadurch mit offenen Übungen; historische Einträge bleiben zugänglich. Kein Server und keine Synchronisierung. Löschen der Browser-/Website-Daten kann Trainingsdaten entfernen. Diese Grenze wird kurz in der App erklärt. Export und Import sind nicht Teil der ersten Version.

## Technischer Aufbau und Bereitstellung

Statische Progressive Web App mit HTML, CSS und JavaScript ohne externe Laufzeitbibliotheken, Schrift-Downloads oder API-Zugriffe. Getrennte Module für Plan, lokale Speicherung, Datumsberechnung und Darstellung. Web-App-Manifest mit eigenen Icons und Standalone-Anzeige; Service Worker speichert die App-Dateien für Offline-Starts. HTTPS ist für die Installation und Offline-Funktion erforderlich (localhost nur für Entwicklung).

Kostenlose statische Bereitstellung ist vorgesehen, bevorzugt GitHub Pages, sofern Repository und GitHub-Tarif dies kostenlos unterstützen. Andernfalls ist ein kostenloser statischer Hostingtarif zu wählen. Keine kostenpflichtigen Ressourcen anlegen. Veröffentlichung und tatsächliche Erreichbarkeit müssen separat geprüft werden; lokale Tests allein belegen keine veröffentlichte Handy-App.

## Fehlerbehandlung und Zugänglichkeit

Defekte gespeicherte Daten dürfen die Oberfläche nicht blockieren und werden nicht still überschrieben. Die App zeigt einen verständlichen Hinweis und ermöglicht die weitere Anzeige des Plans. Nicht verfügbare Speicherung wird sichtbar gemeldet; Sitzungshäkchen können weiter genutzt werden, ohne dauerhafte Speicherung zu versprechen. Offline-Bereitschaft wird erst nach erfolgreichem Caching angezeigt.

Semantische Buttons mit verständlichen Namen und Zuständen, sichtbarer Tastaturfokus, ausreichende Kontraste, mindestens 44-Pixel-Touchflächen, Berücksichtigung der iPhone-Safe-Areas und reduzierter Bewegung. Keine horizontal überlaufenden Inhalte auf schmalen Displays.

## Prüfung und Abnahmekriterien

Automatisierte Tests prüfen Plan und Anzahl der Übungen, lokale Datums-/Wochenübergänge, getrennte Varianten, gemeinsame Ergänzungsübungen, Speicherung nach Neuladen und datumsbegrenzten Reset. Browserprüfungen testen den vollständigen Ablauf: Tag wählen, Variante wechseln, abhaken, Fortschritt, neu laden, vergangene Woche öffnen und zurücksetzen. Offline-Neuladen muss nach initialem Caching funktionieren. Fehlerhafte beziehungsweise nicht verfügbare Speicherung wird getestet.

Darstellung bei iPhone-16-typischer Breite prüfen. Safari-Installation und Start vom Home-Bildschirm werden auf dem echten iPhone geprüft, wenn eine HTTPS-Adresse verfügbar ist; Browseremulation ersetzt diese Geräteprüfung nicht.

## Nicht enthalten

Konten, Cloud-Synchronisierung, Gewichts-/Wiederholungsprotokolle, Satztracking, Trainingsplan-Editor, Timer, Benachrichtigungen, zusätzliche Übungen und medizinische Trainingsbewertung.
