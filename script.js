const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = ['♠', '♥', '♣', '♦'];

let allDecks = [];
let dealerHand = [];
let playerHand = [];
let currentBet = 0;
let remainingBalance = 1000;

const cardModel = document.createElement('div');
cardModel.classList.add('card');

const dealer = document.getElementById("dealer");
const player = document.getElementById("player");
const hit = document.getElementById("hit");
const pass = document.getElementById("pass");
const buttonContainer = document.getElementById("button-container");
const notice = document.getElementById("notice");
const nextHand = document.getElementById("next-hand");
const gameBalanceDisplay = document.getElementById('game-balance');
const currentBetDisplay = document.getElementById('current-bet');

const createDeck = () => {
    const deck = [];
    suits.forEach((suit) => {
        values.forEach((value) => {
            const card = value + suit;
            deck.push(card)
        })
    })
    return deck;
}

const shuffleDecks = (num) => {
    for (let i = 0; i < num; i++) {
        const newDeck = createDeck();
        allDecks = [...allDecks, ...newDeck];
    }
}

const chooseRandomCard = () => {
    const totalCards = allDecks.length;
    let randomNumber = Math.floor(Math.random() * totalCards);
    const randomCard = allDecks[randomNumber];
    allDecks.splice(randomNumber, 1);
    return randomCard;
}

const dealHands = async () => {
    dealerHand = [await chooseRandomCard(), await chooseRandomCard()];
    playerHand = [await chooseRandomCard(), await chooseRandomCard()];
    return { dealerHand, playerHand };
}

const calcHandValue = (hand) => {
    let value = 0;
    let hasAce = false;
    hand.forEach((card) => {
        let cardValue = card.length === 2 ? card.substring(0, 1) : card.substring(0, 2);
        if (cardValue === 'A') hasAce = true;
        else if (cardValue === 'J' || cardValue === 'Q' || cardValue === 'K') value += 10;
        else value += Number(cardValue);
    })
    if (hasAce) value + 11 > 21 ? value += 1 : value += 11;
    return value;
}

const showNotice = (text) => {
    notice.children[0].children[0].innerHTML = text;
    notice.style.display = "flex";
    buttonContainer.style.display = "none";
    updatePlayerHandValueDisplay(calcHandValue(playerHand));
    updateDisplays();
}

const determineWinner = async () => {
    let playerValue = await calcHandValue(playerHand);
    let dealerValue = await calcHandValue(dealerHand);
    let text = '';

    if (playerValue > 21) {
        text = `Bust! Your hand is ${playerHand} with a value of ${playerValue}. Dealer Wins!`;
    } else if (dealerValue > 21 || playerValue > dealerValue) {
        text = `Your hand is ${playerHand} with a value of ${playerValue}. The dealer's hand is ${dealerHand} with a value of ${dealerValue}. You win!`;
        remainingBalance += currentBet * 2;
    } else if (playerValue < dealerValue) {
        text = `Your hand is ${playerHand} with a value of ${playerValue}. The dealer's hand is ${dealerHand} with a value of ${dealerValue}. Dealer Wins!`;
    } else {
        text = `Your hand is ${playerHand} with a value of ${playerValue}. The dealer's hand is ${dealerHand} with a value of ${dealerValue}. It's a tie!`;
        remainingBalance += currentBet; 
    }

    currentBet = 0;
    showNotice(text);
};

const hitDealer = async () => {
    const hiddenCard = dealer.children[0];
    hiddenCard.classList.remove('back');
    hiddenCard.innerHTML = dealerHand[0];
    let handValue = await calcHandValue(dealerHand);

    while (handValue < 17) {
        const card = await chooseRandomCard();
        dealerHand.push(card);
        const newCard = cardModel.cloneNode(true);
        newCard.innerHTML = card;
        dealer.append(newCard);
        handValue = await calcHandValue(dealerHand);
    }

    if (handValue === 21) {
        showNotice("Dealer has 21! Dealer wins!")
    } else if (handValue > 21) {
        showNotice("Dealer bust! You win!")
    } else {
        determineWinner()
    }
}

const hitPlayer = async () => {
    const card = await chooseRandomCard();
    playerHand.push(card);
    const newCard = cardModel.cloneNode(true);
    newCard.innerHTML = card;
    player.append(newCard);

    let handValue = await calcHandValue(playerHand);
    updatePlayerHandValueDisplay(handValue);

    if (handValue > 21) {
        let text = `Bust! Your hand is ${playerHand} with a value of ${handValue}.`;
        showNotice(text);
    } else if (handValue === 21) {
        hitDealer();
    }
}

const clearHands = () => {
    while (dealer.children.length > 0) {
        dealer.children[0].remove()
    }
    while (player.children.length > 0) {
        player.children[0].remove()
    }
    return true;
}

const play = async () => {
    if (allDecks.length < 10) shuffleDecks();
    clearHands();
    resetBet(); 
    const { dealerHand, playerHand } = await dealHands();
    dealerHand.forEach((card, index) => {
        const newCard = cardModel.cloneNode(true);
        (card[card.length -1] === '♥' || card[card.length -1] === '♦') && newCard.setAttribute('data-red', true);
        index === 0 ? newCard.classList.add('back') : newCard.innerHTML = card;
        dealer.append(newCard);
    })
    playerHand.forEach((card) => {
        const newCard = cardModel.cloneNode(true);
        (card[card.length -1] === '♥' || card[card.length -1] === '♦') && newCard.setAttribute('data-red', true);
        newCard.innerHTML = card;
        player.append(newCard);
    })
    updatePlayerHandValueDisplay(calcHandValue(playerHand));
    notice.style.display = "none";
    buttonContainer.style.display = "block";
    updateDisplays();
}

const setBet = (amount) => {
    if (amount <= remainingBalance) {
        currentBet += amount;
        remainingBalance -= amount;
        updateDisplays();
    }
}

const updateDisplays = () => {
    gameBalanceDisplay.innerHTML = `Game Balance: $${remainingBalance}`;
    currentBetDisplay.innerHTML = `Current Bet: $${currentBet}`;
}

const resetBet = () => {
    remainingBalance += currentBet;
    currentBet = 0;
    updateDisplays();
}

const updatePlayerHandValueDisplay = (handValue) => {
    const playerHandValueDisplay = document.getElementById('player-hand-value');
    playerHandValueDisplay.innerHTML = `Hand Total: ${handValue}`;
}


hit.addEventListener('click', hitPlayer);
pass.addEventListener('click', hitDealer);
nextHand.addEventListener('click', play);

shuffleDecks(3);
play();
updateDisplays();