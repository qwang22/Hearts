var Player = function (name, ui_div) {

    var match = null;
    var position = null;
    var current_game = null;
    var player_key = null;

    var noPass;
    var firstTrick;

    var ui_player_hand = $("<div class='player_hand'></div>");
    
    $(ui_div).append(ui_player_hand);
    $(ui_div).append($("<h1>" + name + "</h1><br >"));
    $(ui_div).append($("<div id='message'></div>"));

    this.setupMatch = function (hearts_match, pos) {
        match = hearts_match;
        position = pos;
    }
    
    this.getName = function () {
        return name;
    }

    this.setupNextGame = function (game_of_hearts, pkey) {
        current_game = game_of_hearts;
        player_key = pkey;

        game_of_hearts.registerEventHandler(Hearts.ALL_EVENTS, function (e) {
            console.log(e.toString());
        });
        
        game_of_hearts.registerEventHandler(Hearts.GAME_STARTED_EVENT, function (e) {
        	noPass = false;
            firstTrick = true;
        	if (e.getPassType() == Hearts.PASS_NONE) {
        		noPass = true;
        	}
        	$("#message")[0].innerHTML = e.toString().substring(17, e.toString().length);
            if (!noPass) {
                $("#message").css("display", "none");
            }
            document.getElementById('start').addEventListener('click', dealCards);
            document.getElementById('scoreboard').addEventListener('click', scoreboard);
            document.getElementById('restart').addEventListener('click', function () {
                location.reload();
            });
        });
        
        game_of_hearts.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT, function (e) {
        	if (!noPass) {
        		updateHand();
        		$("#message")[0].innerHTML = "";
        	}
            if ($("#autoplay").length < 1) {
            	$('#options').append($("<button id='autoplay'>Autoplay</button>"));
                document.getElementById('autoplay').addEventListener('click', autoplay);
            }
        });
        
        game_of_hearts.registerEventHandler(Hearts.TRICK_START_EVENT, function (e) {
            setTimeout( function() {
                $(ui_div).find(".playedCard").empty() }, 1500);

            if (e.getStartPos() == position) {
                if (firstTrick) {
                    $("h1").css("border", "thick solid yellow");
                    blurUnplayable();
                    if (noPass) {
                        $("#message")[0].innerHTML = "No pass. Play a card";
                    } else {
                        $("#message")[0].innerHTML = "Play a card";
                    }
                } else {
                    setTimeout( function() {
                        $("h1").css("border", "thick solid yellow"), 
                        $("#message")[0].innerHTML = "Play a card",
                        blurUnplayable();}, 1500);
                }
            } 
        });
        
        game_of_hearts.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, function (e) {
        	if (e.getNextPos() == position) {
        		$("h1").css("border", "thick solid yellow");
        		$("#message")[0].innerHTML = "Play a card";
        		blurUnplayable();
        	}        
        });
        
        game_of_hearts.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, function (e) {
            $("#message")[0].innerHTML = e.toString().substring(20, e.toString().length-1);
            firstTrick = false;
        });
        
        game_of_hearts.registerEventHandler(Hearts.CARD_PLAYED_EVENT, function (e) {
        	$("h1").css("border", "none");
        	$("#message")[0].innerHTML = "";
            if (e.getPosition() == position) {
                var card = "<ul><li><a class='card " + suitName(e.getCard()) + 
                    "'><span class='rank'>" + rankSymbol(e.getCard()) + 
                    "</span><span class='suit'>&" + suitName(e.getCard()) + 
                    ";</span></a></li></ul>";
                $(ui_div).find(".playedCard").append($(card));
                updateHand();
            }
        });
        
        //remove card played by player and show the "Deal Cards" deck for new game
        game_of_hearts.registerEventHandler(Hearts.GAME_OVER_EVENT, function (e) {
            var sb = match.getScoreboard();
            if (sb[Hearts.NORTH] >= 100 || sb[Hearts.EAST] >= 100 
            	|| sb[Hearts.SOUTH] >= 100 || sb[Hearts.WEST] >= 100) {
            	setTimeout( function() {
            		$(ui_div).find(".playedCard").empty(), 
            		$("#message")[0].innerHTML = "" }, 1500);
            var min = Math.min(sb[Hearts.NORTH], sb[Hearts.EAST], sb[Hearts.SOUTH], sb[Hearts.WEST]);
            var winner;
            if (min == sb[Hearts.NORTH]) {
            	winner = match.getPlayerName(Hearts.NORTH);
            } else if (min == sb[Hearts.EAST]) {
            	winner = match.getPlayerName(Hearts.EAST);
            } else if (min == sb[Hearts.SOUTH]) {
            	winner = match.getPlayerName(Hearts.SOUTH);
            } else if (min == sb[Hearts.WEST]) {
            	winner = match.getPlayerName(Hearts.WEST);
            }
            alert("Game Over. " + winner + " wins.");
            } else {
            	setTimeout( function() {
                	$(".image").css("display", "inline"), 
                	$(ui_div).find(".playedCard").empty() } , 1500);
            }
        });
        
    }
    
    //deal cards then hide 'start' button
    var dealCards = function() {
        updateHand();
        $(".ai_hand").append($("<img id='back' class='card' src='card_back.png' alt='card_back'>"));
                   
        var hand = document.getElementsByClassName('hand');
        if (noPass) {
            blurUnplayable();
        } else {
        	for (var i=0;i<hand.length;i++) {
        		hand[i].addEventListener('click', pass);
        		$(hand[i]).addClass("playable");
        	}
        }
        $("#message").css("display", "block");
        $(".image").css("display", "none");
    }

	var pass = function() {
    	$("#pass").remove();
    	$("#clear").remove();

        var selected = document.getElementsByClassName('selected');
        if (selected.length < 3) {
            $(this).toggleClass("selected");
        }
        if (selected.length == 3) {
        	$(ui_div).append($("<button id='pass'>Pass</button>"));
        	$(ui_div).append($("<button id='clear'>Clear</button>"));
            $(".hand").removeClass("playable");

            //Create array of selected cards and pass
            //Removes 'pass' and 'clear' buttons from UI
            $("#pass").click( function() {

                var card1 = selected[0];
                var card2 = selected[1];
                var card3 = selected[2];

                var toPass = [new Card(Card.parseRank(card1.childNodes[0].textContent), 
                                       Card.parseSuit(card1.className[10])), 
                              new Card(Card.parseRank(card2.childNodes[0].textContent), 
                                       Card.parseSuit(card2.className[10])), 
                              new Card(Card.parseRank(card3.childNodes[0].textContent), 
                                       Card.parseSuit(card3.className[10]))];

                current_game.passCards(toPass, player_key);

                $(".selected").removeClass("hand");
                $(".card").removeClass("selected");
                $("#pass").remove();
                $("#clear").remove();
            });
            $("#clear").click( function() {
                $(".hand").addClass("playable");
                $(".card").removeClass("selected");
                $("#pass").remove();
                $("#clear").remove();
            });
        }        
    }

    var play = function() {
        $("#play").remove();
        $("#clear").remove();

        var selected = document.getElementsByClassName('selected');
        if (selected.length < 1) {
            $(this).toggleClass("selected");
        } 
        if (selected.length == 1) {
        	$(ui_div).append("<button id='play'>Play</button>");
        	$(ui_div).append("<button id='clear'>Clear</button>");
        	$(".hand").removeClass("playable");

            $("#play").click( function() {
                var card = new Card(Card.parseRank(selected[0].childNodes[0].textContent),
                                    Card.parseSuit(selected[0].className[10]));

                current_game.playCard(card, player_key);
                $(".selected").removeClass("hand");
                $(".card").removeClass("selected");
                $("#play").remove();
                $("#clear").remove();
            });
            $("#clear").click( function() {
                $(".card").removeClass("selected");
                $("#play").remove();
                $("#clear").remove();
                blurUnplayable();
            });
        }
    }
    
    var scoreboard = function() {
        var sb = match.getScoreboard();
        $('#score').append($("<div class='message'>Scoreboard: <ul>" +
                        "<li>"+match.getPlayerName(Hearts.NORTH)+": " +
                        sb[Hearts.NORTH] + "</li> " +
                        "<li>"+match.getPlayerName(Hearts.EAST)+": " +
                        sb[Hearts.EAST] + "</li> " +
                        "<li>"+match.getPlayerName(Hearts.SOUTH)+": " +
                        sb[Hearts.SOUTH] + "</li> " +
                        "<li>"+match.getPlayerName(Hearts.WEST)+": " +
                        sb[Hearts.WEST] + "</li> " +
                        "</ul></div>"));
        
        if ($("#score").hasClass("hide")) {
        	$("#scoreboard").click( function() {
        		$("#score").removeClass("hide");
        		scoreboard();
        	});
        } else {
        	$("#scoreboard").click( function() {
            	$("#score").addClass("hide");
            	$("#score").empty();
        	});
    	}
        
    }
    
    var autoplay = function(e) {
        var autoplay_handler = function (e) {
            if (current_game.getNextToPlay() == position) {
                setTimeout( function() {
                    current_game.playCard(current_game.getHand(player_key).getPlayableCards(player_key)[0], player_key) }, 1500);
            }
        }
        $("#autoplay").detach();
        current_game.registerEventHandler(Hearts.TRICK_START_EVENT, autoplay_handler);
        current_game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, autoplay_handler);
        autoplay_handler();
    }
    
    var updateHand = function () {
        ui_player_hand.empty();
        var cards = current_game.getHand(player_key).getUnplayedCards(player_key);
        var list = $("<ul></ul>");
        cards.forEach(function (c) {
            list.append($("<li><a class='card hand " + suitName(c) + 
                          "'><span class='rank'>" + rankSymbol(c) + 
                          "</span><span class='suit'>&" + suitName(c) + 
                          ";</span></a></li>"));
	    });
        ui_player_hand.append($(list));   
    }

    var blurUnplayable = function () {
    	var playable = current_game.getHand(player_key).getPlayableCards(player_key);     
        var hand = document.getElementsByClassName('hand');

        
        for (var i=0;i<hand.length;i++) {
        	for (var j=0;j<playable.length;j++) {
            	if (hand[i].childNodes[0].textContent == rankSymbol(playable[j]) 
            		&& hand[i].className[10] == suitName(playable[j]).charAt(0)) {
            		hand[i].addEventListener('click', play);
            		hand[i].style.filter = "none";
            		$(hand[i]).addClass("playable");
            		break;
            	} else {
            		hand[i].style.filter = "blur(3px)";
            	}
            }
        }
    }
    
    //get symbol for suit of card
    var suitName = function (c) {
        var symbol = "";
        if (c.getSuit() == 0) {
            symbol = "hearts";
        } else if (c.getSuit() == 1) {
            symbol = "spades";
        } else if (c.getSuit() == 2) {
            symbol = "diams";
        } else if (c.getSuit() == 3) {
            symbol = "clubs";
        }
        return symbol;
    }
    
    //get letters for ranks J,Q,K,A
    var rankSymbol = function (c) {
        var rank = c.getRank();
        if (rank > 10) {
            if (rank == 11) {
                rank = "J";
            } else if (rank == 12) {
                rank = "Q";
            } else if (rank == 13) {
                rank = "K";
            } else if (rank == 14) {
                rank = "A";
            }
        }
        return rank;
    }
}
    
