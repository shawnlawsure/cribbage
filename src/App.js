import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col } from 'react-bootstrap';

import * as crib from './cribbage';
import cardImage from './cardDeck.png';

import * as impIndex from './index.js';

let g_cardImageXPos = [0, 99, 198, 296, 395, 493, 592, 690, 788, 887, 985, 1084, 1182]
let g_cardWidth = 99;
let g_cardHeight = 153;
let gCardFrontXPos = 197;
let gCardFrontYPos = 614;
let gCardPileShowFactor = .2;

let eGameState = { None: 0, CribSelect: 1, Pegging: 2, Done: 3 };
let eCribSelectState = { NotSelected: 0, Selected: 1, Done: 2 };
let ePlayer = { None: 0, Player1: 1, Player2: 2 };

function App() {
    
    return (
      	<div className="App">
			{/*<header className="App-header"></header>*/}
        		<Game />
      	</div>
    );
}

class Game extends React.Component 
{
	constructor(props)
	{
		super(props);

		this.cribCards = [];
		this.drawCard = null;
		this.cribTurn = ePlayer.Player1;
		this.isOpponentComputer = true;

		this.playerTurn = ePlayer.Player1;
		
		this.state =
		{
			gameState: eGameState.None,
			testDisplay: "",
			player1TotalScore: 0,
			player2TotalScore: 0
		};		
		
		this.updateCrib = this.updateCrib.bind(this);
		this.cardSelect = this.cardSelect.bind(this);
		this.computerPeg = this.computerPeg.bind(this);	  
	}

	componentDidMount() 
	{
		this.newRound();
	}
	
	newRound()
	{
		this.setState({ gameState: eGameState.CribSelect });	
				
		//this.cribTurn = this.cribTurn == ePlayer.None || this.cribTurn == ePlayer.Player2 ? ePlayer.Player1 : ePlayer.Player2;
		this.cribCards.length = 0;

		// TESTING!
		/*var cardDeck = [];

		if (this.owner == ePlayer.Player1)
		{
			cardDeck.push(new crib.Card(crib.eCardSuit.Diamond, crib.eCardValue.Queen));
			cardDeck.push(new crib.Card(crib.eCardSuit.Spade, crib.eCardValue.Nine));
			cardDeck.push(new crib.Card(crib.eCardSuit.Diamond, crib.eCardValue.Ace));
			cardDeck.push(new crib.Card(crib.eCardSuit.Club, crib.eCardValue.Four));
			cardDeck.push(new crib.Card(crib.eCardSuit.Spade, crib.eCardValue.Eight));
			cardDeck.push(new crib.Card(crib.eCardSuit.Spade, crib.eCardValue.Seven));
		}
		else
		{
			cardDeck.push(new crib.Card(crib.eCardSuit.Diamond, crib.eCardValue.Jack));
			cardDeck.push(new crib.Card(crib.eCardSuit.Diamond, crib.eCardValue.Queen));
			cardDeck.push(new crib.Card(crib.eCardSuit.Diamond, crib.eCardValue.King));
			cardDeck.push(new crib.Card(crib.eCardSuit.Diamond, crib.eCardValue.Ten));
			cardDeck.push(new crib.Card(crib.eCardSuit.Spade, crib.eCardValue.Jack));
			cardDeck.push(new crib.Card(crib.eCardSuit.Spade, crib.eCardValue.Queen));
		}*/
		
		let cardDeck = crib.getShuffledCardDeck();

		var player1Hand = cardDeck.slice(0, 6);  
		var player2Hand = cardDeck.slice(6, 12);  
		this.drawCard = cardDeck[12];

		this.refs.player1.newHand(player1Hand, this.cribTurn == ePlayer.Player1);
		this.refs.player2.newHand(player2Hand, this.cribTurn == ePlayer.Player2);	
		
		this.refs.player1Scoreboard.refresh();
		this.refs.player2Scoreboard.refresh();		
	}

	updateTestDisplay(text)
	{
		//this.setState({ testDisplay: text });	
	}

