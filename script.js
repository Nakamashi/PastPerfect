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
const TIME_ROLL_DURATION = 2200;
const COIN_FLIP_DURATION = 2200;
const CARD_FLIP_DURATION = 1200;
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const APPEARANCE_STORAGE_KEY = "dailyRoutineGameAppearance";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Page elements ----------
const elements = {
  mainScreen: document.querySelector("#mainScreen"),
  diceScreen: document.querySelector("#diceScreen"),
  coinScreen: document.querySelector("#coinScreen"),
  cardScreen: document.querySelector("#cardScreen"),
  turnNumber: document.querySelector("#turnNumber"),
  timePanel: document.querySelector("#timePanel"),
  coinPanel: document.querySelector("#coinPanel"),
  cardPanel: document.querySelector("#cardPanel"),
  timeStatus: document.querySelector("#timeStatus"),
  ampmStatus: document.querySelector("#ampmStatus"),
  cardStatus: document.querySelector("#cardStatus"),
  timeResult: document.querySelector("#timeResult"),
  ampmResult: document.querySelector("#ampmResult"),
  timeModeNote: document.querySelector("#timeModeNote"),
  timeLockNote: document.querySelector("#timeLockNote"),
  coinLockNote: document.querySelector("#coinLockNote"),
  cardLockNote: document.querySelector("#cardLockNote"),
  diceDisplay: document.querySelector("#diceDisplay"),
  firstDie: document.querySelector(".die"),
  secondDie: document.querySelector(".second-die"),
  coin: document.querySelector("#coin"),
  coinText: document.querySelector("#coinText"),
  deck: document.querySelector("#deck"),
  routineCard: document.querySelector("#routineCard"),
  cardNumber: document.querySelector("#cardNumber"),
  routinePhrase: document.querySelector("#routinePhrase"),
  cardPoints: document.querySelector("#cardPoints"),
  deckCount: document.querySelector("#deckCount"),
  viewDeckListButton: document.querySelector("#viewDeckListButton"),
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
  addPointsButton: document.querySelector("#addPointsButton"),
  scoringHelp: document.querySelector("#scoringHelp"),
  resetButton: document.querySelector("#resetButton"),
  deckModal: document.querySelector("#deckModal"),
  deckViewerContent: document.querySelector("#deckViewerContent"),
  closeDeckModal: document.querySelector("#closeDeckModal"),
  scheduleModal: document.querySelector("#scheduleModal"),
  scheduleContent: document.querySelector("#scheduleContent"),
  closeScheduleModal: document.querySelector("#closeScheduleModal"),
  actionDieOne: document.querySelector("#actionDieOne"),
  actionDieTwo: document.querySelector("#actionDieTwo"),
  actionDiceDisplay: document.querySelector("#actionDiceDisplay"),
  diceScreenResult: document.querySelector("#diceScreenResult"),
  actionCoin: document.querySelector("#actionCoin"),
  coinScreenResult: document.querySelector("#coinScreenResult"),
  cardTable: document.querySelector("#cardTable"),
  cardTableNote: document.querySelector("#cardTableNote"),
  cardScreenResult: document.querySelector("#cardScreenResult"),
  backFromDice: document.querySelector("#backFromDice"),
  backFromCoin: document.querySelector("#backFromCoin"),
  backFromCard: document.querySelector("#backFromCard"),
  returnAfterDice: document.querySelector("#returnAfterDice"),
  returnAfterCoin: document.querySelector("#returnAfterCoin"),
  returnAfterCard: document.querySelector("#returnAfterCard"),
  actionRollDiceButton: document.querySelector("#actionRollDiceButton"),
  actionFlipCoinButton: document.querySelector("#actionFlipCoinButton")
};

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
    tableSlots: [],
    isAnimating: false,
    currentResultSaved: true,
    hasTimeResult: false,
    hasAmpmResult: false,
    hasCardResult: false,
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

