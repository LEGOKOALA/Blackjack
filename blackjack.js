
"use strict";


// =====================================
// GAME DATA
// =====================================

const suits = ["♥", "♦", "♣", "♠"];

const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K"
];


let deck = [];
let playerHand = [];
let dealerHand = [];

let gameOver = true;
let dealerHidden = true;
let roundActive = false;
let dealingInProgress = false;
let playerHasDoubled = false;


// =====================================
// BANKROLL AND STATISTICS
// =====================================

let bankroll = 1000;
let wins = 0;
let losses = 0;
let pushes = 0;
let currentBet = 25;


// =====================================
// DOM ELEMENTS
// =====================================

const playerCardsElement =
    document.getElementById("player-cards");

const dealerCardsElement =
    document.getElementById("dealer-cards");

const playerScoreElement =
    document.getElementById("player-score");

const dealerScoreElement =
    document.getElementById("dealer-score");

const messageElement =
    document.getElementById("message");

const deckElement =
    document.getElementById("deck");

const deckStatus =
    document.getElementById("deck-status");

const bankrollElement =
    document.getElementById("bankroll");

const winsElement =
    document.getElementById("wins");

const lossesElement =
    document.getElementById("losses");

const pushesElement =
    document.getElementById("pushes");

const currentBetElement =
    document.getElementById("current-bet");

const betSlider =
    document.getElementById("bet-slider");

const betDisplay =
    document.getElementById("bet-display");

const dealButton =
    document.getElementById("deal-button");

const hitButton =
    document.getElementById("hit-button");

const standButton =
    document.getElementById("stand-button");

const doubleButton =
    document.getElementById("double-button");

const newRoundButton =
    document.getElementById("new-round-button");

const resetButton =
    document.getElementById("reset-button");


// =====================================
// UTILITY FUNCTIONS
// =====================================

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


function formatMoney(amount) {
    return `$${amount.toLocaleString()}`;
}


function updateInterface() {
    bankrollElement.textContent = formatMoney(bankroll);
    winsElement.textContent = wins;
    lossesElement.textContent = losses;
    pushesElement.textContent = pushes;

    currentBetElement.textContent =
        formatMoney(currentBet);

    betDisplay.textContent =
        formatMoney(currentBet);

    betSlider.value = currentBet;
}


function setMessage(message) {
    messageElement.textContent = message;
}


function updateButtons() {
    dealButton.disabled =
        roundActive || dealingInProgress;

    hitButton.disabled =
        !roundActive || gameOver || dealingInProgress;

    standButton.disabled =
        !roundActive || gameOver || dealingInProgress;

    doubleButton.disabled =
        !roundActive ||
        gameOver ||
        dealingInProgress ||
        playerHasDoubled ||
        playerHand.length !== 2 ||
        bankroll < currentBet;

    newRoundButton.disabled =
        dealingInProgress;
}


// =====================================
// DECK FUNCTIONS
// =====================================

function createDeck() {
    deck = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({
                rank: rank,
                suit: suit
            });
        }
    }
}


function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [deck[i], deck[randomIndex]] =
            [deck[randomIndex], deck[i]];
    }
}


function drawCard() {
    if (deck.length === 0) {
        createDeck();
        shuffleDeck();
    }

    return deck.pop();
}


// =====================================
// SCORE CALCULATION
// =====================================

function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (const card of hand) {

        if (
            card.rank === "J" ||
            card.rank === "Q" ||
            card.rank === "K"
        ) {
            score += 10;
        }

        else if (card.rank === "A") {
            score += 11;
            aces++;
        }

        else {
            score += Number(card.rank);
        }
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}


function isBlackjack(hand) {
    return (
        hand.length === 2 &&
        calculateScore(hand) === 21
    );
}


// =====================================
// CARD ELEMENT CREATION
// =====================================

function createCardElement(card, hidden = false) {

    const cardElement =
        document.createElement("div");

    cardElement.classList.add("playing-card");


    const cardBack =
        document.createElement("div");

    cardBack.classList.add("card-back");


    const cardFace =
        document.createElement("div");

    cardFace.classList.add("card-face");


    if (
        card.suit === "♥" ||
        card.suit === "♦"
    ) {
        cardFace.classList.add("red");
    }


    const topCorner =
        document.createElement("div");

    topCorner.classList.add("card-corner");

    topCorner.innerHTML =
        `${card.rank}<br>${card.suit}`;


    const center =
        document.createElement("div");

    center.classList.add("card-center");

    center.textContent = card.suit;


    const bottomCorner =
        document.createElement("div");

    bottomCorner.classList.add(
        "card-corner",
        "bottom"
    );

    bottomCorner.innerHTML =
        `${card.rank}<br>${card.suit}`;


    cardFace.appendChild(topCorner);
    cardFace.appendChild(center);
    cardFace.appendChild(bottomCorner);


    cardElement.appendChild(cardBack);
    cardElement.appendChild(cardFace);


    if (hidden) {
        cardElement.classList.add("flipped");
    }


    return cardElement;
}


