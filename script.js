// The suits and ranks for the deck
const suits = ["♥", "♦", "♣", "♠"];
const ranks = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
];

// Game variables
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;


const playerCardsElement = document.getElementById("player-cards");
const dealerCardsElement = document.getElementById("dealer-cards");

const playerScoreElement = document.getElementById("player-score");
const dealerScoreElement = document.getElementById("dealer-score");

const messageElement = document.getElementById("message");

const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const newGameButton = document.getElementById("new-game-button");


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

        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temporaryCard = deck[i];

        deck[i] = deck[randomIndex];

        deck[randomIndex] = temporaryCard;
    }
}


function dealCard(hand) {

    const card = deck.pop();

    hand.push(card);

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

        } else if (card.rank === "A") {

            score += 11;
            aces++;

        } else {

            score += Number(card.rank);

        }
    }


    // Turn an Ace from 11 into 1
    // if the hand would otherwise go over 21

    while (score > 21 && aces > 0) {

        score -= 10;
        aces--;

    }

    return score;
}


function displayCards() {

    // Clear the old cards
    playerCardsElement.innerHTML = "";
    dealerCardsElement.innerHTML = "";


    // Display player's cards

    for (let card of playerHand) {

        const cardElement = document.createElement("div");

        cardElement.classList.add("card");

        cardElement.textContent = card.rank + card.suit;

        playerCardsElement.appendChild(cardElement);
    }


    // Display dealer's cards

    for (let card of dealerHand) {

        const cardElement = document.createElement("div");

        cardElement.classList.add("card");

        cardElement.textContent = card.rank + card.suit;

        dealerCardsElement.appendChild(cardElement);
    }


    // Update scores

    playerScoreElement.textContent =
        calculateScore(playerHand);

    dealerScoreElement.textContent =
        calculateScore(dealerHand);
}


function newGame() {

    createDeck();

    shuffleDeck();

    playerHand = [];
    dealerHand = [];

    gameOver = false;

    // Deal two cards to player
    dealCard(playerHand);
    dealCard(playerHand);

    // Deal two cards to dealer
    dealCard(dealerHand);
    dealCard(dealerHand);

    messageElement.textContent = "Your turn!";

    hitButton.disabled = false;
    standButton.disabled = false;

    displayCards();

    checkBlackjack();
}


function checkBlackjack() {

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (playerScore === 21 && dealerScore === 21) {

        messageElement.textContent = "Both have Blackjack! Push.";

        gameOver = true;

    } else if (playerScore === 21) {

        messageElement.textContent = "Blackjack! You win!";

        gameOver = true;

    } else if (dealerScore === 21) {

        messageElement.textContent = "Dealer has Blackjack!";

        gameOver = true;
    }


    if (gameOver) {

        hitButton.disabled = true;
        standButton.disabled = true;

    }
}


function hit() {

    if (gameOver) {
        return;
    }

    dealCard(playerHand);

    displayCards();

    const playerScore = calculateScore(playerHand);


    if (playerScore > 21) {

        messageElement.textContent = "Bust! Dealer wins.";

        gameOver = true;

        hitButton.disabled = true;
        standButton.disabled = true;

    } else if (playerScore === 21) {

        messageElement.textContent = "21! You should stand.";

    }
}


function stand() {

    if (gameOver) {
        return;
    }

    // Dealer draws until reaching at least 17

    while (calculateScore(dealerHand) < 17) {

        dealCard(dealerHand);

    }

    displayCards();

    determineWinner();
}


function determineWinner() {

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);


    if (dealerScore > 21) {

        messageElement.textContent =
            "Dealer busts! You win!";

    } else if (playerScore > dealerScore) {

        messageElement.textContent =
            "You win!";

    } else if (playerScore < dealerScore) {

        messageElement.textContent =
            "Dealer wins!";

    } else {

        messageElement.textContent =
            "Push! It's a tie.";
    }


    gameOver = true;

    hitButton.disabled = true;
    standButton.disabled = true;
}


hitButton.addEventListener("click", hit);

standButton.addEventListener("click", stand);

newGameButton.addEventListener("click", newGame);


newGame();