	updateCrib(cards) 
	{
		this.cribCards = this.cribCards.concat(cards);
		this.setState({ gameState: eGameState.Pegging });
		
		if (this.cribCards.length == 4)
		{
			displayCard(this.refs.drawCardCanvas.getContext("2d"), this.drawCard, 0);
						
			if (this.cribTurn == ePlayer.Player1 && this.isOpponentComputer)
				this.determineNext(ePlayer.Player2);
		}			
	}  

  	cardSelect(player, card)
  	{
		if (player == this.playerTurn && (card.cardValue() + this.refs.peg.pegScore <= 31))
		{
			let pegScore = crib.getPegCardScore(this.refs.peg.cards, card);
			if (pegScore > 0)
			{
				this.setState({ player1TotalScore: this.state.player1TotalScore + pegScore });									
				this.refs.player1Scoreboard.addPegScore(pegScore);
			}

			this.refs.peg.addCard(card);			
			if (player == ePlayer.Player1)
				this.refs.player1.removeCard(card);
			else
				this.refs.player2.removeCard(card);
				
			this.determineNext();

			return true;
		}
		else
			return false;
  	}

	determineNext(playerTurn)
	{
		let pegScore = this.refs.peg.pegScore;

		let player1Cards = this.refs.player1.getAvailableCards();
		let player2Cards = this.refs.player2.getAvailableCards();
		
		let isPlayer1CardAvailable = player1Cards.filter(function (card) { return card.cardValue() + pegScore <= 31; }).length > 0;
		let isPlayer2CardAvailable = player2Cards.filter(function (card) { return card.cardValue() + pegScore <= 31; }).length > 0;
	
		var nextPlayerTurn = playerTurn ? playerTurn : this.playerTurn == ePlayer.Player1 ? ePlayer.Player2 : ePlayer.Player1;

		if (isPlayer2CardAvailable && (nextPlayerTurn == ePlayer.Player2 || !isPlayer1CardAvailable))
			nextPlayerTurn = ePlayer.Player2;
		else if (isPlayer1CardAvailable && (nextPlayerTurn != ePlayer.Player2 || !isPlayer2CardAvailable))
			nextPlayerTurn = ePlayer.Player1;
		else if (!isPlayer1CardAvailable && !isPlayer2CardAvailable)
		{
			if (this.playerTurn == ePlayer.Player1)
			{
				this.setState({ player1TotalScore: this.state.player1TotalScore + 1 });									
				this.refs.player1Scoreboard.addPegScore(1);
			}
			else
			{
				this.setState({ player2TotalScore: this.state.player2TotalScore + 1 });									
				this.refs.player2Scoreboard.addPegScore(1);
			}
			
			setTimeout(this.clearPeg, 1000, this, player1Cards.length == 0 && player2Cards.length == 0);			

			//this.updateTestDisplay(isPlayer1CardAvailable + " : " + isPlayer2CardAvailable + " : " + nextPlayerTurn);
			
			return;
		}
	
		this.playerTurn = nextPlayerTurn;
		
		if (nextPlayerTurn != ePlayer.Player1 && this.isOpponentComputer)
			setTimeout(this.computerPeg, 1000);

		this.updateTestDisplay(isPlayer1CardAvailable + " : " + isPlayer2CardAvailable + " : " + nextPlayerTurn);			
	}

	computerPeg()
	{
		var cards = this.refs.player2.cards.filter(function (card) { return card.displayInHand; });
		let selectedCard = crib.pegCardSelect(this.refs.peg.cards, cards);

		if (selectedCard)
		{			
			let pegScore = crib.getPegCardScore(this.refs.peg.cards, selectedCard);
			if (pegScore > 0)
			{
				this.setState({ player2TotalScore: this.state.player2TotalScore + pegScore });						
				this.refs.player2Scoreboard.addPegScore(pegScore);
			}

			this.refs.peg.addCard(selectedCard);
			this.refs.player2.removeCard(selectedCard);
		}

		this.determineNext();		
	}

	clearPeg(that, done)
	{
		that.refs.peg.clear();

		if (!done)
			that.determineNext();
		else
			that.endRound();
	}
	
