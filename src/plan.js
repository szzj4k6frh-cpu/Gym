function group(id,title,note,rows) {
 return {id,title,note,exercises:rows.map(([key,name,prescription,hint])=>({id:`${id}:${key}`,name,prescription,...(hint?{hint}:{})}))};
}
const home=group('home','Gym','2–3 Min. Pause',[
 ['press','Kurzhantel-Schulterdrücken','2–3 × 6–10'],['lateral','Seitheben','2 × 10–15'],['butterfly','Butterfly','2–3 × 6–10'],['lat','Enger Latzug','2–3 × 6–10'],['row','Sitzendes Kabelrudern','2–3 × 6–10'],['triceps','Trizeps-Pushdowns','2–3 × 6–10'],['curls','Preacher Curls','2–3 × 6–10'],['legs','Stehender Beinbeuger (einbeinig)','2–3 × 6–10 je Bein'],['squat','Goblet Squats','2–3 × 6–10']]);
const away=group('away','Calisthenics','2–3 Min. Pause',[
 ['pike','Pike Push-ups','2–3 × 6–12'],['wide','Breite Liegestütze','2–3 × 8–15'],['angels','Reverse Snow Angels (Rücken)','2–3 × 12–15'],['superman','Superman Pulls (Rücken)','2–3 × 10–15'],['narrow','Enge Liegestütze (Trizeps)','2–3 × 6–12'],['curls','Selbstwiderstands-Curls (Bizeps)','2–3 × 10–15'],['legs','Sliding Leg Curls (Handtuch)','2–3 × 8–12'],['split','Bulgarian Split Squats','2–3 × 8–12 je Bein']]);
const neck=group('neck','Nacken','5–10 Min. · zunächst ohne Zusatzgewicht',[
 ['curl','Neck Curls','2 × 15'],['extension','Neck Extensions','2 × 15'],['side','Seitliches Halsheben','2 × 15 je Seite']]);
const foot=group('foot','Fußgewölbe','Ca. 5 Min.',[
 ['short-foot','Short Foot','2 × 10 je Fuß','Fußgewölbe leicht anheben, ohne die Zehen zu krallen.'],['balance','Einbeinstand','2 × 30 Sek. je Seite'],['calf','Wadenheben','2 × 15','Gewicht gleichmäßig über dem Vorfuß.']]);
const athletic=group('athletic','Athletik & Koordination','Ca. 10 Min.',[
 ['ladder','Koordinationsleiter / Bodenlinien','3 × 30 Sek.','Schnelle, kontrollierte Schritte.'],['shuffle','Seitliche Shuffle-Schritte','3 × 20 Sek.'],['balance','Einbeinige Standwaage','2 × 8 je Seite'],['sprint','Kurze Antritte','4 × 10 m','Zunächst bei 60–70 % Tempo.']]);
