/*
  Daily Routine Game
  Static JavaScript only: no backend, build tools, or external libraries.
*/

// ---------- Easy-to-edit game data ----------
// To change the routine cards later, edit this list. Cards stay numbered 1-24, and each card has a fixed point value from 1-5.
const ROUTINE_CARDS = [
  { number: 1, phrase: "eaten breakfast", points: 3 },
  { number: 2, phrase: "eaten lunch", points: 1 },
  { number: 3, phrase: "eaten dinner", points: 5 },
  { number: 4, phrase: "taken a bath", points: 2 },
  { number: 5, phrase: "taken a shower", points: 4 },
  { number: 6, phrase: "gone to school", points: 1 },
  { number: 7, phrase: "left my house", points: 3 },
  { number: 8, phrase: "returned home", points: 5 },
  { number: 9, phrase: "woken up", points: 2 },
  { number: 10, phrase: "gone to bed", points: 4 },
  { number: 11, phrase: "brushed my teeth", points: 1 },
  { number: 12, phrase: "washed my face", points: 5 },
  { number: 13, phrase: "changed my clothes", points: 3 },
  { number: 14, phrase: "packed my bag", points: 2 },
  { number: 15, phrase: "finished my homework", points: 4 },
  { number: 16, phrase: "studied English", points: 1 },
  { number: 17, phrase: "studied math", points: 5 },
  { number: 18, phrase: "read a book", points: 2 },
  { number: 19, phrase: "watched TV", points: 3 },
  { number: 20, phrase: "played a game", points: 4 },
  { number: 21, phrase: "used my phone", points: 1 },
  { number: 22, phrase: "cleaned my room", points: 5 },
  { number: 23, phrase: "gone to club activities", points: 2 },
  { number: 24, phrase: "practiced sports", points: 3 }
];

// ---------- Animation timing constants ----------
// Keep these values easy to edit. New Turn generates a result only; scoring happens after the student writes their sentence.
const TIME_ROLL_DURATION = 1100;
const COIN_FLIP_DURATION = 900;
const CARD_SHUFFLE_DURATION = 1100;
const QUICK_ANIMATION_DURATION = 450;
const BETWEEN_ANIMATION_PAUSE = 350;

