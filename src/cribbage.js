export let eCardSuit = { None: 0, Spade: 1, Club: 2, Heart: 3, Diamond: 4 };
export let eCardValue = { None: 0, Ace: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10, Jack: 11, Queen: 12, King: 13 };
export let eCribOwner = { None: 0, Own: 1, Opponent: 2 };

export function getShuffledCardDeck()
{
    var cardDeck = [];
    for (var suitIndex = 1; suitIndex <= 4; suitIndex++)
        for (var valueIndex = 1; valueIndex <= 13; valueIndex++)
            cardDeck.push(new Card(suitIndex, valueIndex));

    var shuffledCardDeck = [];
    while (cardDeck.length > 0)
    {
        var randomIndex = getRndInteger(0, cardDeck.length - 1);
        shuffledCardDeck.push(new Card(cardDeck[randomIndex].suit, cardDeck[randomIndex].value));
        cardDeck.splice(randomIndex, 1);      
    }

    return shuffledCardDeck;
}

export function Card(suit, value, x, y) 
{
    this.suit = suit;
    this.value = value;
    this.x = x ? x : -1;
    this.y = y ? y : -1;
	this.isSelcted = false;
	this.displayInHand = true;
}

Card.prototype.cardValue = function ()
{
    return this.value > eCardValue.Ten ? 10 : this.value;
};

Card.prototype.suitName = function ()
{
    switch (this.suit)
    {
        case eCardSuit.Spade:
            return "Spade";
        case eCardSuit.Club:
            return "Club";
        case eCardSuit.Heart:
            return "Heart";
        case eCardSuit.Diamond:
            return "Diamond";
        default:
            return "Invalid";     
    }
};

Card.prototype.valueName = function ()
{
    switch (this.value)
    {
        case eCardValue.Ace:
            return "Ace";
        case eCardValue.Two:
            return "2";
        case eCardValue.Three:
            return "3";
        case eCardValue.Four:
            return "4";
        case eCardValue.Five:
            return "5";
        case eCardValue.Six:
            return "6";
        case eCardValue.Seven:
            return "7";
        case eCardValue.Eight:
            return "8";
        case eCardValue.Nine:
            return "9";
        case eCardValue.Ten:
            return "10";
        case eCardValue.Jack:
            return "Jack";
        case eCardValue.Queen:
            return "Queen";
        case eCardValue.King:
            return "King";
        default:
            return "Invalid";     
    }
};