	endRound()
	{
		this.setState({ gameState: eGameState.Done });							
		this.refs.player1.showCards();
		this.refs.player2.showCards();
		
		let cribScore = crib.calcHandScore(this.cribCards, this.drawCard);

		this.refs.player1Scoreboard.update(crib.calcHandScore(this.refs.player1.cards, this.drawCard), this.cribTurn == ePlayer.Player1 ? cribScore : -1);
		this.refs.player2Scoreboard.update(crib.calcHandScore(this.refs.player2.cards, this.drawCard), this.cribTurn == ePlayer.Player2 ? cribScore : -1);
		
		this.cribTurn = this.cribTurn == ePlayer.Player1 ? ePlayer.Player2 : ePlayer.Player1;
	}

	showDrawCard()
	{
		const ctx = this.refs.drawCardCanvas.getContext("2d");	
		displayCard(ctx, this.drawCard, 0);	
	}

	render
	() {
		return (
				<Container>
					<Row>
						<Col>
							<Scoreboard ref="player1Scoreboard" />
						</Col>
						<Col>
							<Hand ref="player1" cribSelectHandler={this.updateCrib} cardSelectHandler={this.cardSelect} owner={ePlayer.Player1} hasCrib={true} />
						</Col>
						<Col>
							<Button variant="success" hidden={this.state.gameState != eGameState.Done} onClick={e => {this.newRound();}}>Start New Round</Button>									
						</Col>
					</Row>
					<Row>
						<Col></Col>				
						<Col>
							<canvas ref="drawCardCanvas" />
						</Col>
						<Col>
							<Peg ref="peg" />
						</Col>
					</Row>
					<Row>
						<Col>
							<Scoreboard ref="player2Scoreboard" />
						</Col>
						<Col>
							<Hand ref="player2" cribSelectHandler={this.updateCrib} cardSelectHandler={this.cardSelect} owner={this.opponentType} isComputer={true} />						
						</Col>
						<Col>
							<Button variant="success" hidden={this.state.gameState != eGameState.Done || this.isOpponentComputer} onClick={e => {this.newRound();}}>Start New Round</Button>														
						</Col>
					</Row>
					<Row>
						<Col>
							<span>{this.state.testDisplay}</span>						
						</Col>
					</Row>
				</Container>
		);
	}  
}

class Peg extends React.Component 
{
	constructor(props)
	{
		super(props);

		this.cards = [];
		this.pegScore = 0;

		this.state =
		{
			pegScore: 0
		};		
	}

  	addCard(card)
  	{
		this.cards.push(new crib.Card(card.suit, card.value));

		this.pegScore += card.cardValue();
		this.setState({ pegScore: this.pegScore });	

		displayCards(this.refs.canvas, this.cards, false, true);		
  	}

  	componentDidMount() 
  	{
		this.refs.canvas.width = g_cardWidth + 20 + g_cardWidth + ((this.cards.length - 1) * 20);
    	this.refs.canvas.height = g_cardHeight;  
  	}

	clear()
	{
		this.cards = [];
		this.pegScore = 0;
		this.setState({ pegScore: 0 });	

		displayCards(this.refs.canvas, [], false, true);				
	}

	render() 
	{
		return (
			<Container>
				<Row>
					<Col>
						<canvas ref="canvas" />
					</Col>
					<Col>
						<div hidden={this.cards.length <= 0}><label>Pegging score: </label><span ref="pegScore">{this.state.pegScore}</span></div>					
					</Col>
				</Row>
			</Container>      
		);
	}    
}

class Hand extends React.Component 
{
	constructor(props)
	{
		super(props);

		this.owner = props.owner;
		this.isComputer = props.isComputer ? props.isComputer : false;		
		
		this.cards = [];
		this.hasCrib = false;
		
		this.state =
		{
			cribSelectState: eCribSelectState.NotSelected
		};
		//this.doMouseOver = this.doMouseOver.bind(this);
		//this.onChange = this.onChange.bind(this);
	}
 
