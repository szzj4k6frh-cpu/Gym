(() => {
  // src/native-bridge.js
  function send(message) {
    try {
      globalThis.window?.webkit?.messageHandlers?.gymRest?.postMessage(message);
    } catch {
    }
  }
  function notifyRestStarted(deadlineMs, durationSeconds) {
    send({ action: "start", deadlineMs, durationSeconds });
  }
  function notifyRestStopped() {
    send({ action: "stop" });
  }

  // src/plan.js
  function group(id, title, note, rows) {
    return { id, title, note, exercises: rows.map(([key, name, prescription, hint]) => ({ id: `${id}:${key}`, name, prescription, ...hint ? { hint } : {} })) };
  }
  var home = group("home", "Gym", "2–3 Min. Pause", [
    ["press", "Kurzhantel-Schulterdrücken", "2–3 × 6–10"],
    ["lateral", "Seitheben", "2 × 10–15"],
    ["butterfly", "Butterfly", "2–3 × 6–10"],
    ["lat", "Enger Latzug", "2–3 × 6–10"],
    ["row", "Sitzendes Kabelrudern", "2–3 × 6–10"],
    ["triceps", "Trizeps-Pushdowns", "2–3 × 6–10"],
    ["curls", "Preacher Curls", "2–3 × 6–10"],
    ["legs", "Stehender Beinbeuger (einbeinig)", "2–3 × 6–10 je Bein"],
    ["squat", "Goblet Squats", "2–3 × 6–10"]
  ]), away = group("away", "Calisthenics", "2–3 Min. Pause", [
    ["pike", "Pike Push-ups", "2–3 × 6–12"],
    ["wide", "Breite Liegestütze", "2–3 × 8–15"],
    ["angels", "Reverse Snow Angels (Rücken)", "2–3 × 12–15"],
    ["superman", "Superman Pulls (Rücken)", "2–3 × 10–15"],
    ["narrow", "Enge Liegestütze (Trizeps)", "2–3 × 6–12"],
    ["curls", "Selbstwiderstands-Curls (Bizeps)", "2–3 × 10–15"],
    ["legs", "Sliding Leg Curls (Handtuch)", "2–3 × 8–12"],
    ["split", "Bulgarian Split Squats", "2–3 × 8–12 je Bein"]
  ]), neck = group("neck", "Nacken", "5–10 Min. · zunächst ohne Zusatzgewicht", [
    ["curl", "Neck Curls", "2 × 15"],
    ["extension", "Neck Extensions", "2 × 15"],
    ["side", "Seitliches Halsheben", "2 × 15 je Seite"]
  ]), foot = group("foot", "Fußgewölbe", "Ca. 5 Min.", [
    ["short-foot", "Short Foot", "2 × 10 je Fuß", "Fußgewölbe leicht anheben, ohne die Zehen zu krallen."],
    ["balance", "Einbeinstand", "2 × 30 Sek. je Seite"],
    ["calf", "Wadenheben", "2 × 15", "Gewicht gleichmäßig über dem Vorfuß."]
  ]), athletic = group("athletic", "Athletik & Koordination", "Ca. 10 Min.", [
    ["ladder", "Koordinationsleiter / Bodenlinien", "3 × 30 Sek.", "Schnelle, kontrollierte Schritte."],
    ["shuffle", "Seitliche Shuffle-Schritte", "3 × 20 Sek."],
    ["balance", "Einbeinige Standwaage", "2 × 8 je Seite"],
    ["sprint", "Kurze Antritte", "4 × 10 m", "Zunächst bei 60–70 % Tempo."]
  ]);
  function getGroups(day, variant = "home") {
    let gym = variant === "away" ? away : home;
    return day === 0 || day === 2 ? [gym, neck, foot] : day === 1 ? [foot] : day === 4 ? [gym, athletic] : [];
  }
  var instructions = {
    "home:press": "Kurzhanteln auf Schulterhöhe halten. Bauch anspannen und die Hanteln kontrolliert nach oben drücken, ohne ins Hohlkreuz auszuweichen. Gewicht je Hantel eintragen.",
    "home:lateral": "Arme leicht beugen und die Hanteln seitlich etwa bis Schulterhöhe anheben. Ohne Schwung kontrolliert absenken. Gewicht je Hantel eintragen.",
    "home:butterfly": "Rücken an die Lehne legen. Arme vor der Brust zusammenführen und langsam öffnen; Schultern nicht nach vorne ziehen.",
    "home:lat": "Aufrecht sitzen. Stange vor dem Körper zum oberen Brustbereich ziehen. Ellenbogen nach unten führen, den Oberkörper ruhig halten.",
    "home:row": "Aufrecht sitzen, Rücken ruhig halten. Griff zum Bauch ziehen und die Ellenbogen nach hinten führen. Kontrolliert zurückführen.",
    "home:triceps": "Ellenbogen am Körper lassen. Griff nach unten drücken, indem du die Arme streckst. Nur die Unterarme bewegen, anschließend langsam zurückführen.",
    "home:curls": "Oberarme auf dem Bizepspult ablegen. Arme kontrolliert beugen und wieder senken, ohne das Gewicht fallen zu lassen.",
    "home:legs": "Zum Gerät stehen und an den Griffen festhalten. Polster nahe dem Knöchel positionieren. Ferse zum Gesäß führen, ohne die Hüfte zu bewegen. Wiederholungen je Bein erfassen.",
    "home:squat": "Eine Hantel vor der Brust halten. Knie in Richtung der Fußspitzen führen, kontrolliert in die Kniebeuge gehen und wieder aufrichten.",
    "away:pike": "Aus einer hohen Hüftposition die Ellenbogen beugen und den Kopf kontrolliert zum Boden zwischen die Hände führen. Wieder hochdrücken; nur so tief gehen, wie du die Bewegung kontrollieren kannst.",
    "away:wide": "Hände etwas weiter als schulterbreit aufsetzen. Körper in einer Linie halten, Brust kontrolliert absenken und wieder hochdrücken.",
    "away:angels": "In Bauchlage die Arme leicht vom Boden abheben und langsam seitlich vom Kopf in Richtung Hüfte führen. Den Nacken lang halten und ohne Schwung arbeiten.",
    "away:superman": "In Bauchlage die Arme nach vorne strecken. Ellenbogen kontrolliert zu den Rippen ziehen und die Arme wieder strecken. Den unteren Rücken nicht stark überstrecken.",
    "away:narrow": "Hände enger als bei normalen Liegestützen aufsetzen. Körper gerade und Ellenbogen nah am Oberkörper halten. Bei Bedarf auf den Knien ausführen.",
    "away:curls": "Mit einer Hand gegen den Unterarm der anderen drücken. Den arbeitenden Arm langsam gegen diesen Widerstand beugen und strecken. Beide Seiten trainieren.",
    "away:legs": "Auf den Rücken legen, Fersen auf ein Handtuch auf glattem Boden. Hüfte anheben und Fersen langsam zum Gesäß ziehen. Auf rutschfeste, sichere Umgebung achten.",
    "away:split": "Hinteren Fuß auf einer stabilen niedrigen Auflage ablegen. Vorderes Bein kontrolliert beugen und strecken. Wiederholungen je Bein erfassen.",
    "neck:curl": "Zunächst ohne Zusatzgewicht. Kopf langsam und in einem kleinen, angenehmen Bewegungsumfang nach vorne beugen. Nicht ruckartig bewegen oder mit den Händen ziehen.",
    "neck:extension": "Zunächst ohne Zusatzgewicht. Kopf kontrolliert leicht nach hinten führen, ohne ihn weit in den Nacken zu legen. Bei Schmerzen oder Schwindel abbrechen.",
    "neck:side": "Kopf langsam zur Seite neigen, ohne die Schulter hochzuziehen oder mit der Hand zu ziehen. Beide Seiten trainieren; zunächst ohne Zusatzgewicht.",
    "foot:short-foot": "Ferse und Vorfuß bleiben am Boden. Fußgewölbe leicht anheben, ohne die Zehen zu krallen. Wiederholungen je Fuß erfassen.",
    "foot:balance": "Auf einem Bein stehen und das Becken ruhig halten. Eine feste Stütze in Reichweite lassen. Zeit je Seite erfassen.",
    "foot:calf": "Fersen langsam anheben und kontrolliert absenken. Gewicht gleichmäßig über dem Vorfuß verteilen; bei Bedarf leicht festhalten.",
    "athletic:ladder": "Mit Bodenlinien oder einer Koordinationsleiter schnelle, kurze und kontrollierte Schritte ausführen. Saubere Fußarbeit geht vor Geschwindigkeit.",
    "athletic:shuffle": "Mit leicht gebeugten Knien seitlich bewegen. Füße nicht überkreuzen und den Oberkörper stabil halten.",
    "athletic:balance": "Auf einem Bein stehen und aus der Hüfte nach vorne neigen, während das freie Bein nach hinten geht. Langsam aufrichten. Wiederholungen je Seite erfassen.",
    "athletic:sprint": "Auf freier, ebener Strecke über 10 Meter beschleunigen. Zunächst bei 60–70 % Tempo laufen und kontrolliert auslaufen."
  }, allExercises = [home, away, neck, foot, athletic].flatMap((g) => g.exercises);
  function getExercise(id) {
    let exercise = allExercises.find((e) => e.id === id);
    if (!exercise) throw new RangeError("Unbekannte Übung");
    return { ...exercise, instructions: instructions[id] };
  }
  function exerciseSettings(id) {
    let exercise = getExercise(id), match = exercise.prescription.match(/^(\d+)(?:–(\d+))? ×/);
    return { minSets: Number(match[1]), maxSets: Number(match[2] ?? match[1]), metric: exercise.prescription.includes("Sek.") ? "seconds" : id === "athletic:sprint" ? "meters" : "reps", weighted: id.startsWith("home:") };
  }

  // src/dates.js
  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function parseDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new RangeError("Ungültiges Datum");
    let [y, m, d] = key.split("-").map(Number), result = new Date(y, m - 1, d, 12);
    if (dateKey(result) !== key) throw new RangeError("Ungültiges Datum");
    return result;
  }
  var weekday = (date) => (date.getDay() + 6) % 7;
  function addDays(date, count) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count, 12);
  }
  function weekDates(date) {
    return Array.from({ length: 7 }, (_, i) => addDays(date, i - weekday(date)));
  }

  // src/exercise-view.js
  var number = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
  function el(tag, className, text) {
    let node2 = document.createElement(tag);
    return className && (node2.className = className), text !== void 0 && (node2.textContent = text), node2;
  }
  function guardInvalid(card) {
    let input = card.querySelector('input[aria-invalid="true"]');
    return input ? (input.focus(), input.reportValidity(), !0) : !1;
  }
  function formatSet(set) {
    let parts = [];
    return set.weight !== null && parts.push(`${number.format(set.weight)} kg`), set.reps !== null && parts.push(`${set.reps} Wdh.`), set.seconds !== null && parts.push(`${number.format(set.seconds)} Sek.`), set.meters !== null && parts.push(`${number.format(set.meters)} m`), parts.join(" · ");
  }
  function exerciseView({ exercise, date, store: store2, expanded: expanded2, onChange, onSetDone }) {
    let day = store2.getDay(date), settings = exerciseSettings(exercise.id), sets = store2.getSets(date, exercise.id), card = el("article", "exercise" + (day.done[exercise.id] ? " is-done" : "")), complete = el("button", "tick exercise-toggle", day.done[exercise.id] ? "✓" : "");
    complete.id = `exercise-${exercise.id}`, complete.setAttribute("aria-label", `Übung abschließen: ${exercise.name}`), complete.setAttribute("aria-pressed", String(!!day.done[exercise.id])), complete.onclick = () => {
      guardInvalid(card) || (store2.toggle(date, exercise.id), onChange());
    }, card.append(complete);
    let details = el("details", "exercise-details");
    details.open = expanded2.has(exercise.id), details.ontoggle = () => {
      details.open ? expanded2.add(exercise.id) : expanded2.delete(exercise.id);
    };
    let summary = el("summary", "exercise-summary");
    summary.append(el("span", "exercise-name", exercise.name), el("span", "prescription", exercise.prescription), el("span", "expand-mark", "⌄")), details.append(summary);
    let body = el("div", "exercise-body"), previous = store2.lastResults(date, exercise.id);
    if (previous) {
      let text = el("p", "last-results", `Zuletzt (${new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "numeric" }).format(parseDateKey(previous.date))}): ${previous.sets.map(formatSet).filter(Boolean).join(" / ")}`);
      body.append(text);
    }
    let grid = el("div", "set-grid");
    if (sets.forEach((set, index) => {
      let row = el("div", "set-row");
      row.append(el("span", "set-number", `${index + 1}`));
      let metric = settings.metric;
      for (let field of [...settings.weighted ? ["weight"] : [], metric]) {
        let labels = { weight: "Gewicht", reps: "Wiederholungen", seconds: "Sekunden", meters: "Meter" }, wrap = el("label", "set-field"), label = el("span", "field-label", field === "weight" ? "kg" : field === "reps" ? "Wdh." : field === "seconds" ? "Sek." : "m"), input = el("input");
        input.type = "text", input.inputMode = field === "reps" ? "numeric" : "decimal", input.autocomplete = "off", input.id = `set-${exercise.id}-${index}-${field}`, input.setAttribute("aria-label", `${labels[field]} Satz ${index + 1}`), input.value = set[field] === null ? "" : String(set[field]).replace(".", ","), input.placeholder = "—", input.oninput = () => {
          let raw = input.value.trim().replace(",", ".");
          if (!(raw === "" || /^\d+(?:\.\d*)?$/.test(raw))) {
            input.setAttribute("aria-invalid", "true"), input.setCustomValidity("Bitte eine gültige Zahl eingeben.");
            return;
          }
          try {
            store2.updateSet(date, exercise.id, index, { [field]: raw === "" ? null : Number(raw) }), input.removeAttribute("aria-invalid"), input.setCustomValidity(""), onChange(!1);
          } catch {
            input.setAttribute("aria-invalid", "true"), input.setCustomValidity("Bitte eine gültige Zahl eingeben.");
          }
        }, wrap.append(label, input), row.append(wrap);
      }
      let tick = el("button", "set-tick", set.done ? "✓" : "");
      tick.id = `set-${exercise.id}-${index}-done`, tick.setAttribute("aria-label", `Satz ${index + 1} abschließen`), tick.setAttribute("aria-pressed", String(set.done)), tick.onclick = () => {
        guardInvalid(card) || (store2.updateSet(date, exercise.id, index, { done: !set.done }), set.done || onSetDone(), onChange());
      }, row.append(tick), grid.append(row);
    }), body.append(grid), settings.maxSets > settings.minSets) {
      let extra = el("button", "extra-set", sets.length < settings.maxSets ? "+ Dritter Satz" : "− Dritten Satz entfernen");
      extra.setAttribute("aria-label", sets.length < settings.maxSets ? "Dritten Satz hinzufügen" : "Dritten Satz entfernen"), extra.onclick = () => {
        if (guardInvalid(card)) return;
        let removing = sets.length === settings.maxSets, last = sets.at(-1);
        removing && (last.done || [last.weight, last.reps, last.seconds, last.meters].some((v) => v !== null)) && !confirm("Dritten Satz mit seinen Einträgen entfernen?") || (store2.setCount(date, exercise.id, removing ? settings.minSets : settings.maxSets), onChange());
      }, body.append(extra);
    }
    let help = el("details", "exercise-help"), helpTitle = el("summary", "", "Ausführung");
    return help.open = expanded2.has(`${exercise.id}:help`), help.ontoggle = () => {
      help.open ? expanded2.add(`${exercise.id}:help`) : expanded2.delete(`${exercise.id}:help`);
    }, help.append(helpTitle, el("p", "", getExercise(exercise.id).instructions)), body.append(help), details.append(body), card.append(details), card;
  }

  // src/timer.js
  var KEY = "gym-rest:v1", validDuration = (value) => Number.isFinite(value) && value > 0 && value <= 3600;
  function createTimer(now = () => Date.now(), storage = null) {
    let deadline = null, duration = 120;
    try {
      let raw = storage?.getItem(KEY);
      if (raw) {
        let saved = JSON.parse(raw);
        saved.version === 1 && validDuration(saved.duration) && (saved.deadline === null || Number.isFinite(saved.deadline) && saved.deadline > 0 && saved.deadline <= now() + 36e5) && (deadline = saved.deadline, duration = saved.duration);
      }
    } catch {
    }
    function save() {
      try {
        storage?.setItem(KEY, JSON.stringify({ version: 1, deadline, duration }));
      } catch {
      }
    }
    return {
      getDuration: () => duration,
      getDeadline: () => deadline,
      setDuration(seconds) {
        if (!validDuration(seconds)) throw RangeError("Pausendauer");
        duration = seconds, save();
      },
      start(seconds = duration) {
        if (!validDuration(seconds)) throw RangeError("Pausendauer");
        duration = seconds, deadline = now() + seconds * 1e3, save();
      },
      stop() {
        deadline = null, save();
      },
      remaining() {
        return deadline === null ? null : Math.max(0, Math.ceil((deadline - now()) / 1e3));
      }
    };
  }

  // src/storage.js
  var KEY2 = "gym-training:v2", LEGACY = "gym-training:v1", empty = () => ({ variant: "home", done: {}, logs: {} }), blankSet = () => ({ weight: null, reps: null, seconds: null, meters: null, done: !1 }), object = (value) => value !== null && typeof value == "object" && !Array.isArray(value), validId = (id) => /^(home|away|neck|foot|athletic):[a-z-]+$/.test(id);
  function validSet(set) {
    if (!object(set) || typeof set.done != "boolean") return !1;
    let limits = { weight: 2e3, reps: 1e4, seconds: 86400, meters: 1e5 };
    return Object.keys(set).every((k) => k === "done" || k in limits) && Object.entries(limits).every(([key, max]) => set[key] === null || typeof set[key] == "number" && Number.isFinite(set[key]) && set[key] >= 0 && set[key] <= max && (key !== "reps" || Number.isInteger(set[key])));
  }
  function validate(data, version) {
    if (!object(data) || data.version !== version || !object(data.days)) throw Error("schema");
    for (let [key, day] of Object.entries(data.days)) {
      if (parseDateKey(key), !object(day) || !["home", "away"].includes(day.variant) || !object(day.done)) throw Error("day");
      for (let [id, value] of Object.entries(day.done)) if (!validId(id) || value !== !0) throw Error("exercise");
      if (version === 2) {
        if (!object(day.logs)) throw Error("logs");
        for (let [id, sets] of Object.entries(day.logs)) {
          let { minSets, maxSets } = exerciseSettings(id);
          if (!Array.isArray(sets) || sets.length < minSets || sets.length > maxSets || !sets.every(validSet)) throw Error("sets");
          if (sets.every((set) => set.done) !== !!day.done[id]) throw Error("completion");
        }
      }
    }
    return data;
  }
  function createStore(storage) {
    let data = { version: 2, days: {} }, warning = null, enabled = !0, fallback = () => {
      enabled = !1, warning = "Speicherung nicht verfügbar. Änderungen bleiben nur in dieser Sitzung erhalten. Vorhandene Daten werden nicht überschrieben.";
    };
    try {
      let raw = storage.getItem(KEY2);
      if (raw !== null) data = validate(JSON.parse(raw), 2);
      else {
        let old = storage.getItem(LEGACY);
        if (old !== null) {
          let parsed = validate(JSON.parse(old), 1);
          data.days = Object.fromEntries(Object.entries(parsed.days).map(([key, day]) => [key, { ...day, logs: {} }]));
        }
      }
    } catch {
      fallback();
    }
    function getDay(key) {
      return parseDateKey(key), structuredClone(data.days[key] ?? empty());
    }
    function change(key, update) {
      let day = getDay(key);
      if (update(day), data.days[key] = day, enabled) try {
        storage.setItem(KEY2, JSON.stringify(data));
      } catch {
        fallback();
      }
      return getDay(key);
    }
    function setsFor(day, id) {
      return day.logs[id] ?? Array.from({ length: exerciseSettings(id).minSets }, () => ({ ...blankSet(), done: !!day.done[id] }));
    }
    function sync(day, id) {
      day.logs[id].every((s) => s.done) ? day.done[id] = !0 : delete day.done[id];
    }
    return {
      getDay,
      getWarning: () => warning,
      getSets: (key, id) => structuredClone(setsFor(getDay(key), id)),
      setVariant: (key, variant) => {
        if (!["home", "away"].includes(variant)) throw Error("variant");
        return change(key, (day) => {
          day.variant = variant;
        });
      },
      toggle: (key, id) => {
        if (!validId(id)) throw Error("exercise");
        return change(key, (day) => {
          let checked = !day.done[id];
          checked ? day.done[id] = !0 : delete day.done[id], day.logs[id] && day.logs[id].forEach((s) => {
            s.done = checked;
          });
        });
      },
      updateSet: (key, id, index, patch) => change(key, (day) => {
        let sets = setsFor(day, id);
        if (!Number.isInteger(index) || index < 0 || index >= sets.length) throw RangeError("Satz");
        let next = { ...sets[index], ...patch };
        if (!validSet(next)) throw RangeError("Ungültiger Satzwert");
        sets[index] = next, day.logs[id] = sets, sync(day, id);
      }),
      setCount: (key, id, count) => change(key, (day) => {
        let { minSets, maxSets } = exerciseSettings(id);
        if (!Number.isInteger(count) || count < minSets || count > maxSets) throw RangeError("Satzanzahl");
        let sets = setsFor(day, id);
        day.logs[id] = Array.from({ length: count }, (_, i) => sets[i] ?? blankSet()), sync(day, id);
      }),
      lastResults: (key, id) => {
        parseDateKey(key);
        for (let date of Object.keys(data.days).filter((d) => d < key).sort().reverse()) {
          let sets = data.days[date].logs[id]?.filter((s) => s.done && [s.weight, s.reps, s.seconds, s.meters].some((v) => v !== null));
          if (sets?.length) return { date, sets: structuredClone(sets) };
        }
        return null;
      },
      resetDay: (key) => change(key, (day) => {
        day.done = {}, day.logs = {};
      })
    };
  }

  // src/app.js
  var $ = (id) => document.getElementById(id), store = createStore({ getItem: (key) => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) }), selected = dateKey(/* @__PURE__ */ new Date()), lastToday = selected, expanded = /* @__PURE__ */ new Set(), timer = createTimer(() => Date.now(), { getItem: (key) => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) }), longDate = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" }), shortDate = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }), dayName = new Intl.DateTimeFormat("de-DE", { weekday: "long" });
  function node(tag, className, text) {
    let el2 = document.createElement(tag);
    return className && (el2.className = className), text !== void 0 && (el2.textContent = text), el2;
  }
  function refresh(full = !0) {
    full ? render() : ($("warning").textContent = store.getWarning() ?? "", $("warning").hidden = !store.getWarning());
  }
  function render() {
    let focus = document.activeElement?.id, date = parseDateKey(selected), today = dateKey(/* @__PURE__ */ new Date()), day = store.getDay(selected), groups = getGroups(weekday(date), day.variant), week = weekDates(date);
    $("week-label").textContent = `${shortDate.format(week[0])} – ${shortDate.format(week[6])} ${week[6].getFullYear()}`, $("days").replaceChildren(...week.map((d) => {
      let key = dateKey(d), b = node("button", "day" + (key === today ? " is-today" : ""));
      return b.id = `day-${key}`, b.setAttribute("aria-pressed", String(key === selected)), b.setAttribute("aria-label", `${dayName.format(d)}, ${longDate.format(d)} ${d.getFullYear()}`), b.append(node("span", "", dayName.format(d).slice(0, 2)), node("strong", "", String(d.getDate()))), b.onclick = () => {
        selected = key, lastToday = dateKey(/* @__PURE__ */ new Date()), render();
      }, b;
    })), $("date-label").textContent = `${selected === today ? "HEUTE · " : ""}${dayName.format(date)} · ${date.getFullYear()}`, $("selected-date").textContent = longDate.format(date);
    let exercises = groups.flatMap((g) => g.exercises), complete = exercises.filter((e) => day.done[e.id]).length;
    $("counter").textContent = exercises.length ? `${complete} / ${exercises.length}` : "Ruhetag", $("progress-wrap").hidden = !exercises.length, $("progress").value = exercises.length ? complete / exercises.length : 0, $("variants").hidden = !groups.some((g) => g.id === "home" || g.id === "away");
    for (let variant of ["home", "away"]) $(variant).setAttribute("aria-pressed", String(day.variant === variant));
    if ($("warning").textContent = store.getWarning() ?? "", $("warning").hidden = !store.getWarning(), $("content").replaceChildren(...groups.map((g) => {
      let section = node("section", "group"), head = node("div", "section-head");
      head.append(node("h3", "", g.title), node("p", "", g.note)), section.append(head);
      for (let exercise of g.exercises) section.append(exerciseView({ exercise, date: selected, store, expanded, onChange: refresh, onSetDone: () => startTimer() }));
      return section;
    })), !exercises.length) {
      let rest = node("section", "rest");
      rest.append(node("p", "rest-icon", "↟"), node("h3", "", "Regeneration / Fußball")), $("content").append(rest);
    }
    $("reset").hidden = !exercises.length, focus && document.getElementById(focus)?.focus({ preventScroll: !0 });
  }
  for (let [id, offset] of [["previous", -7], ["next", 7]]) $(id).onclick = () => {
    selected = dateKey(addDays(parseDateKey(selected), offset)), lastToday = dateKey(/* @__PURE__ */ new Date()), render();
  };
  $("today").onclick = () => {
    selected = dateKey(/* @__PURE__ */ new Date()), lastToday = selected, render();
  };
  for (let variant of ["home", "away"]) $(variant).onclick = () => {
    store.setVariant(selected, variant), render();
  };
  $("reset").onclick = () => {
    confirm(`Alle Häkchen und Satzwerte (Gewichte, Wiederholungen und Zeiten) am ${longDate.format(parseDateKey(selected))} ${parseDateKey(selected).getFullYear()} zurücksetzen? Das gilt für Zuhause und Unterwegs.`) && (store.resetDay(selected), render());
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateTimer();
      let now = dateKey(/* @__PURE__ */ new Date());
      selected === lastToday && (selected = now), lastToday = now, render();
    }
  });
  function updateTimer() {
    let remaining = timer.remaining();
    $("timer-output").textContent = remaining === null ? "—" : remaining === 0 ? "Pause beendet" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`, $("timer-stop").hidden = remaining === null;
    for (let seconds of [120, 180]) $(`timer-${seconds}`).setAttribute("aria-pressed", String(timer.getDuration() === seconds));
  }
  function startTimer() {
    timer.start(), notifyRestStarted(timer.getDeadline(), timer.getDuration()), updateTimer();
  }
  for (let seconds of [120, 180]) $(`timer-${seconds}`).onclick = () => {
    timer.setDuration(seconds), updateTimer();
  };
  $("timer-stop").onclick = () => {
    timer.stop(), notifyRestStopped(), updateTimer();
  };
  setInterval(updateTimer, 250);
  updateTimer();
  render();
})();