function displayCards(cards, drawCard, sorted)
{
    var displayCards = cards.slice();
    
    if (drawCard)
        displayCards.push(drawCard);
    
    if (sorted)
        displayCards.sort(function (item1, item2) { return item1.value - item2.value});

    displayCards.forEach(function (item)
    {
        console.log(item.valueName(),'of', item.suitName() + 's' + (drawCard && item.suit == drawCard.suit && item.value == drawCard.value ? ' (Draw)' : ''));
    });
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

//var cardDeck = getShuffledCardDeck();
//var dealtHand = cardDeck.slice(0, 6);

/*var dealtHand = [];
dealtHand.push(new Card(eCardSuit.Diamond, eCardValue.Three));
dealtHand.push(new Card(eCardSuit.Spade, eCardValue.Three));
dealtHand.push(new Card(eCardSuit.Diamond, eCardValue.Five));
dealtHand.push(new Card(eCardSuit.Heart, eCardValue.Five));
dealtHand.push(new Card(eCardSuit.Diamond, eCardValue.Seven));
dealtHand.push(new Card(eCardSuit.Club, eCardValue.Queen)); */

//var drawCard = new Card(eCardSuit.Club, eCardValue.King);
//var drawCard = null;

//displayCards(dealtHand, drawCard, true);

//console.log("");
//console.log("Total Score: " + calcHandScore(dealtHand, drawCard));

/*var selectedCribCards = cribSelect(dealtHand, eCribOwner.Own);

console.log("");
console.log("Crib Cards");
console.log("-------------------");
displayCards(selectedCribCards, null, true); */

testPegCardSelect();

function testPegCardSelect()
{
    var discardedCards = [];
    discardedCards.push(new Card(eCardSuit.Heart, eCardValue.King));
    discardedCards.push(new Card(eCardSuit.Spade, eCardValue.Ace));
    discardedCards.push(new Card(eCardSuit.Heart, eCardValue.Three));
    //discardedCards.push(new Card(eCardSuit.Spade, eCardValue.Six));
    //discardedCards.push(new Card(eCardSuit.Club, eCardValue.Six));

    var handCards = [];
    handCards.push(new Card(eCardSuit.Club, eCardValue.Ace));
    handCards.push(new Card(eCardSuit.Spade, eCardValue.Two));
    handCards.push(new Card(eCardSuit.Diamond, eCardValue.Three));
    
    var result = pegCardSelect(discardedCards, handCards);

    displayCards(discardedCards, null, false);
    
    console.log("");
    if (result.card == null)
        console.log("Go");
    else
        console.log(result.card.valueName(), 'of', result.card.suitName() + 's - score: ' + result.score);
}

export function getPegCardScore(discardedCards, card)
{
	var score = 0;

	var orderedCards = discardedCards.slice().reverse();
	
	var currentPointTotal = orderedCards.reduce(function (total, item) {  return total + item.cardValue(); }, 0);
	if (currentPointTotal + card.cardValue() > 31)
		return -1;
		
	// Straight
	for (var runCheckIndex = 4; runCheckIndex >= 2 && score == 0; runCheckIndex--)
	{
		if (orderedCards.length >= runCheckIndex)
		{
			var runCheckCards = orderedCards.slice(0, runCheckIndex);
			runCheckCards.push(card);
			score = calcStraightScore(runCheckCards);
		}
	}
		
	// Pairs
	if (orderedCards.length > 0 && card.value == orderedCards[0].value)
	{
		var allPairCards = [];
		allPairCards.push(card);
		for (var index = 0; index < orderedCards.length; index++)
		{
			if (orderedCards[index].value == card.value)
				allPairCards.push(orderedCards[index])
			else
				break;
		}
		score += calcPairsScore(allPairCards);
	}
		
   	// Fifteen
   	if (card.cardValue() + currentPointTotal == 15)
		score += 2;

   	// Thirty-one
   	if (card.cardValue() + currentPointTotal == 31)
   		score += 2;
      
	return score;
}

export function pegCardSelect(discardedCards, handCards)
{
    var selectedCard = null;
    var maxScore = 0;
	
	handCards.forEach(function (card)
	{
		let score = getPegCardScore(discardedCards, card);
		if (score > maxScore)
		{
			maxScore = score;
			selectedCard = card;
		}
	});

    if (selectedCard == null)
    {
		var currentPointTotal = discardedCards.reduce(function (total, item) {  return total + item.cardValue(); }, 0);
		
        var otherCards = handCards.filter(function (item) { return item.cardValue() + currentPointTotal <= 31; });
        if (otherCards.length > 0)
        {
            otherCards.sort(function (item1, item2) { return item2.value - item1.value});
            var otherNon21Cards = otherCards.filter(function (item) { return item.cardValue() + currentPointTotal != 21; });
            selectedCard = otherNon21Cards.length > 0 ? otherNon21Cards[0] : otherCards[0];
        }
    }
    
    return selectedCard;
}

export function pegCardSelect_Old(discardedCards, handCards)
{
    var selectedCard = null;
    var score = 0;
    
    var orderedCards = discardedCards.slice().reverse();

    var currentPointTotal = orderedCards.reduce(function (total, item) {  return total + item.cardValue(); }, 0);

    // Check for run
    var runCards = null;
    for (var runCheckIndex = 4; runCheckIndex >= 2 && selectedCard == null; runCheckIndex--)
    {
        if (orderedCards.length >= runCheckIndex)
        {
            for (var handIndex = 0; handIndex < handCards.length; handIndex++)
            {
                if (handCards[handIndex].cardValue() + currentPointTotal <= 31)
                {    
                    var runCheckCards = orderedCards.slice(0, runCheckIndex);
                    runCheckCards.push(handCards[handIndex]);
                    var tempRunScore = calcStraightScore(runCheckCards);
                    if (tempRunScore > score)
                    {
                        selectedCard = handCards[handIndex];
                        score = tempRunScore;
                        runCards = runCheckCards.slice();
                    }
                }
            }
        }
    }
  
    if (selectedCard != null)
        score += calcPairsScore(runCards);
    else
    {
		// Check for pair(s)
		if (orderedCards.count > 0)
		{
			var pairedCard = handCards.find(function (item) { return item.value == orderedCards[0].value; });
			if (pairedCard && pairedCard.cardValue() + currentPointTotal <= 31)
			{
				selectedCard = pairedCard;

				var allPairCards = [];
				allPairCards.push(selectedCard);
				for (var index = 0; index < orderedCards.length; index++)
				{
					if (orderedCards[index].value == selectedCard.value)
						allPairCards.push(orderedCards[index])
					else
						break;
				}
				score += calcPairsScore(allPairCards);
			}
		}
    }

    // Check for fifteen            
    if (selectedCard == null)
    {
        var fifteenCard = handCards.find(function (item) { return item.cardValue() + currentPointTotal == 15; });
        if (fifteenCard)
             selectedCard = fifteenCard;
    }

    // Check for thirty-one
    if (selectedCard == null)
    {    
        var thirtyOneCard = handCards.find(function (item) { return item.cardValue() + currentPointTotal == 31; });
        if (thirtyOneCard)
            selectedCard = thirtyOneCard;
    }

    // Other
    if (selectedCard == null)
    {    
        var otherCards = handCards.filter(function (item) { return item.cardValue() + currentPointTotal <= 31; });
        if (otherCards.length > 0)
        {
            otherCards.sort(function (item1, item2) { return item2.value - item1.value});
            var otherNon21Cards = otherCards.filter(function (item) { return item.cardValue() + currentPointTotal != 21; });
            selectedCard = otherNon21Cards.length > 0 ? otherNon21Cards[0] : otherCards[0];
        }
    }
    
    if (selectedCard != null && (currentPointTotal + selectedCard.cardValue() == 15 || currentPointTotal + selectedCard.cardValue() == 31))
        score += 2;

    return {card: selectedCard, score: score};
}

export function cribSelect(cardHand, cribOwner)
{
    var possibleHands = [];
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[1], cardHand[2], cardHand[3]], crib: [cardHand[4], cardHand[5]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[1], cardHand[2], cardHand[4]], crib: [cardHand[3], cardHand[5]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[1], cardHand[2], cardHand[5]], crib: [cardHand[3], cardHand[4]], cribScore: 0});        
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[1], cardHand[3], cardHand[4]], crib: [cardHand[2], cardHand[5]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[1], cardHand[3], cardHand[5]], crib: [cardHand[2], cardHand[4]], cribScore: 0});    
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[1], cardHand[4], cardHand[5]], crib: [cardHand[2], cardHand[3]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[2], cardHand[3], cardHand[4]], crib: [cardHand[1], cardHand[5]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[2], cardHand[3], cardHand[5]], crib: [cardHand[1], cardHand[4]], cribScore: 0});    
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[2], cardHand[4], cardHand[5]], crib: [cardHand[1], cardHand[3]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[0], cardHand[3], cardHand[4], cardHand[5]], crib: [cardHand[1], cardHand[2]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[1], cardHand[2], cardHand[3], cardHand[4]], crib: [cardHand[0], cardHand[5]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[1], cardHand[2], cardHand[3], cardHand[5]], crib: [cardHand[0], cardHand[4]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[1], cardHand[2], cardHand[4], cardHand[5]], crib: [cardHand[0], cardHand[3]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[1], cardHand[3], cardHand[4], cardHand[5]], crib: [cardHand[0], cardHand[2]], cribScore: 0});
    possibleHands.push({score: 0, cards: [cardHand[2], cardHand[3], cardHand[4], cardHand[5]], crib: [cardHand[0], cardHand[1]], cribScore: 0});

    possibleHands.forEach(function (item)
    {
        item.score = calcHandScore(item.cards);
        item.cribScore = calcHandScore(item.crib);
    });

    if (cribOwner == eCribOwner.Own)
        possibleHands.sort(function (item1, item2) { return (item2.score + item2.cribScore) - (item1.score + item1.cribScore)});
    else
        possibleHands.sort(function (item1, item2) { return (item2.score - item2.cribScore) - (item1.score - item1.cribScore)});
    
    return possibleHands[0].crib;
}

