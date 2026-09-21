

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

let gameOver = false;

let dealerHidden = true;


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

const hitButton =
    document.getElementById("hit-button");

const standButton =
    document.getElementById("stand-button");

const newGameButton =
    document.getElementById("new-game-button");

const deckElement =
    document.getElementById("deck");

const deckStatus =
    document.getElementById("deck-status");


function createDeck() {

    deck = [];

    for (let suit of suits) {

        for (let rank of ranks) {

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

        const temporaryCard = deck[i];

        deck[i] = deck[randomIndex];

        deck[randomIndex] = temporaryCard;
    }
}


function dealCard(hand) {

    const card = deck.pop();

    hand.push(card);

    return card;
}


function calculateScore(hand) {

    let score = 0;

    let aces = 0;


    for (let card of hand) {

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


    // Hearts and diamonds are red

    if (
        card.suit === "♥" ||
        card.suit === "♦"
    ) {

        cardFace.classList.add("red");
    }


    // Top-left corner

    const topCorner =
        document.createElement("div");

    topCorner.classList.add("card-corner");

    topCorner.innerHTML =
        `${card.rank}<br>${card.suit}`;


    // Center suit

    const center =
        document.createElement("div");

    center.classList.add("card-center");

    center.textContent =
        card.suit;


    // Bottom-right corner

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


function displayCards() {

    playerCardsElement.innerHTML = "";

    dealerCardsElement.innerHTML = "";


    for (let card of playerHand) {

        const cardElement =
            createCardElement(card);

        playerCardsElement.appendChild(
            cardElement
        );
    }


    for (
        let i = 0;
        i < dealerHand.length;
        i++
    ) {

        const hidden =
            i === 0 && dealerHidden;

        const cardElement =
            createCardElement(
                dealerHand[i],
                hidden
            );

        dealerCardsElement.appendChild(
            cardElement
        );
    }


    playerScoreElement.textContent =
        calculateScore(playerHand);


    if (dealerHidden) {

        dealerScoreElement.textContent = "?";

    } else {

        dealerScoreElement.textContent =
            calculateScore(dealerHand);
    }
}


function animateDeal(hand, element, hidden = false) {
    const card = dealCard(hand);

    const cardElement = createCardElement(card, true);

    element.appendChild(cardElement);

    const deckRect = deckElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    const startX =
        deckRect.left +
        deckRect.width / 2 -
        (cardRect.left + cardRect.width / 2);

    const startY =
        deckRect.top +
        deckRect.height / 2 -
        (cardRect.top + cardRect.height / 2);

    cardElement.style.translate =
        `${startX}px ${startY}px`;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            cardElement.style.translate = "0 0";
        });
    });

    setTimeout(() => {
        if (!hidden) {
            cardElement.classList.remove("flipped");
        }
    }, 500);

    displayScoresOnly();
}


// =============================
// UPDATE ONLY SCORES
// =============================

function displayScoresOnly() {

    playerScoreElement.textContent =
        calculateScore(playerHand);


    if (dealerHidden) {

        dealerScoreElement.textContent = "?";

    } else {

        dealerScoreElement.textContent =
            calculateScore(dealerHand);
    }
}


// =============================
// START NEW GAME
// =============================

