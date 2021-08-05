// Those are global variables, they stay alive and reflect the state of the game // 
var elPreviousCard = null; // previous card id variable 
var flippedCouplesCount = 0; // this is used to determine how many couples were flipped so you can declare end of game. 
var isProcessing = false; // are the cards being flipped? if true return if flase you are allowed to flip another card. 
var name = 0; // name of the player that will be stored in localstorage. 
var moves = 0; // moves variable to keep track of every move the player made
var points = 0; // points variable to keep track of Right moves (correct pairs).
var flag = 0; // flag so player can click the first card and set startingtime will be set only once every game.
var timeflag = 0; // flag used for deciding if BEST TIME should be updated or not. (when this flag is 0 you enter if atleast once)
var startingtime = 0; // Starting time variable 
var stopingtime = 0; // Stoping time variable 
var BTIME = stopingtime - startingtime; // Best TIME SCORE variable        
var s = 0; // seconds
var m = 0; // minutes 
var h = 0; // hours
var myVar = 0; // set this to activate time functions
var e = 0; // flag to see when to show button if it's 0 that means the Play button should be disabled  and vice versa
var TOTAL_COUPLES_COUNT = 15; // This is a constant that we dont change during the game (we mark those with CAPITAL letters)
var temptime = null; // this var will hold time in aa:bb:cc format. 
//***************************************************************************************************************************************************************************//

// Load an audio file
var audioChange = new Audio('sound/change.mp3');
var audioWin = new Audio('sound/win.mp3');
var audioWrong = new Audio('sound/wrong.mp3');
var audioRight = new Audio('sound/right.mp3');
//****************************************************************************************************************************************************************************//

// preset game
button_preset(0); // when user enters the html page this hides the play button //
shuffle(); // When game starts shuffle cards =).    
initialize(); // initialize game 
//****************************************************************************************************************************************************************************//

// This function is called whenever the user click a card
function cardClicked(elCard) {
    if (isProcessing == true) // If true exit function because the system is still flipping the cards
        return;
    if (elCard.classList.contains('flipped')) // If the user clicked an already flipped card - do nothing and return from the function
        return;
    elCard.classList.add('flipped'); // Flip it
    if (flag == 0) { // when user clicks first card starting time is saved in startingtime variable.
        flag = 1; // flag=1 means that starting time was already saved and second card shouldn't resave it.                             
        ts(); // Activate the stopwatch (also starts when first card is flipped).
        startingtime = Date.now(); // starting time gets the First card click starting time ( in mili seconds ).
    }
    if (elPreviousCard === null) { // This is a first card, only keep it in the global variable
        flag = 1;
        elPreviousCard = elCard;
    } else { // get the data-card attribute's value from both cards
        var card1 = elPreviousCard.getAttribute('data-card'); // from previous card
        var card2 = elCard.getAttribute('data-card'); // from current card
        moves++; // for every move count the moves
        update_moves(moves); // update the moves                          
        if (card1 !== card2) { // No match, schedule to flip them back in 1 second
            isProcessing = true; // if the user got here that means he flipped two cards he needs to wait for them to be flipped back
            audioWrong.play(); // he flipped two unmatching cards so play wrong audio
            setTimeout(function() {
                elCard.classList.remove('flipped');
                elPreviousCard.classList.remove('flipped');
                elPreviousCard = null;
                isProcessing = false; // its ok to flip cards again
            }, 500)
        } else { // Yes! a match!
            points++; // for every match player gains a point.
            update_points(points); // update the points
            audioRight.play(); // he flipped two matching cards so play right audio 
            flippedCouplesCount++; // this variable helps us decide when the game is over and how many couples were flipped
            elPreviousCard = null; // since he flipped both cards we now need to start the process again                                                                                  
            if (TOTAL_COUPLES_COUNT === flippedCouplesCount) { // All cards flipped!
                stopingtime = Date.now(); // hold time of victory (in mili seconds).
                BTIME = (stopingtime - startingtime) / 1000; // calculate game time and convert to seconds 
                if (timeflag == 0) { // for the first game store the game time no matter what (this is the best score so far).
                    localStorage.setItem('TTIME', BTIME); // store current game time as best game time in local storage.
                    temptime = secondsToHms(BTIME);
                    document.getElementById("playertime").innerHTML = "BEST TIME: " + temptime; // Display best time in localstorage in aa:bb:cc format.
                    timeflag = 1; // never enter this if again unless player refreshed the game (F5).
                } else if (BTIME < localStorage.getItem('TTIME')) { // if this is the second game (not refreshed page) decide if we have a new BEST SCORE. 
                    localStorage.setItem('TTIME', BTIME); // store new best time in local storage
                    temptime = secondsToHms(BTIME); // store new best time in aa:bb:cc format.
                    document.getElementById("playertime").innerHTML = "BEST TIME: " + temptime; // Display best time in localstorage (in aa:bb:cc format). 
                }
                clearInterval(myVar); // STOP the stopWatch the player flipped all the right cards
                audioWin.play(); // play victory audio player flipped them all 
                toggle_visibility('foo'); // Game over show the Play again button 
            }
        }
    }
}
//****************************************************************************************************************************************************************************//