export function calcHandScore(cardHand, drawCard)
{
    var allCards = cardHand.slice();
    if (drawCard)
        allCards.push(drawCard);
   
    var totalScore = 0;

    var fifteensScore = calcFifteensScore(allCards);
    var flushScore = calcFlushScore(cardHand, drawCard);
    var straightScore = calcStraightScore(allCards);
    var pairsScore = calcPairsScore(allCards);
    var jackScore = calcJackScore(cardHand, drawCard);

    //console.log("Fifteens score: " + fifteensScore);
    //console.log("Flush score: " + flushScore);
    //console.log("Straight score: " + straightScore);
    //console.log("Pairs score: " + pairsScore);
    //console.log("Jack score: " + jackScore);

    totalScore = fifteensScore + flushScore + straightScore + pairsScore + jackScore;
 
    return totalScore;
}

function calcFifteensScore(cards)
{
    var score = 0;

    score += cards[0].cardValue() + cards[1].cardValue() == 15 ? 2 : 0;

    if (cards.length > 2)            
    {
        score += cards[0].cardValue() + cards[2].cardValue() == 15 ? 2 : 0;
        score += cards[0].cardValue() + cards[1].cardValue() + cards[2].cardValue() == 15 ? 2 : 0;
        score += cards[1].cardValue() + cards[2].cardValue() == 15 ? 2 : 0;
        
        if (cards.length > 3)
        {
            score += cards[0].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
            score += cards[0].cardValue() + cards[1].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
            score += cards[0].cardValue() + cards[2].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
            score += cards[0].cardValue() + cards[1].cardValue() + cards[2].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
            score += cards[1].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
            score += cards[1].cardValue() + cards[2].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
            score += cards[2].cardValue() + cards[3].cardValue() == 15 ? 2 : 0;
                
            if (cards.length > 4)            
            {
                score += cards[0].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[0].cardValue() + cards[1].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[0].cardValue() + cards[2].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[0].cardValue() + cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[0].cardValue() + cards[1].cardValue() + cards[2].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;        
                score += cards[0].cardValue() + cards[2].cardValue() + cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[0].cardValue() + cards[1].cardValue() + cards[2].cardValue() + cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[1].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[1].cardValue() + cards[2].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[1].cardValue() + cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[1].cardValue() + cards[2].cardValue() + cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[2].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;    
                score += cards[2].cardValue() + cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
                score += cards[3].cardValue() + cards[4].cardValue() == 15 ? 2 : 0;
            }
        }  
    }
    
    return score;
}