// =====================================
// SCORE DISPLAY
// =====================================

function displayScoresOnly() {

    playerScoreElement.textContent =
        calculateScore(playerHand);


    if (dealerHidden) {
        dealerScoreElement.textContent = "?";
    }

    else {
        dealerScoreElement.textContent =
            calculateScore(dealerHand);
    }
}


// =====================================
// CARD DEALING ANIMATION
// =====================================

async function animateDeal(hand, element, hidden = false) {

    const card = drawCard();

    hand.push(card);


    // Create the card in its final location.
    // It will then be visually moved to the deck.
    const newCardElement =
        createCardElement(card, hidden);


    element.appendChild(newCardElement);


    // Make sure the browser calculates the final
    // position before starting the animation.
    const cardRect =
        newCardElement.getBoundingClientRect();

    const deckRect =
        deckElement.getBoundingClientRect();


    const startX =
        deckRect.left +
        deckRect.width / 2 -
        (cardRect.left + cardRect.width / 2);


    const startY =
        deckRect.top +
        deckRect.height / 2 -
        (cardRect.top + cardRect.height / 2);


    // Turn off transitions while setting the
    // starting position.
    newCardElement.style.transition = "none";

    newCardElement.style.transform =
        `translate(${startX}px, ${startY}px)`;


    // Force a layout calculation.
    // This ensures the starting position is applied.
    newCardElement.offsetHeight;


    // Enable smooth movement to the destination.
    newCardElement.style.transition =
        "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease";


    requestAnimationFrame(() => {

        newCardElement.style.transform =
            "translate(0, 0)";

    });


    // Wait for the movement to finish.
    await wait(500);


    // Reveal cards that are not supposed to stay hidden.
    if (!hidden) {
        newCardElement.classList.remove("flipped");
    }


    displayScoresOnly();
}


// =====================================
// CLEAR TABLE
// =====================================

function clearTable() {

    playerCardsElement.innerHTML = "";
    dealerCardsElement.innerHTML = "";

    playerHand = [];
    dealerHand = [];

    playerScoreElement.textContent = "0";
    dealerScoreElement.textContent = "?";
}


// =====================================
// BET CONTROLS
// =====================================

function setBet(amount) {

    if (roundActive || dealingInProgress) {
        return;
    }

    const maximumBet =
        Math.min(100, bankroll);

    currentBet =
        Math.min(amount, maximumBet);

    currentBet =
        Math.max(5, currentBet);

    updateInterface();
    updateButtons();
}


betSlider.addEventListener("input", () => {

    if (roundActive || dealingInProgress) {
        return;
    }

    currentBet =
        Number(betSlider.value);

    if (currentBet > bankroll) {
        currentBet = bankroll;
    }

    if (currentBet < 5) {
        currentBet = 5;
    }

    updateInterface();
    updateButtons();

});


document.querySelectorAll(".quick-bet").forEach(button => {

    button.addEventListener("click", () => {

        const amount =
            Number(button.dataset.bet);

        setBet(amount);

    });

});


// =====================================
// START ROUND
// =====================================

async function startRound() {

    if (dealingInProgress || roundActive) {
        return;
    }

    if (bankroll < currentBet) {
        setMessage("You do not have enough bankroll.");
        return;
    }

    dealingInProgress = true;
    gameOver = false;
    roundActive = true;
    dealerHidden = true;
    playerHasDoubled = false;

    bankroll -= currentBet;

    updateInterface();
    updateButtons();

    clearTable();


    deckStatus.textContent = "Shuffling";

    deckElement.classList.add("shuffling");

    createDeck();
    shuffleDeck();

    await wait(700);

    deckElement.classList.remove("shuffling");

    deckStatus.textContent = "Dealing";


    // First player card
    await animateDeal(
        playerHand,
        playerCardsElement
    );

    await wait(180);


    // First dealer card, hidden
    await animateDeal(
        dealerHand,
        dealerCardsElement,
        true
    );

    await wait(180);


    // Second player card
    await animateDeal(
        playerHand,
        playerCardsElement
    );

    await wait(180);


    // Second dealer card
    await animateDeal(
        dealerHand,
        dealerCardsElement
    );

    await wait(180);


    dealingInProgress = false;

    deckStatus.textContent = "Deck";

    updateInterface();
    updateButtons();

    setMessage("Your turn!");

    checkBlackjack();

}


// =====================================
// BLACKJACK CHECK
// =====================================