async function runDeceleratingPreview(duration, updatePreview) {
  let elapsed = 0;
  let delay = 75;

  while (elapsed < duration) {
    updatePreview();
    await wait(delay);
    elapsed += delay;

    const progress = elapsed / duration;
    if (progress > 0.82) {
      delay = 280;
    } else if (progress > 0.62) {
      delay = 170;
    } else if (progress > 0.42) {
      delay = 110;
    }
  }
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
    state.tableSlots = [...state.deck];
  }
}

function resetDeckState() {
  state.deck = [];
  state.usedCards = [];
  state.tableSlots = [];
  if (getSetting("cardMode") === "shuffle") {
    ensureDeck();
  }
  updateDeckCount();
}

function hasFullCurrentResult() {
  return state.hasTimeResult && state.hasAmpmResult && state.hasCardResult && Boolean(state.card);
}

function setCompletionStatus(element, complete, incompleteText) {
  element.textContent = complete ? "Done" : incompleteText;
  element.classList.toggle("done", complete);
  element.classList.toggle("incomplete", !complete);
}

function updateActionAvailability() {
  const finished = isRoundFinished();
  const scoredFullTurn = state.currentResultSaved && hasFullCurrentResult();
  const baseLocked = state.isAnimating || finished || scoredFullTurn;
  const timeLocked = baseLocked || state.hasTimeResult;
  const ampmLocked = baseLocked || state.hasAmpmResult;
  const cardLocked = baseLocked || state.hasCardResult;

  elements.newTurnButton.disabled = state.isAnimating || finished;
  elements.actionRollDiceButton.disabled = timeLocked;
  elements.actionFlipCoinButton.disabled = ampmLocked;
  elements.timePanel.classList.toggle("is-disabled", timeLocked);
  elements.coinPanel.classList.toggle("is-disabled", ampmLocked);
  elements.cardPanel.classList.toggle("is-disabled", cardLocked);
  elements.timePanel.classList.toggle("is-locked", state.hasTimeResult);
  elements.coinPanel.classList.toggle("is-locked", state.hasAmpmResult);
  elements.cardPanel.classList.toggle("is-locked", state.hasCardResult);
  updateLockNotes();
  updateAddPointsButton();
}

function updateLockNotes() {
  elements.timeLockNote.textContent = state.hasTimeResult ? "Locked for this turn." : "Click to roll time.";
  elements.coinLockNote.textContent = state.hasAmpmResult ? "Locked for this turn." : "Click to flip AM / PM.";
  elements.cardLockNote.textContent = state.hasCardResult ? "Locked for this turn." : "Click to choose a card.";
}

function updateAddPointsButton() {
  const missing = [];
  if (!state.hasTimeResult) missing.push("dice");
  if (!state.hasAmpmResult) missing.push("coin");
  if (!state.hasCardResult) missing.push("card");

  const disabled = state.isAnimating || !hasFullCurrentResult() || state.currentResultSaved || isRoundFinished();
  elements.addPointsButton.disabled = disabled;

  if (isRoundFinished()) {
    elements.scoringHelp.textContent = "Round limit reached. Reset Game to play again.";
  } else if (state.currentResultSaved && hasFullCurrentResult()) {
    elements.scoringHelp.textContent = "Turn scored. Click New Turn for a fresh blank turn.";
  } else if (missing.length > 0) {
    elements.scoringHelp.textContent = "Complete dice, coin, and card first.";
  } else {
    elements.scoringHelp.textContent = "Write or say your sentence, then add points.";
  }
}

function setSettingsOpen(isOpen) {
  elements.settingsDropdown.hidden = !isOpen;
  elements.settingsButton.setAttribute("aria-expanded", String(isOpen));
}