function calcFlushScore(cardHand, drawCard)
{
    var score = 0;

    if (cardHand.length >= 4)
    {
        if (cardHand.every(function (item) { return item.suit == cardHand[0].suit; }))
        {
            score += 4;
            if (drawCard && drawCard.suit == cardHand[0].suit)
                score += 1;
        }
    }

    return score;
}

function calcStraightScore(cards)
{
    var totalCount = 0;

    if (cards.length >= 3)
    {
        var sortedCards = cards.slice().sort(function (item1, item2) { return item1.value - item2.value});

        totalCount = calcStraightScoreRecurse(sortedCards, 1);
    }

    return totalCount;
}

function calcStraightScoreRecurse(cards, startCount)
{
    var totalCount = 0;

    var priorValue = cards[0].value;
    var count = startCount;
    for (var index = 1; index < cards.length; index++)
    {
        if (cards[index].value == priorValue)
            totalCount += calcStraightScoreRecurse(cards.slice(index), count);
        else if (cards[index].value - priorValue == 1)
        {
            count++;                
            priorValue = cards[index].value;
        }
        else
            totalCount += calcStraightScoreRecurse(cards.slice(index), 1);
    }

    if (count > 2)
        totalCount += count;

    return totalCount;
}

function calcPairsScore(cards)
{
    var score = 0;

    var usedValues = [];
    for (var index = 0; index < cards.length; index++)
    {
        if (!usedValues.some(function (value) { return value == cards[index].value; }))
        {
            var filtered = cards.filter(function (item) { return item.value == cards[index].value; });
            if (filtered.length == 2)
                score += 2;
            else if (filtered.length == 3)
                score += 6;
            else if (filtered.length == 4)
                score += 12;

            usedValues.push(cards[index].value);
        }
    }

    return score;
}

function calcJackScore(cardHand, drawCard)
{
    if (drawCard)
        for (var index = 0; index < cardHand.length; index++)
            if (cardHand[index].value == eCardValue.Jack && cardHand[index].suit == drawCard.suit)
                return 1;
    return 0;
}