const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const APPEARANCE_STORAGE_KEY = "dailyRoutineGameAppearance";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Page elements ----------
const elements = {
  turnNumber: document.querySelector("#turnNumber"),
  timePanel: document.querySelector("#timePanel"),
  coinPanel: document.querySelector("#coinPanel"),
  cardPanel: document.querySelector("#cardPanel"),
  timeResult: document.querySelector("#timeResult"),
  ampmResult: document.querySelector("#ampmResult"),
  timeModeNote: document.querySelector("#timeModeNote"),
  diceDisplay: document.querySelector("#diceDisplay"),
  firstDie: document.querySelector(".die"),
  secondDie: document.querySelector(".second-die"),
  coin: document.querySelector("#coin"),
  coinText: document.querySelector("#coinText"),
  deckButton: document.querySelector("#deckButton"),
  deck: document.querySelector("#deck"),
  routineCard: document.querySelector("#routineCard"),
  cardNumber: document.querySelector("#cardNumber"),
  routinePhrase: document.querySelector("#routinePhrase"),
  cardPoints: document.querySelector("#cardPoints"),
  deckCount: document.querySelector("#deckCount"),
  sentenceHints: document.querySelector("#sentenceHints"),
  hintYet: document.querySelector("#hintYet"),
  hintAlready: document.querySelector("#hintAlready"),
  hintJust: document.querySelector("#hintJust"),
  thisTurnPoints: document.querySelector("#thisTurnPoints"),
  totalPoints: document.querySelector("#totalPoints"),
  scorePop: document.querySelector("#scorePop"),
  finishedPanel: document.querySelector("#finishedPanel"),
  finishedTotal: document.querySelector("#finishedTotal"),
  historyPanel: document.querySelector(".history-panel"),
  historyToggle: document.querySelector("#historyToggle"),
  historyToggleText: document.querySelector("#historyToggleText"),
  historyBody: document.querySelector("#historyBody"),
  historyCount: document.querySelector("#historyCount"),
  latestHistory: document.querySelector("#latestHistory"),
  historyList: document.querySelector("#historyList"),
  scheduleButton: document.querySelector("#scheduleButton"),
  settingsMenu: document.querySelector("#settingsMenu"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsDropdown: document.querySelector("#settingsDropdown"),
  settingsForm: document.querySelector("#settingsForm"),
  newTurnButton: document.querySelector("#newTurnButton"),
  rollTimeButton: document.querySelector("#rollTimeButton"),
  flipAmpmButton: document.querySelector("#flipAmpmButton"),
  drawCardButton: document.querySelector("#drawCardButton"),
  addPointsButton: document.querySelector("#addPointsButton"),
  resetButton: document.querySelector("#resetButton"),
  deckModal: document.querySelector("#deckModal"),
  deckViewerContent: document.querySelector("#deckViewerContent"),
  closeDeckModal: document.querySelector("#closeDeckModal"),
  scheduleModal: document.querySelector("#scheduleModal"),
  scheduleContent: document.querySelector("#scheduleContent"),
  closeScheduleModal: document.querySelector("#closeScheduleModal")
};

const gameplayButtons = [
  elements.newTurnButton,
  elements.rollTimeButton,
  elements.flipAmpmButton,
  elements.drawCardButton
];

const hintData = [
  { element: elements.hintYet, keyword: "yet", buildSentence: (phrase) => `I haven’t ${phrase} yet.` },
  { element: elements.hintAlready, keyword: "already", buildSentence: (phrase) => `I have already ${phrase}.` },
  { element: elements.hintJust, keyword: "just", buildSentence: (phrase) => `I have just ${phrase}.` }
];

// ---------- Game state for this browser session ----------
let state = getFreshState();

function getFreshState() {
  return {
    time: "--:--",
    hour: null,
    minute: "00",
    ampm: "AM/PM",
    card: null,
    thisTurnPoints: 0,
    totalPoints: 0,
    turn: 0,
    history: [],
    deck: [],
    usedCards: [],
    isAnimating: false,
    currentResultSaved: true,
    historyExpanded: false
  };
}

// ---------- Small helper functions ----------
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function shouldAnimate() {
  return getSetting("animations") === "on" && !prefersReducedMotion;
}

function animationTime(duration) {
  return shouldAnimate() ? duration : 0;
}

function getSetting(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function setSetting(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) {
    input.checked = true;
  }
}

function getRoundLimit() {
  const value = getSetting("roundLimit");
  return value === "none" ? null : Number(value || 12);
}

function isRoundFinished() {
  const limit = getRoundLimit();
  return limit !== null && state.turn >= limit;
}

function setButtonsDisabled(disabled) {
  gameplayButtons.forEach((button) => {
    button.disabled = disabled || isRoundFinished();
  });
  updateAddPointsButton();
}

function setActiveStep(panel, isActive) {
  panel.classList.toggle("active-step", isActive && shouldAnimate());
}

function setSettingsOpen(isOpen) {
  elements.settingsDropdown.hidden = !isOpen;
  elements.settingsButton.setAttribute("aria-expanded", String(isOpen));
}

function formatPoints(points) {
  return `${points} ${points === 1 ? "point" : "points"}`;
}

function getRandomMinute() {
  return getSetting("minuteMode") === "random" ? MINUTES[randomInt(0, MINUTES.length - 1)] : "00";
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ensureDeck() {
  if (state.deck.length === 0) {
    state.usedCards = [];
    state.deck = shuffleArray(ROUTINE_CARDS);
  }
}

function resetDeckState() {
  state.deck = [];
  state.usedCards = [];
  if (getSetting("cardMode") === "shuffle") {
    ensureDeck();
  }
  updateDeckCount();
}

function markCurrentResultChanged() {
  if (state.card) {
    state.currentResultSaved = false;
  }
  updateAddPointsButton();
}

function markCurrentResultSaved() {
  state.currentResultSaved = true;
  updateAddPointsButton();
}

function hasFullCurrentResult() {
  return Boolean(state.card && state.hour !== null && (state.ampm === "AM" || state.ampm === "PM"));
}

function updateAddPointsButton() {
  elements.addPointsButton.disabled = state.isAnimating || !hasFullCurrentResult() || state.currentResultSaved || isRoundFinished();
}

function minutesAfterMidnight(time, ampm) {
  const [hourText, minuteText] = time.split(":");
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (ampm === "AM") {
    hour = hour === 12 ? 0 : hour;
  } else {
    hour = hour === 12 ? 12 : hour + 12;
  }

  return hour * 60 + minute;
}

// ---------- Result generation ----------
function generateTimeRoll() {
  const minute = getRandomMinute();

  if (getSetting("timeMode") === "dice") {
    const dieOne = randomInt(1, 6);
    const dieTwo = randomInt(1, 6);
    return {
      hour: dieOne + dieTwo,
      minute,
      dieOne,
      dieTwo,
      note: `Two dice: ${dieOne} + ${dieTwo} = ${dieOne + dieTwo}`
    };
  }

  const hour = randomInt(1, 12);
  return {
    hour,
    minute,
    dieOne: hour,
    dieTwo: null,
    note: "Fair 1–12 time roll"
  };
}

function generateAmpm() {
  return Math.random() < 0.5 ? "AM" : "PM";
}

function generateCard() {
  if (getSetting("cardMode") === "shuffle") {
    ensureDeck();
    const card = state.deck.pop();
    state.usedCards.unshift(card);
    return card;
  }

  return ROUTINE_CARDS[randomInt(0, ROUTINE_CARDS.length - 1)];
}

// ---------- Screen update functions ----------
function updateTimeDisplay(roll) {
  state.hour = roll.hour;
  state.minute = roll.minute;
  state.time = `${roll.hour}:${roll.minute}`;
  elements.timeResult.textContent = state.time;
  elements.timeModeNote.textContent = roll.note;
  elements.firstDie.textContent = roll.dieOne;

  if (roll.dieTwo === null) {
    elements.secondDie.classList.add("is-hidden");
    elements.diceDisplay.setAttribute("aria-label", `Fair 1 to 12 roll: ${roll.hour}`);
  } else {
    elements.secondDie.classList.remove("is-hidden");
    elements.secondDie.textContent = roll.dieTwo;
    elements.diceDisplay.setAttribute("aria-label", `Two dice roll: ${roll.dieOne} and ${roll.dieTwo}`);
  }
}

function updateAmpmDisplay(ampm) {
  state.ampm = ampm;
  elements.ampmResult.textContent = ampm;
  elements.coin.textContent = ampm;
  elements.coinText.textContent = `${ampm} selected`;
}

function updateCardDisplay(card) {
  state.card = card;
  state.thisTurnPoints = card.points;
  elements.cardNumber.textContent = `Card ${card.number}`;
  elements.routinePhrase.textContent = card.phrase;
  elements.cardPoints.textContent = formatPoints(card.points);
  elements.thisTurnPoints.textContent = formatPoints(card.points);
  updateSentenceHints(card.phrase);
  updateDeckCount();
}

function updateSentenceHints(phrase) {
  hintData.forEach((hint) => {
    const phraseElement = hint.element.querySelector(".hint-card-phrase");
    phraseElement.textContent = phrase;
    hint.element.dataset.sentence = hint.buildSentence(phrase);
    setHintRevealed(hint.element, false, hint.keyword);
  });
}

function setHintRevealed(button, isRevealed, keyword) {
  button.classList.toggle("is-revealed", isRevealed);
  button.setAttribute("aria-pressed", String(isRevealed));
  button.setAttribute("aria-label", isRevealed ? `Hide ${keyword} hint: ${button.dataset.sentence}` : `Reveal ${keyword} hint`);
}

function updateDeckCount() {
  if (getSetting("cardMode") === "shuffle") {
    elements.deckCount.textContent = `Shuffle deck: ${state.deck.length} of ${ROUTINE_CARDS.length} cards left. ${state.usedCards.length} used.`;
  } else {
    elements.deckCount.textContent = `Random draw with replacement from ${ROUTINE_CARDS.length} cards`;
  }
}

function updateScoreDisplay() {
  elements.thisTurnPoints.textContent = formatPoints(state.thisTurnPoints);
  elements.totalPoints.textContent = formatPoints(state.totalPoints);
  const limit = getRoundLimit();
  elements.turnNumber.textContent = limit === null ? `Turn ${state.turn}` : `Turn ${state.turn} / ${limit}`;
  elements.finishedTotal.textContent = `Total: ${formatPoints(state.totalPoints)}`;
  updateFinishedState();
  updateAddPointsButton();
}

function updateHintsVisibility() {
  elements.sentenceHints.classList.toggle("is-hidden", getSetting("hints") === "off");
}

function applyAppearance() {
  const appearance = getSetting("appearance");
  document.body.classList.toggle("dark-mode", appearance === "dark");
  localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance || "light");
}

function applyDisplayMode() {
  document.body.classList.toggle("demo-mode", getSetting("displayMode") === "demo");
}

function loadSavedAppearance() {
  const savedAppearance = localStorage.getItem(APPEARANCE_STORAGE_KEY);
  if (savedAppearance === "dark" || savedAppearance === "light") {
    setSetting("appearance", savedAppearance);
  }
  applyAppearance();
}

function updateFinishedState() {
  const finished = isRoundFinished();
  elements.finishedPanel.hidden = !finished;
  gameplayButtons.forEach((button) => {
    button.disabled = state.isAnimating || finished;
  });
  updateAddPointsButton();
}

function renderHistory() {
  elements.historyList.innerHTML = "";
  elements.historyCount.textContent = `${state.history.length} ${state.history.length === 1 ? "turn" : "turns"}`;

  if (state.history.length === 0) {
    elements.latestHistory.textContent = "No completed turns yet.";
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "Completed sentence turns will appear here.";
    elements.historyList.append(empty);
    return;
  }

  const latest = state.history[0];
  elements.latestHistory.textContent = `Latest: Turn ${latest.turn} — ${latest.time} ${latest.ampm}, ${latest.phrase}, ${formatPoints(latest.points)}`;

  state.history.forEach((turn, index) => {
    const item = document.createElement("li");
    if (index === 0) {
      item.classList.add("new-history");
    }
    item.textContent = `Turn ${turn.turn}: ${turn.time} ${turn.ampm}, ${turn.phrase}, ${formatPoints(turn.points)}`;
    elements.historyList.append(item);
  });
}

function addHistoryEntry() {
  state.history.unshift({
    turn: state.turn,
    time: state.time,
    ampm: state.ampm,
    phrase: state.card.phrase,
    points: state.card.points
  });
  renderHistory();
}

function addCurrentPoints() {
  if (!hasFullCurrentResult() || state.currentResultSaved || isRoundFinished()) {
    return;
  }

  state.turn += 1;
  state.totalPoints += state.card.points;
  state.thisTurnPoints = state.card.points;
  updateScoreDisplay();
  animateScore(state.card.points);
  addHistoryEntry();
  markCurrentResultSaved();
  updateFinishedState();
}

function animateScore(points) {
  elements.scorePop.textContent = `+${points}`;
  elements.scorePop.classList.remove("show");
  void elements.scorePop.offsetWidth;
  elements.scorePop.classList.add("show");
}

function setHistoryExpanded(isExpanded) {
  state.historyExpanded = isExpanded;
  elements.historyPanel.classList.toggle("is-collapsed", !isExpanded);
  elements.historyPanel.classList.toggle("is-expanded", isExpanded);
  elements.historyBody.hidden = !isExpanded;
  elements.historyToggle.setAttribute("aria-expanded", String(isExpanded));
  elements.historyToggleText.textContent = isExpanded ? "Collapse" : "Expand";
}

function buildCardList(cards) {
  const list = document.createElement("ol");
  list.className = "card-mini-list";
  cards.forEach((card) => {
    const item = document.createElement("li");
    item.textContent = `${card.number}. ${card.phrase} - ${formatPoints(card.points)}`;
    list.append(item);
  });
  return list;
}

function openDeckViewer() {
  elements.deckViewerContent.innerHTML = "";

  if (getSetting("cardMode") === "shuffle") {
    const remainingTitle = document.createElement("h3");
    remainingTitle.textContent = `Remaining cards (${state.deck.length})`;
    const usedTitle = document.createElement("h3");
    usedTitle.textContent = `Used cards (${state.usedCards.length})`;
    elements.deckViewerContent.append(remainingTitle, buildCardList([...state.deck].sort((a, b) => a.number - b.number)), usedTitle, buildCardList(state.usedCards));
  } else {
    const note = document.createElement("p");
    note.className = "modal-note";
    note.textContent = "All cards are available every draw.";
    elements.deckViewerContent.append(note, buildCardList(ROUTINE_CARDS));
  }

  openModal(elements.deckModal, elements.closeDeckModal);
}

function openScheduleViewer() {
  elements.scheduleContent.innerHTML = "";

  if (state.history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "modal-note";
    empty.textContent = "Complete a sentence turn to add it to your schedule.";
    elements.scheduleContent.append(empty);
    openModal(elements.scheduleModal, elements.closeScheduleModal);
    return;
  }

  const sortedEntries = [...state.history].sort((a, b) => minutesAfterMidnight(a.time, a.ampm) - minutesAfterMidnight(b.time, b.ampm));
  const shownEntries = sortedEntries.slice(0, 12);
  const list = document.createElement("ol");
  list.className = "schedule-list";

  shownEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.time} ${entry.ampm} - ${entry.phrase} - ${formatPoints(entry.points)}`;
    list.append(item);
  });

  elements.scheduleContent.append(list);
  if (sortedEntries.length > 12) {
    const note = document.createElement("p");
    note.className = "modal-note";
    note.textContent = "Showing first 12 items.";
    elements.scheduleContent.append(note);
  }

  openModal(elements.scheduleModal, elements.closeScheduleModal);
}

function openModal(modal, focusTarget) {
  modal.hidden = false;
  focusTarget.focus();
}

function closeModal(modal, returnFocusTarget) {
  modal.hidden = true;
  if (returnFocusTarget) {
    returnFocusTarget.focus();
  }
}

// ---------- Animated actions ----------
async function rollTime() {
  const duration = animationTime(TIME_ROLL_DURATION);
  setActiveStep(elements.timePanel, true);
  elements.timeResult.classList.add("rolling");
  elements.diceDisplay.classList.add("rolling");

  if (duration > 0) {
    const interval = setInterval(() => {
      const preview = generateTimeRoll();
      updateTimeDisplay(preview);
    }, 90);
    await wait(duration);
    clearInterval(interval);
  }

  const finalRoll = generateTimeRoll();
  updateTimeDisplay(finalRoll);
  elements.timeResult.classList.remove("rolling");
  elements.diceDisplay.classList.remove("rolling");
  setActiveStep(elements.timePanel, false);
}

async function flipAmpm() {
  const duration = animationTime(COIN_FLIP_DURATION);
  setActiveStep(elements.coinPanel, true);
  elements.coin.classList.add("flipping");

  if (duration > 0) {
    const interval = setInterval(() => {
      elements.coin.textContent = generateAmpm();
    }, 100);
    await wait(duration);
    clearInterval(interval);
  }

  updateAmpmDisplay(generateAmpm());
  elements.coin.classList.remove("flipping");
  setActiveStep(elements.coinPanel, false);
}

async function drawRoutineCard() {
  const duration = animationTime(CARD_SHUFFLE_DURATION);
  setActiveStep(elements.cardPanel, true);
  elements.deck.classList.add("shuffling");
  elements.routineCard.classList.remove("revealing");

  if (duration > 0) {
    await wait(duration);
  }

  updateCardDisplay(generateCard());
  elements.deck.classList.remove("shuffling");
  elements.routineCard.classList.add("revealing");

  if (shouldAnimate()) {
    await wait(QUICK_ANIMATION_DURATION);
  }
  elements.routineCard.classList.remove("revealing");
  setActiveStep(elements.cardPanel, false);
}

// ---------- Turn control ----------
async function runSafely(action, options = {}) {
  const { resultChanges = false } = options;
  if (state.isAnimating || isRoundFinished()) {
    updateFinishedState();
    return;
  }

  state.isAnimating = true;
  setSettingsOpen(false);
  setButtonsDisabled(true);

  try {
    await action();
    if (resultChanges) {
      markCurrentResultChanged();
    }
  } finally {
    state.isAnimating = false;
    setButtonsDisabled(false);
    updateFinishedState();
  }
}

function newTurn() {
  runSafely(async () => {
    await rollTime();
    await wait(BETWEEN_ANIMATION_PAUSE);
    await flipAmpm();
    await wait(BETWEEN_ANIMATION_PAUSE);
    await drawRoutineCard();
    await wait(BETWEEN_ANIMATION_PAUSE);
  }, { resultChanges: true });
}

function resetCurrentResultDisplay() {
  elements.timeResult.textContent = "--:--";
  elements.ampmResult.textContent = "AM/PM";
  elements.timeModeNote.textContent = "Fair 1–12 time roll";
  elements.firstDie.textContent = "?";
  elements.secondDie.textContent = "?";
  elements.secondDie.classList.add("is-hidden");
  elements.coin.textContent = "?";
  elements.coinText.textContent = "Ready to flip";
  elements.cardNumber.textContent = "Card --";
  elements.routinePhrase.textContent = "Tap New Turn";
  elements.cardPoints.textContent = "-- points";
  updateSentenceHints("_____");
}

function resetGame() {
  const confirmed = window.confirm("Reset the total points and completed turn history for this device?");
  if (!confirmed) {
    return;
  }

  state = getFreshState();
  resetDeckState();
  resetCurrentResultDisplay();
  updateScoreDisplay();
  renderHistory();
  setHistoryExpanded(false);
  updateFinishedState();
}

// ---------- Event listeners ----------
elements.settingsButton.addEventListener("click", () => {
  setSettingsOpen(elements.settingsDropdown.hidden);
});

document.addEventListener("click", (event) => {
  if (!elements.settingsMenu.contains(event.target)) {
    setSettingsOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSettingsOpen(false);
    if (!elements.deckModal.hidden) {
      closeModal(elements.deckModal, elements.deckButton);
    }
    if (!elements.scheduleModal.hidden) {
      closeModal(elements.scheduleModal, elements.scheduleButton);
    }
  }
});

hintData.forEach((hint) => {
  hint.element.addEventListener("click", () => {
    const nextState = !hint.element.classList.contains("is-revealed");
    setHintRevealed(hint.element, nextState, hint.keyword);
  });
});

elements.newTurnButton.addEventListener("click", newTurn);
elements.rollTimeButton.addEventListener("click", () => runSafely(rollTime, { resultChanges: true }));
elements.flipAmpmButton.addEventListener("click", () => runSafely(flipAmpm, { resultChanges: true }));
elements.drawCardButton.addEventListener("click", () => runSafely(drawRoutineCard, { resultChanges: true }));
elements.addPointsButton.addEventListener("click", addCurrentPoints);
elements.resetButton.addEventListener("click", resetGame);
elements.historyToggle.addEventListener("click", () => setHistoryExpanded(!state.historyExpanded));
elements.deckButton.addEventListener("click", openDeckViewer);
elements.scheduleButton.addEventListener("click", openScheduleViewer);
elements.closeDeckModal.addEventListener("click", () => closeModal(elements.deckModal, elements.deckButton));
elements.closeScheduleModal.addEventListener("click", () => closeModal(elements.scheduleModal, elements.scheduleButton));

elements.deckModal.addEventListener("click", (event) => {
  if (event.target === elements.deckModal) {
    closeModal(elements.deckModal, elements.deckButton);
  }
});

elements.scheduleModal.addEventListener("click", (event) => {
  if (event.target === elements.scheduleModal) {
    closeModal(elements.scheduleModal, elements.scheduleButton);
  }
});

elements.settingsForm.addEventListener("change", (event) => {
  if (event.target.name === "cardMode") {
    resetDeckState();
  }
  if (event.target.name === "appearance") {
    applyAppearance();
  }
  if (event.target.name === "displayMode") {
    applyDisplayMode();
  }
  if (event.target.name === "roundLimit") {
    updateFinishedState();
  }
  updateHintsVisibility();
  updateDeckCount();
  updateScoreDisplay();
});

// ---------- First screen setup ----------
loadSavedAppearance();
applyDisplayMode();
resetDeckState();
updateSentenceHints("_____");
updateScoreDisplay();
updateHintsVisibility();
updateDeckCount();
renderHistory();
setHistoryExpanded(false);
updateFinishedState();
