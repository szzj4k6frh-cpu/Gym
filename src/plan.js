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