	newHand(cards, hasCrib)
	{
		this.cards = cards;
		this.cards.sort(function (item1, item2) { return item1.value - item2.value});
		
		this.hasCrib = hasCrib;

		this.setState({ cribSelectState: eCribSelectState.NotSelected });	
		
		this.refreshCardDisplay();

		if (this.isComputer)
			this.selectCrib(crib.cribSelect(this.cards, this.hasCrib ? crib.eCribOwner.Own : crib.eCribOwner.Opponent));    // TODO: crib owner		
	}
  
	doMouseOver(event)
	{
	}

	doMousePress(event)
	{
		//this.refs.testDisplay.innerText = 'test';

		var selectedCard = this.getSelectedCard(event);
		if (selectedCard && !this.isComputer)
		{
		if (this.state.cribSelectState != eCribSelectState.Done)
		{
			var selectedCards = this.cards.filter(function (card) { return card.isSelcted; });
		
			const canvas = this.refs.canvas;
			const ctx = canvas.getContext("2d");
		
			if (selectedCard.isSelcted)
			{
				displayCard(ctx, selectedCard, this.cards.indexOf(selectedCard));

				selectedCard.isSelcted = false;        
			}
			else if (selectedCards.length < 2)
			{
				ctx.save();     
				ctx.globalAlpha = .50;
				ctx.fillStyle = "black";
				ctx.fillRect(selectedCard.x, selectedCard.y, g_cardWidth, g_cardHeight);
				ctx.restore();      

				selectedCard.isSelcted = true;
			}

			selectedCards = this.cards.filter(function (card) { return card.isSelcted; });
	        this.setState({ cribSelectState: selectedCards.length == 2 ? eCribSelectState.Selected : eCribSelectState.NotSelected });
		}
		else
		{
			if (this.props.cardSelectHandler(this.owner, selectedCard))
			{
				selectedCard.displayInHand = false;
				this.refreshCardDisplay();		
			}
		}
		}

		//if (selectedCard)
		//  this.refs.testDisplay.innerText = selectedCard.valueName() + ' of ' + selectedCard.suitName() + 's';

	}

	refreshCardDisplay(overrideFront)
	{
		displayCards(this.refs.canvas, this.cards, overrideFront ? false : this.owner > ePlayer.Player1);
	}

	getSelectedCard(event)
	{
		const canvasRect = ReactDOM.findDOMNode(this.refs.canvas).getBoundingClientRect();

		const x = event.pageX - canvasRect.left;
		const y = event.pageY - canvasRect.top;

		var selectedCard = null;

		this.cards.forEach((card, index) => {
		if (card.x <= x && (card.x + g_cardWidth) > x && card.y <= y && (card.y + g_cardHeight) > y)
			selectedCard = card;
		});

		return selectedCard;
	}

	selectCrib(selectedCards)
	{
		if (!selectedCards)
			selectedCards = this.cards.filter(function (card) { return card.isSelcted; });

		this.props.cribSelectHandler(selectedCards);

		this.cards.splice(this.cards.indexOf(selectedCards[0]), 1);
		this.cards.splice(this.cards.indexOf(selectedCards[1]), 1);
		
		this.refreshCardDisplay();		
		
		this.setState({ cribSelectState: eCribSelectState.Done });
	}

	removeCard(card)
	{		
		var matchedCard = this.cards.filter(function (item) { return item.suit == card.suit && item.value == card.value; });
		if (matchedCard.length == 1)
		{			
			matchedCard[0].displayInHand = false;
			this.refreshCardDisplay();
		}
	}

	getAvailableCards()
	{
		return this.cards.filter(function (card) { return card.displayInHand; });
	}

	showCards()
	{
		this.cards.forEach(function (item) { item.displayInHand = true; });
		this.refreshCardDisplay(true);
	}

  /*DisplayCards()
  {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    
    canvas.width = g_cardWidth * this.cards.length + (this.cards.length * 7);
    canvas.height = g_cardHeight;

    this.cards.forEach((card, index) => {
      this.drawCard(ctx, card, index);
    });      
  }

  drawCard(ctx, card, index)
  {
    ctx.save();

    let x = this.owner > ePlayer.Player1 ? gCardFrontXPos : g_cardImageXPos[card.value - 1];
    let width = card.value == 13 ? 99 : g_cardImageXPos[card.value] - g_cardImageXPos[card.value - 1];
    let y = this.owner > ePlayer.Player1 ? gCardFrontYPos : ((card.suit == 2 ? 0 : card.suit == 4 ? 1 : card.suit == 3 ? 2 : 3) * g_cardHeight);

    card.x = (index * g_cardWidth) + (index * 7);
    card.y = 0;

    ctx.drawImage(this.refs.image, x, y, width, g_cardHeight, card.x, card.y, width, g_cardHeight);

    //ctx.fillText(this.props.text, 210, 75);

    ctx.restore();
  }*/

