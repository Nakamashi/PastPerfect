/*
  Daily Routine Game
  Static JavaScript only: no backend, build tools, or external libraries.
*/

// ---------- Easy-to-edit game data ----------
// To change the routine cards later, edit this list. The card number is also the point value.
const ROUTINE_CARDS = [
  { number: 1, phrase: "eaten lunch" },
  { number: 2, phrase: "taken a bath" },
  { number: 3, phrase: "gone to school" },
  { number: 4, phrase: "finished my homework" },
  { number: 5, phrase: "gone to bed" },
  { number: 6, phrase: "returned home" },
  { number: 7, phrase: "brushed my teeth" },
  { number: 8, phrase: "eaten dinner" },
  { number: 9, phrase: "woken up" },
  { number: 10, phrase: "finished cleaning" },
  { number: 11, phrase: "gone to club activities" },
  { number: 12, phrase: "left my house" }
];

// ---------- Animation timing constants ----------
// Keep these values easy to edit. The full New Turn sequence is slower and clearer for class play.
const TIME_ROLL_DURATION = 1100;
const COIN_FLIP_DURATION = 900;
const CARD_SHUFFLE_DURATION = 1100;
const QUICK_ANIMATION_DURATION = 450;
const BETWEEN_ANIMATION_PAUSE = 350;

const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
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
  historyCount: document.querySelector("#historyCount"),
  historyList: document.querySelector("#historyList"),
  settingsMenu: document.querySelector("#settingsMenu"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsDropdown: document.querySelector("#settingsDropdown"),
  settingsForm: document.querySelector("#settingsForm"),
  buttons: document.querySelectorAll("button"),
  newTurnButton: document.querySelector("#newTurnButton"),
  rollTimeButton: document.querySelector("#rollTimeButton"),
  flipAmpmButton: document.querySelector("#flipAmpmButton"),
  drawCardButton: document.querySelector("#drawCardButton"),
  resetButton: document.querySelector("#resetButton")
};

// ---------- Game state for this browser session ----------
let state = {
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
  isAnimating: false
};

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

function setButtonsDisabled(disabled) {
  elements.buttons.forEach((button) => {
    button.disabled = disabled;
  });
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
    state.deck = shuffleArray(ROUTINE_CARDS);
  }
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
    return state.deck.pop();
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
  state.thisTurnPoints = card.number;
  elements.cardNumber.textContent = `Card ${card.number}`;
  elements.routinePhrase.textContent = card.phrase;
  elements.cardPoints.textContent = formatPoints(card.number);
  elements.thisTurnPoints.textContent = formatPoints(card.number);
  updateSentenceHints(card.phrase);
  updateDeckCount();
}

function updateSentenceHints(phrase) {
  elements.hintYet.textContent = `I haven’t ${phrase} yet.`;
  elements.hintAlready.textContent = `I have already ${phrase}.`;
  elements.hintJust.textContent = `I have just ${phrase}.`;
}

function updateDeckCount() {
  if (getSetting("cardMode") === "shuffle") {
    elements.deckCount.textContent = `${state.deck.length} cards left before reshuffle`;
  } else {
    elements.deckCount.textContent = "Random draw with replacement";
  }
}

function updateScoreDisplay() {
  elements.thisTurnPoints.textContent = formatPoints(state.thisTurnPoints);
  elements.totalPoints.textContent = formatPoints(state.totalPoints);
  elements.turnNumber.textContent = `Turn ${state.turn}`;
}

function updateHintsVisibility() {
  elements.sentenceHints.classList.toggle("is-hidden", getSetting("hints") === "off");
}

function renderHistory() {
  elements.historyList.innerHTML = "";
  elements.historyCount.textContent = `${state.history.length} ${state.history.length === 1 ? "turn" : "turns"}`;

  if (state.history.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "Previous turns will appear here.";
    elements.historyList.append(empty);
    return;
  }

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
    points: state.card.number
  });
  renderHistory();
}

function animateScore(points) {
  elements.scorePop.textContent = `+${points}`;
  elements.scorePop.classList.remove("show");
  void elements.scorePop.offsetWidth;
  elements.scorePop.classList.add("show");
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
async function runSafely(action, addPointsAfter = false) {
  if (state.isAnimating) {
    return;
  }

  state.isAnimating = true;
  setSettingsOpen(false);
  setButtonsDisabled(true);

  try {
    await action();
    if (addPointsAfter && state.card) {
      state.turn += 1;
      state.totalPoints += state.card.number;
      state.thisTurnPoints = state.card.number;
      updateScoreDisplay();
      animateScore(state.card.number);
      addHistoryEntry();
    }
  } finally {
    state.isAnimating = false;
    setButtonsDisabled(false);
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
  }, true);
}

function resetGame() {
  const confirmed = window.confirm("Reset the total points and turn history for this device?");
  if (!confirmed) {
    return;
  }

  state = {
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
    isAnimating: false
  };

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
  elements.deckCount.textContent = "Random draw with replacement";
  updateSentenceHints("_____");
  updateScoreDisplay();
  renderHistory();
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
  }
});

elements.newTurnButton.addEventListener("click", newTurn);
elements.rollTimeButton.addEventListener("click", () => runSafely(rollTime));
elements.flipAmpmButton.addEventListener("click", () => runSafely(flipAmpm));
elements.drawCardButton.addEventListener("click", () => runSafely(drawRoutineCard));
elements.resetButton.addEventListener("click", resetGame);

elements.settingsForm.addEventListener("change", () => {
  if (getSetting("cardMode") === "shuffle") {
    ensureDeck();
  }
  updateHintsVisibility();
  updateDeckCount();
});

// ---------- First screen setup ----------
updateSentenceHints("_____");
updateScoreDisplay();
updateHintsVisibility();
updateDeckCount();
renderHistory();