// Toggle Play again button // 
function toggle_visibility(id) {
    var e = document.getElementById(id);
    if (e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}
//****************************************************************************************************************************************************************************//

// Reset game whenver the browser is refreshed (Play again button) //
function button_preset(e) {
    if (!e) {
        toggle_visibility('foo'); // for some reason the button needs to be initalized with 2 toggles at start to hide it
        toggle_visibility('foo'); // after you hide it the first time it only takes 1 toggle to hide it IDK WHY (line 119)
        return;
    } else
        return;
}
//****************************************************************************************************************************************************************************//

// PLAY AGAIN function //
function play_again(id) {
    flag = 0; // flag = 0 means the game started over so we need a new starting time
    shuffle(); // shuffle all the cards again 
    reset_stop(); // reset the stopwatch back to 0 (it's a new game!)
    flip_cards(); // hide all the cards again 
    toggle_visibility('foo'); // this is why here I only toggled it once and not twice in order to hide it.
    reset_moves(); // reset moves back to 0
    reset_points(); // reset points back to 0
}
//****************************************************************************************************************************************************************************//

// Change Player's Name //
function change_player() {
    audioChange.play();
    name = prompt(); // ask user for Player name
    localStorage.setItem('PLAYER', name); // store that name in local storage
    document.getElementById("playername").innerHTML = "PLAYER: " + localStorage.getItem('PLAYER'); // display Player name in game page  
}
//****************************************************************************************************************************************************************************//  

// CLOCK // 
function startTime() { // this function is being called from  game.html when the body starts.
    var today = new Date(); // allocate dynamic memory for Time variable 
    var h = today.getHours(); // get hours 
    var m = today.getMinutes(); // get minutes 
    var s = today.getSeconds(); // get seconds 
    m = checkTime(m); // for minutes if the number is < 10 then add a zero in front of it
    s = checkTime(s); // for seconds if the number is < 10 then add a zero in front of it 
    document.getElementById('txt').innerHTML = // change in HTML the element to the following: 
        h + ":" + m + ":" + s; // h + : + m + : + s -------> h:m:s 
    var t = setTimeout(startTime, 500); // This built in function activates the clock with 500 miliseconds.
}

// add zero in front of numbers < 10 //
function checkTime(i) { // this function is a helper for StartTime function to wrap 0's on minutes and seconds. 
    if (i < 10) { i = "0" + i };
    return i;
}
//****************************************************************************************************************************************************************************//  

// STOPWATCH FUNCTION // 
function myTimer() {
    if (s < 10)
        s = "0" + s;
    document.getElementById('watch').innerHTML = h + ":" + m + ":" + s;
    s++;
    if (s == 60) {
        m++;
        if (m == 60) {
            h++;
            if (h == 24) {
                h = 0;
            }
            m = 0;
        }
        s = 0;
    }
}
// START THE STOPWATCH // 
function ts() {
    myVar = setInterval(function() { myTimer() }, 1000); // i chose 800 to try to make the stopwatch and the game time equal.
}
// Reset the STOPWATCH// 
function reset_stop() { // setting the stopwatch back to 0 when needed
    s = 0;
    m = 0;
    h = 0;
}
//****************************************************************************************************************************************************************************//  

// Shuffle cards function // 
function shuffle() {
    var CARDS = document.querySelector('.CARDS');
    for (var i = CARDS.children.length; i >= 0; i--) {
        CARDS.appendChild(CARDS.children[Math.random() * i | 0]);
    }
}
//****************************************************************************************************************************************************************************//

// Initialize Game function //
function initialize() {
    startingtime = 0; // initialize starting time to 0 
    stopingtime = 0; // initialize stoping time to 0
    BITIME = 0; // intizialize temp best  time to 0
    reset_moves();
    reset_points();
    initialize_playername();
    localStorage.setItem('TTIME', 0); // initizalize best time to 0 in local storage
    document.getElementById("playertime").innerHTML = "BEST TIME: " + localStorage.getItem('TTIME') + " sec"; // display Best time (zero for start)
}
//****************************************************************************************************************************************************************************//

// Reset Moves / Initialize Moves //
function reset_moves() {
    moves = 0; // initialize moves to 0
    localStorage.setItem('MOVES', moves); // initizalize Moves to 0 in local storage
    document.getElementById("playermoves").innerHTML = "MOVES: " + localStorage.getItem('MOVES'); // display moves when game starts again
}
//****************************************************************************************************************************************************************************//

// Reset Points/ Initialize Points//
function reset_points() {
    points = 0; // initialize points to 0
    localStorage.setItem('POINTS', points); // initialize points to 0 in local storage
    document.getElementById("playerpoints").innerHTML = "POINTS: " + localStorage.getItem('POINTS'); // display player points (zero for start) 
}
//****************************************************************************************************************************************************************************//

//Initialize player name or Show existing player name// 
function initialize_playername() {
    document.getElementById("playername").innerHTML = "PLAYER: " + localStorage.getItem('PLAYER'); // display player's name from local storage when game is refreshed.
    if (localStorage.getItem("PLAYER") === null) // if the local storage is empty you take a name from the user. 
        change_player();
}
//****************************************************************************************************************************************************************************//

// Flip all cards//
function flip_cards() {
    flippedCouplesCount = 0; // reset flipped counter because the game starts over
    var divs = document.querySelectorAll('div');
    // get the first element of divs
    for (var i = 0; i < divs.length; ++i) { // run through them 
        divs[i].classList.remove('flipped');
    }
    // remove the flipped addition we added so they can be back hidden again
}
//****************************************************************************************************************************************************************************//

// update the  MOVES in real time // 
function update_moves(moves) {
    localStorage.setItem('MOVES', moves); // set local storage to current moves. 
    document.getElementById("playermoves").innerHTML = "MOVES: " + localStorage.getItem('MOVES'); //display the user the current moves on page.
}
//****************************************************************************************************************************************************************************//

// update the POINTS in real time // 
function update_points(points) {
    localStorage.setItem('POINTS', points); // update points
    document.getElementById("playerpoints").innerHTML = "POINTS: " + localStorage.getItem('POINTS'); //display updated points
}
//****************************************************************************************************************************************************************************//

// Convert Seconds to TIME // 
function secondsToHms(d) {
    d = Number(d); // Number() converts variables to numbers for example true -> 1 / false -> 0.
    var h = Math.floor(d / 3600); // Math.floor() rounds result down for example 5.95 --> 5.
    var m = Math.floor(d % 3600 / 60); // simple logic to get minutes.
    var s = Math.floor(d % 3600 % 60); // simple logic to get seconds.
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""; // hDisplay displays the amount of hours or hour. 
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""; // mDisplay displays the amount of minutes or minute.
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""; // sDisplay displays the amount of seconds or second.
    return hDisplay + mDisplay + sDisplay; // return the aa:bb:cc format of time back to wherever. 
}
//****************************************************************************************************************************************************************************//