function checkBlackjack() {

    const playerBlackjack =
        isBlackjack(playerHand);

    const dealerBlackjack =
        isBlackjack(dealerHand);


    if (playerBlackjack && dealerBlackjack) {

        dealerHidden = false;
        gameOver = true;
        roundActive = false;

        bankroll += currentBet;

        pushes++;

        displayDealerCards();

        setMessage("Both have Blackjack. Push!");

    }

    else if (playerBlackjack) {

        dealerHidden = false;
        gameOver = true;
        roundActive = false;

        bankroll += currentBet * 2.5;

        wins++;

        displayDealerCards();

        setMessage("Blackjack! You win!");

    }

    else if (dealerBlackjack) {

        dealerHidden = false;
        gameOver = true;
        roundActive = false;

        losses++;

        displayDealerCards();

        setMessage("Dealer has Blackjack!");

    }

    updateInterface();
    updateButtons();

}


// =====================================
// DISPLAY DEALER CARDS
// =====================================

function displayDealerCards() {

    dealerCardsElement.innerHTML = "";

    dealerHand.forEach((card, index) => {

        const hidden =
            index === 0 && dealerHidden;

        const element =
            createCardElement(card, hidden);

        dealerCardsElement.appendChild(element);

    });

    displayScoresOnly();
}


// =====================================
// HIT
// =====================================

async function hit() {

    if (
        gameOver ||
        !roundActive ||
        dealingInProgress
    ) {
        return;
    }

    dealingInProgress = true;

    updateButtons();

    deckStatus.textContent = "Dealing";

    await animateDeal(
        playerHand,
        playerCardsElement
    );

    await wait(150);

    dealingInProgress = false;

    deckStatus.textContent = "Deck";

    const playerScore =
        calculateScore(playerHand);


    if (playerScore > 21) {

        gameOver = true;
        roundActive = false;

        losses++;

        setMessage("Bust! Dealer wins.");

    }

    else if (playerScore === 21) {

        setMessage("You have 21. You can stand.");

    }

    else {

        setMessage("Your turn!");

    }

    updateInterface();
    updateButtons();

}


// =====================================
// DOUBLE DOWN
// =====================================

async function doubleDown() {

    if (
        gameOver ||
        !roundActive ||
        dealingInProgress ||
        playerHasDoubled ||
        playerHand.length !== 2
    ) {
        return;
    }

    if (bankroll < currentBet) {
        setMessage("Not enough bankroll to double down.");
        return;
    }

    bankroll -= currentBet;
    currentBet *= 2;
    playerHasDoubled = true;

    updateInterface();

    await hit();

    if (!gameOver) {
        await stand();
    }

}


// =====================================
// STAND
// =====================================

async function stand() {

    if (
        gameOver ||
        !roundActive ||
        dealingInProgress
    ) {
        return;
    }

    dealingInProgress = true;
    gameOver = true;

    updateButtons();

    dealerHidden = false;

    displayDealerCards();

    await wait(600);


    // Dealer draws until score is at least 17.
    while (calculateScore(dealerHand) < 17) {

        deckStatus.textContent = "Dealer drawing";

        await animateDeal(
            dealerHand,
            dealerCardsElement
        );

        await wait(180);

    }


    deckStatus.textContent = "Deck";

    dealingInProgress = false;

    roundActive = false;

    determineWinner();

    updateInterface();
    updateButtons();

}


// =====================================
// DETERMINE WINNER
// =====================================

function determineWinner() {

    const playerScore =
        calculateScore(playerHand);

    const dealerScore =
        calculateScore(dealerHand);


    if (playerScore > 21) {

        losses++;

        setMessage("Bust! Dealer wins.");

    }

    else if (dealerScore > 21) {

        wins++;

        bankroll += currentBet * 2;

        setMessage("Dealer busts! You win!");

    }

    else if (playerScore > dealerScore) {

        wins++;

        bankroll += currentBet * 2;

        setMessage("You win!");

    }

    else if (playerScore < dealerScore) {

        losses++;

        setMessage("Dealer wins!");

    }

    else {

        pushes++;

        bankroll += currentBet;

        setMessage("Push! It's a tie.");

    }

}


// =====================================
// NEW ROUND
// =====================================

function newRound() {

    if (dealingInProgress) {
        return;
    }

    gameOver = true;
    roundActive = false;
    playerHasDoubled = false;

    clearTable();

    deckStatus.textContent = "Ready";

    setMessage("Place your bet and deal.");

    updateInterface();
    updateButtons();

}


// =====================================
// RESET BANKROLL
// =====================================

function resetBankroll() {

    if (dealingInProgress) {
        return;
    }

    bankroll = 1000;
    wins = 0;
    losses = 0;
    pushes = 0;
    currentBet = 25;

    newRound();

    updateInterface();

}


// =====================================
// EVENT LISTENERS
// =====================================

dealButton.addEventListener(
    "click",
    startRound
);


hitButton.addEventListener(
    "click",
    hit
);


standButton.addEventListener(
    "click",
    stand
);


doubleButton.addEventListener(
    "click",
    doubleDown
);


newRoundButton.addEventListener(
    "click",
    newRound
);


resetButton.addEventListener(
    "click",
    resetBankroll
);


// =====================================
// INITIALIZE GAME
// =====================================

createDeck();
shuffleDeck();

updateInterface();
updateButtons();

setMessage("Place your bet and deal.");