async function newGame() {

    gameOver = true;

    hitButton.disabled = true;

    standButton.disabled = true;


    playerHand = [];

    dealerHand = [];


    // -------------------------
    // Shuffle
    // -------------------------

    deckStatus.textContent =
        "Shuffling...";

    deckElement.classList.add(
        "shuffling"
    );


    createDeck();

    shuffleDeck();


    await wait(1000);


    deckElement.classList.remove(
        "shuffling"
    );


    deckStatus.textContent =
        "Dealing";


    dealerHidden = true;


    playerCardsElement.innerHTML = "";

    dealerCardsElement.innerHTML = "";


    // -------------------------
    // Deal first card
    // -------------------------

    animateDeal(
        playerHand,
        playerCardsElement
    );


    await wait(700);


    // -------------------------
    // Dealer first card
    // -------------------------

    animateDeal(
        dealerHand,
        dealerCardsElement,
        true
    );


    await wait(700);


    // -------------------------
    // Player second card
    // -------------------------

    animateDeal(
        playerHand,
        playerCardsElement
    );


    await wait(700);


    // -------------------------
    // Dealer second card
    // -------------------------

    animateDeal(
        dealerHand,
        dealerCardsElement
    );


    await wait(700);


    deckStatus.textContent =
        "Deck";


    gameOver = false;

    hitButton.disabled = false;

    standButton.disabled = false;


    messageElement.textContent =
        "Your turn!";


    displayScoresOnly();


    checkBlackjack();
}


// =============================
// WAIT FUNCTION
// =============================

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


// =============================
// HIT
// =============================

async function hit() {

    if (gameOver) {
        return;
    }


    hitButton.disabled = true;


    deckStatus.textContent =
        "Dealing...";


    animateDeal(
        playerHand,
        playerCardsElement
    );


    await wait(700);


    const playerScore =
        calculateScore(playerHand);


    if (playerScore > 21) {

        messageElement.textContent =
            "Bust! Dealer wins.";

        gameOver = true;

        hitButton.disabled = true;

        standButton.disabled = true;

    }

    else if (playerScore === 21) {

        messageElement.textContent =
            "21!";

        hitButton.disabled = false;

    }

    else {

        hitButton.disabled = false;
    }


    deckStatus.textContent =
        "Deck";
}


// =============================
// STAND
// =============================

async function stand() {

    if (gameOver) {
        return;
    }


    gameOver = true;

    hitButton.disabled = true;

    standButton.disabled = true;


    // Reveal dealer's hidden card

    dealerHidden = false;

    displayCards();


    await wait(700);


    // Dealer draws until 17

    while (
        calculateScore(dealerHand) < 17
    ) {

        deckStatus.textContent =
            "Dealer drawing...";


        animateDeal(
            dealerHand,
            dealerCardsElement
        );


        await wait(700);
    }


    deckStatus.textContent =
        "Deck";


    determineWinner();
}


// =============================
// CHECK BLACKJACK
// =============================

function checkBlackjack() {

    const playerScore =
        calculateScore(playerHand);

    const dealerScore =
        calculateScore(dealerHand);


    if (
        playerScore === 21 &&
        dealerScore === 21
    ) {

        dealerHidden = false;

        displayCards();

        messageElement.textContent =
            "Both have Blackjack! Push.";

        gameOver = true;

    }

    else if (playerScore === 21) {

        messageElement.textContent =
            "Blackjack! You win!";

        gameOver = true;

    }

    else if (dealerScore === 21) {

        dealerHidden = false;

        displayCards();

        messageElement.textContent =
            "Dealer has Blackjack!";

        gameOver = true;
    }


    if (gameOver) {

        hitButton.disabled = true;

        standButton.disabled = true;
    }
}


// =============================
// DETERMINE WINNER
// =============================

function determineWinner() {

    const playerScore =
        calculateScore(playerHand);

    const dealerScore =
        calculateScore(dealerHand);


    if (dealerScore > 21) {

        messageElement.textContent =
            "Dealer busts! You win!";

    }

    else if (playerScore > dealerScore) {

        messageElement.textContent =
            "You win!";

    }

    else if (playerScore < dealerScore) {

        messageElement.textContent =
            "Dealer wins!";

    }

    else {

        messageElement.textContent =
            "Push! It's a tie.";
    }
}


// =============================
// BUTTONS
// =============================

hitButton.addEventListener(
    "click",
    hit
);


standButton.addEventListener(
    "click",
    stand
);


newGameButton.addEventListener(
    "click",
    newGame
);


// =============================
// START
// =============================

newGame();