function setActiveStep(panel, isActive) {
  panel.classList.toggle("active-step", isActive && shouldAnimate());
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

// ---------- View switching ----------
function showView(viewToShow) {
  [elements.mainScreen, elements.diceScreen, elements.coinScreen, elements.cardScreen].forEach((view) => {
    view.hidden = view !== viewToShow;
  });
  setSettingsOpen(false);
}

function showMainScreen() {
  showView(elements.mainScreen);
  elements.newTurnButton.focus();
}

function showDiceScreen() {
  if (state.isAnimating || state.hasTimeResult || isRoundFinished() || (state.currentResultSaved && hasFullCurrentResult())) return;
  showView(elements.diceScreen);
  elements.actionRollDiceButton.focus();
}

function showCoinScreen() {
  if (state.isAnimating || state.hasAmpmResult || isRoundFinished() || (state.currentResultSaved && hasFullCurrentResult())) return;
  showView(elements.coinScreen);
  elements.actionFlipCoinButton.focus();
}

function showCardScreen() {
  if (state.isAnimating || state.hasCardResult || isRoundFinished() || (state.currentResultSaved && hasFullCurrentResult())) return;
  renderCardTable();
  showView(elements.cardScreen);
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

function getCardSlotsForTable() {
  if (getSetting("cardMode") === "shuffle") {
    ensureDeck();
    return state.tableSlots;
  }
  return ROUTINE_CARDS;
}

function chooseCard(cardNumber, slotIndex) {
  const number = Number(cardNumber);
  if (getSetting("cardMode") === "shuffle") {
    ensureDeck();
    const index = Number(slotIndex);
    const card = state.tableSlots[index];
    if (!card || card.number !== number) return null;

    state.tableSlots[index] = null;
    state.deck = state.deck.filter((deckCard) => deckCard.number !== number);
    state.usedCards.unshift(card);
    return card;
  }
  return ROUTINE_CARDS.find((card) => card.number === number) || null;
}

// ---------- Screen update functions ----------
function updateTimeDisplay(roll) {
  state.hour = roll.hour;
  state.minute = roll.minute;
  state.time = `${roll.hour}:${roll.minute}`;
  state.hasTimeResult = true;
  state.currentResultSaved = false;
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

  setCompletionStatus(elements.timeStatus, true, "Not rolled");
  updateScoreDisplay();
}

function updateActionDiceDisplay(roll) {
  elements.actionDieOne.textContent = roll.dieOne;
  if (roll.dieTwo === null) {
    elements.actionDieTwo.classList.add("is-hidden");
  } else {
    elements.actionDieTwo.classList.remove("is-hidden");
    elements.actionDieTwo.textContent = roll.dieTwo;
  }
  elements.diceScreenResult.textContent = `${roll.hour}:${roll.minute} — ${roll.note}`;
}

function updateAmpmDisplay(ampm) {
  state.ampm = ampm;
  state.hasAmpmResult = true;
  state.currentResultSaved = false;
  elements.ampmResult.textContent = ampm;
  elements.coin.textContent = ampm;
  elements.coinText.textContent = `${ampm} selected`;
  setCompletionStatus(elements.ampmStatus, true, "Not flipped");
  updateScoreDisplay();
}

function updateCardDisplay(card) {
  state.card = card;
  state.hasCardResult = true;
  state.currentResultSaved = false;
  state.thisTurnPoints = card.points;
  elements.cardNumber.textContent = `Card ${card.number}`;
  elements.routinePhrase.textContent = card.phrase;
  elements.cardPoints.textContent = formatPoints(card.points);
  elements.thisTurnPoints.textContent = formatPoints(card.points);
  setCompletionStatus(elements.cardStatus, true, "Not chosen");
  updateSentenceHints(card.phrase);
  updateDeckCount();
  updateScoreDisplay();
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
    elements.deckCount.textContent = `Replacement mode: all ${ROUTINE_CARDS.length} cards are available every draw.`;
  }
}

function updateScoreDisplay() {
  elements.thisTurnPoints.textContent = formatPoints(state.thisTurnPoints);
  elements.totalPoints.textContent = formatPoints(state.totalPoints);
  const limit = getRoundLimit();
  elements.turnNumber.textContent = limit === null ? `Turn ${state.turn}` : `Turn ${state.turn} / ${limit}`;
  elements.finishedTotal.textContent = `Total: ${formatPoints(state.totalPoints)}`;
  elements.finishedPanel.hidden = !isRoundFinished();
  updateActionAvailability();
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

function resetCurrentResultDisplay() {
  state.time = "--:--";
  state.hour = null;
  state.minute = "00";
  state.ampm = "AM/PM";
  state.card = null;
  state.thisTurnPoints = 0;
  state.currentResultSaved = true;
  state.hasTimeResult = false;
  state.hasAmpmResult = false;
  state.hasCardResult = false;

  elements.timeResult.textContent = "--:--";
  elements.ampmResult.textContent = "AM/PM";
  elements.timeModeNote.textContent = "Click to roll time.";
  elements.firstDie.textContent = "?";
  elements.secondDie.textContent = "?";
  elements.secondDie.classList.add("is-hidden");
  elements.coin.textContent = "?";
  elements.coinText.textContent = "Not flipped";
  elements.cardNumber.textContent = "Card --";
  elements.routinePhrase.textContent = "Not chosen";
  elements.cardPoints.textContent = "-- points";
  setCompletionStatus(elements.timeStatus, false, "Not rolled");
  setCompletionStatus(elements.ampmStatus, false, "Not flipped");
  setCompletionStatus(elements.cardStatus, false, "Not chosen");
  elements.diceScreenResult.textContent = "Not rolled yet.";
  elements.coinScreenResult.textContent = "Not flipped yet.";
  elements.cardScreenResult.textContent = "No card chosen yet.";
  elements.actionDieOne.textContent = "?";
  elements.actionDieTwo.textContent = "?";
  elements.actionDieTwo.classList.add("is-hidden");
  elements.actionCoin.textContent = "?";
  updateSentenceHints("_____");
}

// ---------- History, deck list, and schedule ----------
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
    if (index === 0) item.classList.add("new-history");
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

function buildCardList(cards) {
  const list = document.createElement("ul");
  list.className = "card-mini-list";
  cards.forEach((card) => {
    const item = document.createElement("li");
    item.textContent = `Card ${card.number}: ${card.phrase} — ${formatPoints(card.points)}`;
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
    elements.deckViewerContent.append(
      remainingTitle,
      buildCardList([...state.deck].sort((a, b) => a.number - b.number)),
      usedTitle,
      buildCardList(state.usedCards)
    );
  } else {
    const note = document.createElement("p");
    note.className = "modal-note";
    note.textContent = "All 24 cards are available every draw in replacement mode.";
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
  if (returnFocusTarget) returnFocusTarget.focus();
}

function setHistoryExpanded(isExpanded) {
  state.historyExpanded = isExpanded;
  elements.historyPanel.classList.toggle("is-collapsed", !isExpanded);
  elements.historyPanel.classList.toggle("is-expanded", isExpanded);
  elements.historyBody.hidden = !isExpanded;
  elements.historyToggle.setAttribute("aria-expanded", String(isExpanded));
  elements.historyToggleText.textContent = isExpanded ? "Collapse" : "Expand";
}

// ---------- Animated action screens ----------
async function rollTimeOnDiceScreen() {
  if (state.isAnimating || state.hasTimeResult || isRoundFinished()) return;
  state.isAnimating = true;
  updateActionAvailability();
  setActiveStep(elements.timePanel, true);
  const duration = animationTime(TIME_ROLL_DURATION);
  elements.actionDiceDisplay.classList.add("big-rolling");
  elements.diceDisplay.classList.add("rolling");

  if (duration > 0) {
    const settleTimer = setTimeout(() => elements.actionDiceDisplay.classList.add("is-decelerating"), duration * 0.62);
    await runDeceleratingPreview(duration, () => updateActionDiceDisplay(generateTimeRoll()));
    clearTimeout(settleTimer);
  }

  const finalRoll = generateTimeRoll();
  updateActionDiceDisplay(finalRoll);
  updateTimeDisplay(finalRoll);
  elements.actionDiceDisplay.classList.remove("big-rolling", "is-decelerating");
  elements.diceDisplay.classList.remove("rolling");
  setActiveStep(elements.timePanel, false);
  state.isAnimating = false;
  updateActionAvailability();
}

async function flipCoinOnCoinScreen() {
  if (state.isAnimating || state.hasAmpmResult || isRoundFinished()) return;
  state.isAnimating = true;
  updateActionAvailability();
  setActiveStep(elements.coinPanel, true);
  const duration = animationTime(COIN_FLIP_DURATION);
  elements.actionCoin.classList.add("big-flipping");
  elements.coin.classList.add("flipping");

  if (duration > 0) {
    const settleTimer = setTimeout(() => elements.actionCoin.classList.add("is-decelerating"), duration * 0.62);
    await runDeceleratingPreview(duration, () => {
      elements.actionCoin.textContent = generateAmpm();
    });
    clearTimeout(settleTimer);
  }

  const result = generateAmpm();
  elements.actionCoin.textContent = result;
  elements.coinScreenResult.textContent = `${result} selected`;
  updateAmpmDisplay(result);
  elements.actionCoin.classList.remove("big-flipping", "is-decelerating");
  elements.coin.classList.remove("flipping");
  setActiveStep(elements.coinPanel, false);
  state.isAnimating = false;
  updateActionAvailability();
}

function renderCardTable() {
  const cardSlots = getCardSlotsForTable();
  elements.cardTable.innerHTML = "";
  elements.cardTableNote.textContent = getSetting("cardMode") === "shuffle"
    ? `Shuffle mode: ${state.deck.length} cards remain. Blank spaces show cards already taken from the table.`
    : "Replacement mode: all 24 cards are available every draw.";

  cardSlots.forEach((card, index) => {
    if (!card) {
      const emptySlot = document.createElement("div");
      emptySlot.className = "table-card-empty";
      emptySlot.setAttribute("aria-label", `Empty table space ${index + 1}`);
      emptySlot.textContent = "";
      elements.cardTable.append(emptySlot);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "table-card";
    button.dataset.cardNumber = card.number;
    button.dataset.slotIndex = index;
    button.innerHTML = `
      <span class="table-card-inner">
        <span class="table-card-back">?</span>
        <span class="table-card-front">
          <span>Card ${card.number}</span>
          <strong>${card.phrase}</strong>
          <span>${formatPoints(card.points)}</span>
        </span>
      </span>
    `;
    button.addEventListener("click", () => selectTableCard(button));
    elements.cardTable.append(button);
  });
}

async function selectTableCard(button) {
  if (state.isAnimating || state.hasCardResult || button.classList.contains("is-revealed") || isRoundFinished()) return;
  const card = chooseCard(button.dataset.cardNumber, button.dataset.slotIndex);
  if (!card) return;

  state.isAnimating = true;
  updateActionAvailability();
  setActiveStep(elements.cardPanel, true);
  elements.cardTable.querySelectorAll(".table-card").forEach((cardButton) => {
    cardButton.disabled = true;
    if (cardButton !== button) cardButton.classList.add("is-dimmed");
  });
  if (!shouldAnimate()) {
    button.classList.add("no-animation");
  }
  button.classList.add("is-revealed");
  elements.deck.classList.add("shuffling");

  if (animationTime(CARD_FLIP_DURATION) > 0) {
    await wait(CARD_FLIP_DURATION);
  }

  updateCardDisplay(card);
  elements.cardScreenResult.textContent = `Card ${card.number}: ${card.phrase} — ${formatPoints(card.points)}`;
  elements.deck.classList.remove("shuffling");
  setActiveStep(elements.cardPanel, false);
  state.isAnimating = false;
  updateActionAvailability();
}

// ---------- Turn and scoring control ----------
function newTurn() {
  if (state.isAnimating || isRoundFinished()) {
    updateScoreDisplay();
    return;
  }

  if (!state.currentResultSaved && (state.hasTimeResult || state.hasAmpmResult || state.hasCardResult)) {
    const confirmed = window.confirm("Start a fresh blank turn and abandon the current unsaved result?");
    if (!confirmed) return;
  }

  resetCurrentResultDisplay();
  updateScoreDisplay();
  showMainScreen();
}

function addCurrentPoints() {
  if (!hasFullCurrentResult() || state.currentResultSaved || isRoundFinished()) return;

  state.turn += 1;
  state.totalPoints += state.card.points;
  state.thisTurnPoints = state.card.points;
  state.currentResultSaved = true;
  updateScoreDisplay();
  animateScore(state.card.points);
  addHistoryEntry();
}

function animateScore(points) {
  elements.scorePop.textContent = `+${points}`;
  elements.scorePop.classList.remove("show");
  void elements.scorePop.offsetWidth;
  elements.scorePop.classList.add("show");
}

function resetGame() {
  const confirmed = window.confirm("Reset the total points and completed turn history for this device?");
  if (!confirmed) return;

  const historyExpanded = state.historyExpanded;
  state = getFreshState();
  state.historyExpanded = historyExpanded;
  resetDeckState();
  resetCurrentResultDisplay();
  updateScoreDisplay();
  renderHistory();
  setHistoryExpanded(false);
  showMainScreen();
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
    if (!elements.deckModal.hidden) closeModal(elements.deckModal, elements.viewDeckListButton);
    if (!elements.scheduleModal.hidden) closeModal(elements.scheduleModal, elements.scheduleButton);
  }
});

function handlePanelKeyboard(event, handler) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
}

hintData.forEach((hint) => {
  hint.element.addEventListener("click", () => {
    const nextState = !hint.element.classList.contains("is-revealed");
    setHintRevealed(hint.element, nextState, hint.keyword);
  });
});

elements.timePanel.addEventListener("click", showDiceScreen);
elements.timePanel.addEventListener("keydown", (event) => handlePanelKeyboard(event, showDiceScreen));
elements.coinPanel.addEventListener("click", showCoinScreen);
elements.coinPanel.addEventListener("keydown", (event) => handlePanelKeyboard(event, showCoinScreen));
elements.cardPanel.addEventListener("click", showCardScreen);
elements.cardPanel.addEventListener("keydown", (event) => handlePanelKeyboard(event, showCardScreen));
elements.viewDeckListButton.addEventListener("click", (event) => {
  event.stopPropagation();
  openDeckViewer();
});

elements.newTurnButton.addEventListener("click", newTurn);
elements.addPointsButton.addEventListener("click", addCurrentPoints);
elements.resetButton.addEventListener("click", resetGame);
elements.historyToggle.addEventListener("click", () => setHistoryExpanded(!state.historyExpanded));
elements.scheduleButton.addEventListener("click", openScheduleViewer);
elements.closeDeckModal.addEventListener("click", () => closeModal(elements.deckModal, elements.viewDeckListButton));
elements.closeScheduleModal.addEventListener("click", () => closeModal(elements.scheduleModal, elements.scheduleButton));
elements.actionRollDiceButton.addEventListener("click", rollTimeOnDiceScreen);
elements.actionFlipCoinButton.addEventListener("click", flipCoinOnCoinScreen);
[elements.backFromDice, elements.returnAfterDice, elements.backFromCoin, elements.returnAfterCoin, elements.backFromCard, elements.returnAfterCard].forEach((button) => {
  button.addEventListener("click", showMainScreen);
});

elements.deckModal.addEventListener("click", (event) => {
  if (event.target === elements.deckModal) closeModal(elements.deckModal, elements.viewDeckListButton);
});

elements.scheduleModal.addEventListener("click", (event) => {
  if (event.target === elements.scheduleModal) closeModal(elements.scheduleModal, elements.scheduleButton);
});

elements.settingsForm.addEventListener("change", (event) => {
  if (event.target.name === "cardMode") {
    resetDeckState();
    if (!elements.cardScreen.hidden) renderCardTable();
  }
  if (event.target.name === "appearance") applyAppearance();
  if (event.target.name === "displayMode") applyDisplayMode();
  updateHintsVisibility();
  updateDeckCount();
  updateScoreDisplay();
});

// ---------- First screen setup ----------
loadSavedAppearance();
applyDisplayMode();
resetDeckState();
resetCurrentResultDisplay();
updateScoreDisplay();
updateHintsVisibility();
renderHistory();
setHistoryExpanded(false);
showView(elements.mainScreen);
