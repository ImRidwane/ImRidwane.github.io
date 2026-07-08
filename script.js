// ===== Blackjack — game logic =====

const SUITS = [
  { symbol: '♠', color: 'black' },
  { symbol: '♣', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let dealerHand = [];
let playerHand = [];
let bankroll = 1000;
let currentBet = 50;
let selectedChipValue = null;
let gameActive = false;   // true once a round is dealt and in progress
let roundOver = true;     // true when no bet is in play

// ===== DOM refs =====
const bankrollEl = document.getElementById('bankroll');
const wagerDisplayEl = document.getElementById('wager-display');
const dealerHandEl = document.getElementById('dealer-hand');
const playerHandEl = document.getElementById('player-hand');
const dealerCountEl = document.getElementById('dealer-count');
const playerCountEl = document.getElementById('player-count');
const messageTextEl = document.getElementById('message-text');
const chipRailEl = document.getElementById('chip-rail');
const chipClearBtn = document.getElementById('chip-clear');

const btnDeal = document.getElementById('btn-deal');
const btnHit = document.getElementById('btn-hit');
const btnStand = document.getElementById('btn-stand');
const btnDouble = document.getElementById('btn-double');

// ===== Deck helpers =====
function buildDeck() {
  const d = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      d.push({ rank, suit: suit.symbol, color: suit.color });
    }
  }
  return d;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawCard() {
  if (deck.length < 10) {
    deck = shuffle(buildDeck());
  }
  return deck.pop();
}

function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank, 10);
}

function handValue(hand) {
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

// ===== Rendering =====
function renderCard(card, faceDown = false) {
  const el = document.createElement('div');
  if (faceDown) {
    el.className = 'card back';
    return el;
  }
  el.className = 'card' + (card.color === 'red' ? ' red' : '');
  el.innerHTML = `
    <span class="corner top">${card.rank}${card.suit}</span>
    <span class="suit-center">${card.suit}</span>
    <span class="corner bottom">${card.rank}${card.suit}</span>
  `;
  return el;
}

function renderHands(hideDealerHole = false) {
  dealerHandEl.innerHTML = '';
  dealerHand.forEach((card, i) => {
    dealerHandEl.appendChild(renderCard(card, hideDealerHole && i === 1));
  });

  playerHandEl.innerHTML = '';
  playerHand.forEach(card => {
    playerHandEl.appendChild(renderCard(card));
  });

  playerCountEl.textContent = handValue(playerHand);
  dealerCountEl.textContent = hideDealerHole ? '?' : handValue(dealerHand);
}

function setMessage(text, type = '') {
  messageTextEl.textContent = text;
  messageTextEl.className = type;
}

function updateBankrollDisplay() {
  bankrollEl.textContent = `$${bankroll.toLocaleString()}`;
  wagerDisplayEl.textContent = `$${currentBet.toLocaleString()}`;
}

// ===== Betting (pre-round) =====
function selectChip(value) {
  if (!roundOver) return;
  selectedChipValue = value;
  currentBet += value;
  if (currentBet > bankroll) currentBet = bankroll;
  updateBankrollDisplay();
}

function clearBet() {
  if (!roundOver) return;
  currentBet = 50;
  updateBankrollDisplay();
}

chipRailEl.querySelectorAll('.chip[data-value]').forEach(chip => {
  chip.addEventListener('click', () => {
    const value = parseInt(chip.getAttribute('data-value'), 10);
    selectChip(value);
  });
});
chipClearBtn.addEventListener('click', clearBet);

// ===== Round flow =====
function startRound() {
  if (bankroll <= 0) {
    setMessage('Table closed — you\'re out of chips.', 'lose');
    btnDeal.disabled = true;
    return;
  }
  if (currentBet > bankroll) currentBet = bankroll;

  dealerHand = [];
  playerHand = [];
  roundOver = false;
  gameActive = true;

  playerHand.push(drawCard(), drawCard());
  dealerHand.push(drawCard(), drawCard());

  renderHands(true);
  setMessage(`Bet placed: $${currentBet}. Your move.`);

  btnDeal.disabled = true;
  btnHit.disabled = false;
  btnStand.disabled = false;
  btnDouble.disabled = bankroll < currentBet * 2;
  chipRailEl.querySelectorAll('.chip').forEach(c => c.disabled = true);

  if (handValue(playerHand) === 21) {
    endRound('blackjack');
  }
}

function playerHit() {
  if (!gameActive) return;
  playerHand.push(drawCard());
  renderHands(true);
  btnDouble.disabled = true;

  const total = handValue(playerHand);
  if (total > 21) {
    endRound('bust');
  } else if (total === 21) {
    endRound('stand');
  }
}

function playerStand() {
  if (!gameActive) return;
  endRound('stand');
}

function playerDouble() {
  if (!gameActive || bankroll < currentBet * 2) return;
  currentBet *= 2;
  updateBankrollDisplay();
  playerHand.push(drawCard());
  renderHands(true);
  const total = handValue(playerHand);
  if (total > 21) {
    endRound('bust');
  } else {
    endRound('stand');
  }
}

function dealerPlay() {
  while (handValue(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
}

function endRound(reason) {
  gameActive = false;
  btnHit.disabled = true;
  btnStand.disabled = true;
  btnDouble.disabled = true;

  const playerTotal = handValue(playerHand);

  if (reason === 'blackjack') {
    renderHands(false);
    const winnings = Math.floor(currentBet * 1.5);
    bankroll += winnings;
    setMessage(`Blackjack! You win $${winnings}.`, 'win');
    finishRound();
    return;
  }

  if (reason === 'bust') {
    renderHands(false);
    bankroll -= currentBet;
    setMessage(`Bust at ${playerTotal}. You lose $${currentBet}.`, 'lose');
    finishRound();
    return;
  }

  // stand: dealer plays out
  dealerPlay();
  renderHands(false);
  const dealerTotal = handValue(dealerHand);

  if (dealerTotal > 21) {
    bankroll += currentBet;
    setMessage(`Dealer busts at ${dealerTotal}. You win $${currentBet}.`, 'win');
  } else if (dealerTotal > playerTotal) {
    bankroll -= currentBet;
    setMessage(`Dealer wins ${dealerTotal} to ${playerTotal}. You lose $${currentBet}.`, 'lose');
  } else if (dealerTotal < playerTotal) {
    bankroll += currentBet;
    setMessage(`You win ${playerTotal} to ${dealerTotal}. +$${currentBet}.`, 'win');
  } else {
    setMessage(`Push at ${playerTotal}. Bet returned.`, 'push');
  }

  finishRound();
}

function finishRound() {
  updateBankrollDisplay();
  roundOver = true;
  btnDeal.disabled = bankroll <= 0;
  chipRailEl.querySelectorAll('.chip').forEach(c => c.disabled = false);
  if (bankroll <= 0) {
    setMessage('Table closed — you\'re out of chips.', 'lose');
  }
}

// ===== Wire up controls =====
btnDeal.addEventListener('click', startRound);
btnHit.addEventListener('click', playerHit);
btnStand.addEventListener('click', playerStand);
btnDouble.addEventListener('click', playerDouble);

// ===== Init =====
deck = shuffle(buildDeck());
updateBankrollDisplay();
setMessage('Place your bet, then hit Deal.');