	render() 
	{
		return (
			<div >
				<canvas ref="canvas" onMouseMove={e => {this.doMouseOver(e);}} onMouseUp={e => {this.doMousePress(e);}} />
				<div>					
					<Button variant="success" hidden={this.isComputer || this.state.cribSelectState == eCribSelectState.Done} disabled={this.state.cribSelectState != eCribSelectState.Selected} onClick={e => {this.selectCrib();}}>Select Crib</Button>
				</div>
				<label ref="testDisplay"></label>        
				{/*<div>
				{this.cards.map((item, i) => 
					<label style={{marginRight: 10}}>{item.valueName() + ' of ' + item.suitName() + 's'}</label>
				)}
				</div>*/}
			</div>      
		);
	}
}

class Scoreboard extends React.Component
{
	constructor(props)
	{
		super(props);

		this.peg = 0;
		this.state =
		{
			peg: "--",
			hand: "--",
			crib: "--",
			total: 0		
		};		
	}

	addPegScore(peg)
	{
		this.peg += peg;

		this.setState(
		{ 
			peg: this.peg == 0 ? "--" : this.peg,
			total: this.state.total + peg
		});	

	}
	
	update(hand, crib)
	{
		this.setState(
		{ 
			hand: hand,
			crib: crib == -1 ? "--" : crib,
			total: this.state.total + hand + crib
		});	
	}

	refresh()
	{
		this.peg = 0;
		this.setState(
		{
			peg: "--",
			hand: "--",
			crib: "--",
			total: 0		
		});		
	}

	render() 
	{
		return (
			<table>
				<thead>
					<tr>
						<th>Peg</th>
						<th>Hand</th>
						<th>Crib</th>
						<th>Total</th>
					</tr>								
				</thead>
				<tbody>
					<tr>
						<td>{this.state.peg}</td>						
						<td>{this.state.hand}</td>
						<td>{this.state.crib}</td>						
						<td>{this.state.total}</td>																		
					</tr>
				</tbody>
			</table>      
		);
	}    
	
}

function displayCards(canvas, cards, front, piled)
{
	var cardsToDisplay = cards.filter(function (card) { return card.displayInHand; });
	
	if (piled)	
		canvas.width = ((g_cardWidth * gCardPileShowFactor) * (cardsToDisplay.length - 1)) + g_cardWidth;
	else
		canvas.width = g_cardWidth * cardsToDisplay.length + (cardsToDisplay.length * 7);
	
	canvas.height = g_cardHeight;

	const ctx = canvas.getContext("2d");
	
	cardsToDisplay.forEach((card, index) => 
	{
		displayCard(ctx, card, index, front, piled);
	});      
}

function displayCard(ctx, card, index, front, piled)
{
	ctx.save();

	front = false;	// TESTING

	let x = front ? gCardFrontXPos : g_cardImageXPos[card.value - 1];
	let width = card.value == 13 ? 99 : g_cardImageXPos[card.value] - g_cardImageXPos[card.value - 1];
	let y = front ? gCardFrontYPos : ((card.suit == 2 ? 0 : card.suit == 4 ? 1 : card.suit == 3 ? 2 : 3) * g_cardHeight);

	if (piled)
		card.x = index * (g_cardWidth * gCardPileShowFactor);
	else
		card.x = (index * g_cardWidth) + (index * 7);
	
	card.y = 0;

	ctx.drawImage(impIndex.gCardImage, x, y, width, g_cardHeight, card.x, card.y, width, g_cardHeight);

	//ctx.fillText(this.props.text, 210, 75);

	ctx.restore();
}

export default App;
