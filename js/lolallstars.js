function Server() {
  this.shop = new Shop();
  this.availableChampionIds = [1,2,3,4];
}

Server.prototype.isChampionAvailable = function(championId) {
  for ( var i = 0 ; i < this.availableChampionIds.length ; i++ )
    if ( this.availableChampionIds[i] == championId ) return true;
  return false;
}

function Shop() {
}

Shop.prototype.buyChampion = function(account, championId) {
  if ( account.hasChampion(championId) ) return false;
  var price = this.championPrice(account);
  if ( account.ip < price) return false;
  account.ip -= price;
  account.ownedChampions[championId] = true;
  return true;
}

Shop.prototype.championPrice = function(championId) {
  return 500.0;
}

function Account(server) {
  this.summonersName = "Lol";
  this.experience = 0;
  this.wins = 0;
  this.losses = 0;
  this.level = 1;
  this.ip = 0;
  this.ownedChampions = [];
  this.server = server;
  this.init();
}

Account.prototype.levelCaps = [90, 188, 293, 406, 854, 1330, 1834, 2366, 2926, 3976, 5076, 6226, 7426, 8676, 9976, 11326, 12726, 14176, 15676, 17807, 20007, 22276, 24614, 27020, 29495, 32039, 34652, 37333, 40084];

Account.prototype.init = function() {
  for ( var i = 0 ; i < 118 ; i++ )
    this.ownedChampions[i] = false;
}

Account.prototype.print = function() {
  return "Summoner's Name: " + this.summonersName + "<br>" +
         "Experience: " + this.experience + "<br>" +
         "Wins: " + this.wins + "<br>" +
         "Losses: " + this.losses + "<br>" +
         "Level: " + this.level + "<br>" +
         "Influence Points: " + this.ip;
}

Account.prototype.isChampionAvailable = function(championId) {
  return this.server.isChampionAvailable(championId) ? true : this.hasChampion(championId) ;
}

Account.prototype.hasChampion = function(championId) {
  return this.ownedChampions[championId];
}

Account.prototype.setGameResult = function(win, duration) {
  var experience = duration;
  if ( win ) this.wins++;
  else this.losses++;
  if ( !win ) experience *= 0.75;
  this.experience += 5 * experience;
  this.ip += 3 * experience;
  this.updateLevel();
}

Account.prototype.updateLevel = function() {
  for ( var i = 0 ; i < this.levelCaps.length ; ++i ) {
    if ( this.levelCaps[i] > this.experience ) {
	  this.level = i + 1;
	  break;
	}
  }
  if ( this.experience >= this.levelCaps[28] ) {
    this.experience = this.levelCaps[28];
	this.level = 30;
  }
}

function Game() {
  this.minutes = 0;
  this.duration = 0;
  this.playing = false;
}

Game.prototype.isFinished = function() {
  if ( this.playing ) {
	  if ( this.duration <= this.minutes ) {
		this.playing = false;
		return true;
	  } else this.minutes++;
  }
  return false;
}

Game.prototype.print = function() {
  return 'Duration: ' + this.minutes + ":00"; 
}

Game.prototype.resetDuration = function() {
  this.duration = 20 + Math.floor((Math.random() * 30));
}

Game.prototype.start = function() {
  if ( this.playing ) return;
  this.playing = true;
  this.minutes = 0;
  this.resetDuration();
}

function Gamer() {
  this.name = "Jun Jung Park";
  this.usedChampionId = 0;
  this.playstyleUsed = 0;
  this.account = new Account();
  this.championExperiences = [];
  this.playstyleExperiences = [];
  for ( var i = 0 ; i < 118 ; i++ )
    this.championExperiences[i] = 0;
  for ( var i = 0 ; i < 18 ; i++ )
    this.playstyleExperiences[i] = 0;  
}

Gamer.prototype.earnExperience = function(duration, win) {
  this.account.setGameResult(win, duration);
  var experience = duration;
  if ( !win ) duration*= 0.5;
  this.championExperiences[this.usedChampionId] += duration;
  this.playstyleExperiences[this.playstyleUsed] += duration;
}

Gamer.prototype.print = function() {
  return 'Name: ' + this.name + '<br>' + this.account.print();
}

var server = new Server();
var gamer = new Gamer();
gamer.account.server = server;
var game = new Game();

var playerMessage = document.getElementById("player-message");
var resultMessage = document.getElementById("result-message");
var gameMessage = document.getElementById("game-message");
var playButton = document.getElementById('play-button');

function winProbability() {
  return Math.random() >= 0.5;
}

playButton.addEventListener("mousedown", function(event) {
  game.start();
  resultMessage.innerHTML = "";
; }, false);

setInterval( function() {
  if ( game.isFinished() ) {
	if ( winProbability() ) {
	  gamer.earnExperience(game.duration, true);
	  resultMessage.innerHTML = "WIN Duration:" + game.duration;
	} else {
	  gamer.earnExperience(game.duration, false);
	  resultMessage.innerHTML = "LOSS Duration:" + game.duration;
	}
  }	
  playerMessage.innerHTML = gamer.print();
  gameMessage.innerHTML = game.print();
}, 100);