export function getGroups(day,variant='home') {
 const gym=variant==='away'?away:home;
 return day===0||day===2?[gym,neck,foot]:day===1?[foot]:day===4?[gym,athletic]:[];
}
const instructions={
 'home:press':'Kurzhanteln auf Schulterhöhe halten. Bauch anspannen und die Hanteln kontrolliert nach oben drücken, ohne ins Hohlkreuz auszuweichen. Gewicht je Hantel eintragen.',
 'home:lateral':'Arme leicht beugen und die Hanteln seitlich etwa bis Schulterhöhe anheben. Ohne Schwung kontrolliert absenken. Gewicht je Hantel eintragen.',
 'home:butterfly':'Rücken an die Lehne legen. Arme vor der Brust zusammenführen und langsam öffnen; Schultern nicht nach vorne ziehen.',
 'home:lat':'Aufrecht sitzen. Stange vor dem Körper zum oberen Brustbereich ziehen. Ellenbogen nach unten führen, den Oberkörper ruhig halten.',
 'home:row':'Aufrecht sitzen, Rücken ruhig halten. Griff zum Bauch ziehen und die Ellenbogen nach hinten führen. Kontrolliert zurückführen.',
 'home:triceps':'Ellenbogen am Körper lassen. Griff nach unten drücken, indem du die Arme streckst. Nur die Unterarme bewegen, anschließend langsam zurückführen.',
 'home:curls':'Oberarme auf dem Bizepspult ablegen. Arme kontrolliert beugen und wieder senken, ohne das Gewicht fallen zu lassen.',
 'home:legs':'Zum Gerät stehen und an den Griffen festhalten. Polster nahe dem Knöchel positionieren. Ferse zum Gesäß führen, ohne die Hüfte zu bewegen. Wiederholungen je Bein erfassen.',
 'home:squat':'Eine Hantel vor der Brust halten. Knie in Richtung der Fußspitzen führen, kontrolliert in die Kniebeuge gehen und wieder aufrichten.',
 'away:pike':'Aus einer hohen Hüftposition die Ellenbogen beugen und den Kopf kontrolliert zum Boden zwischen die Hände führen. Wieder hochdrücken; nur so tief gehen, wie du die Bewegung kontrollieren kannst.',
 'away:wide':'Hände etwas weiter als schulterbreit aufsetzen. Körper in einer Linie halten, Brust kontrolliert absenken und wieder hochdrücken.',
 'away:angels':'In Bauchlage die Arme leicht vom Boden abheben und langsam seitlich vom Kopf in Richtung Hüfte führen. Den Nacken lang halten und ohne Schwung arbeiten.',
 'away:superman':'In Bauchlage die Arme nach vorne strecken. Ellenbogen kontrolliert zu den Rippen ziehen und die Arme wieder strecken. Den unteren Rücken nicht stark überstrecken.',
 'away:narrow':'Hände enger als bei normalen Liegestützen aufsetzen. Körper gerade und Ellenbogen nah am Oberkörper halten. Bei Bedarf auf den Knien ausführen.',
 'away:curls':'Mit einer Hand gegen den Unterarm der anderen drücken. Den arbeitenden Arm langsam gegen diesen Widerstand beugen und strecken. Beide Seiten trainieren.',
 'away:legs':'Auf den Rücken legen, Fersen auf ein Handtuch auf glattem Boden. Hüfte anheben und Fersen langsam zum Gesäß ziehen. Auf rutschfeste, sichere Umgebung achten.',
 'away:split':'Hinteren Fuß auf einer stabilen niedrigen Auflage ablegen. Vorderes Bein kontrolliert beugen und strecken. Wiederholungen je Bein erfassen.',
 'neck:curl':'Zunächst ohne Zusatzgewicht. Kopf langsam und in einem kleinen, angenehmen Bewegungsumfang nach vorne beugen. Nicht ruckartig bewegen oder mit den Händen ziehen.',
 'neck:extension':'Zunächst ohne Zusatzgewicht. Kopf kontrolliert leicht nach hinten führen, ohne ihn weit in den Nacken zu legen. Bei Schmerzen oder Schwindel abbrechen.',
 'neck:side':'Kopf langsam zur Seite neigen, ohne die Schulter hochzuziehen oder mit der Hand zu ziehen. Beide Seiten trainieren; zunächst ohne Zusatzgewicht.',
 'foot:short-foot':'Ferse und Vorfuß bleiben am Boden. Fußgewölbe leicht anheben, ohne die Zehen zu krallen. Wiederholungen je Fuß erfassen.',
 'foot:balance':'Auf einem Bein stehen und das Becken ruhig halten. Eine feste Stütze in Reichweite lassen. Zeit je Seite erfassen.',
 'foot:calf':'Fersen langsam anheben und kontrolliert absenken. Gewicht gleichmäßig über dem Vorfuß verteilen; bei Bedarf leicht festhalten.',
 'athletic:ladder':'Mit Bodenlinien oder einer Koordinationsleiter schnelle, kurze und kontrollierte Schritte ausführen. Saubere Fußarbeit geht vor Geschwindigkeit.',
 'athletic:shuffle':'Mit leicht gebeugten Knien seitlich bewegen. Füße nicht überkreuzen und den Oberkörper stabil halten.',
 'athletic:balance':'Auf einem Bein stehen und aus der Hüfte nach vorne neigen, während das freie Bein nach hinten geht. Langsam aufrichten. Wiederholungen je Seite erfassen.',
 'athletic:sprint':'Auf freier, ebener Strecke über 10 Meter beschleunigen. Zunächst bei 60–70 % Tempo laufen und kontrolliert auslaufen.'
};
const allExercises=[home,away,neck,foot,athletic].flatMap(g=>g.exercises);
export function getExercise(id) {
 const exercise=allExercises.find(e=>e.id===id);
 if(!exercise)throw new RangeError('Unbekannte Übung');
 return {...exercise,instructions:instructions[id]};
}
export function exerciseSettings(id) {
 const exercise=getExercise(id);
 const match=exercise.prescription.match(/^(\d+)(?:–(\d+))? ×/);
 return {minSets:Number(match[1]),maxSets:Number(match[2]??match[1]),metric:exercise.prescription.includes('Sek.')?'seconds':id==='athletic:sprint'?'meters':'reps',weighted:id.startsWith('home:')};
}
