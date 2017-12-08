var DumbAI = function (name, ui_div) {

    var match = null;
    var position = null;
    var current_game = null;
    var player_key = null;
    
    var ai_hand = $("<div class='ai_hand'></div>");
    
    $(ui_div).append(ai_hand);
    $(ui_div).append($("<h2>" + name + "</h2>"));

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

        current_game.registerEventHandler(Hearts.GAME_STARTED_EVENT, function (e) {
            if (e.getPassType() != Hearts.PASS_NONE) {
                var cards = current_game.getHand(player_key).getDealtCards(player_key);
                current_game.passCards(cards.splice(0,3), player_key);
            }
        });

        current_game.registerEventHandler(Hearts.TRICK_START_EVENT, function (e) {
            setTimeout( function() {
                $(ui_div).find(".playedCard").empty();}, 1500);

            if (e.getStartPos() == position) {
                setTimeout( function() {
                    $(ui_div).find("h2").css("border", "thick solid yellow");}, 1500);
                var playable_cards = current_game.getHand(player_key).getPlayableCards(player_key);
                setTimeout( function() {
                    current_game.playCard(playable_cards[0], player_key) }, 2500);
            }
        });

        current_game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, function (e) {
            if (e.getNextPos() == position) {
                $(ui_div).find("h2").css("border", "thick solid yellow");
                var playable_cards = current_game.getHand(player_key).getPlayableCards(player_key);
                setTimeout( function() {
                    current_game.playCard(playable_cards[0], player_key) }, 1500);
            }
        });
        
        current_game.registerEventHandler(Hearts.CARD_PLAYED_EVENT, function (e) {
            $(ui_div).find("h2").css("border", "none");
            if (e.getPosition() == position) {
                var card = "<ul><li><a class='card " + suitName(e.getCard()) + 
                    "'><span class='rank'>" + rankSymbol(e.getCard()) + 
                    "</span><span class='suit'>&" + suitName(e.getCard()) + 
                    ";</span></a></li></ul>";
                $(ui_div).find(".playedCard").append($(card));
                
                var cards_left = current_game.getHand(player_key).getPlayableCards(player_key);
                if (cards_left.length == 0) {
                    $(ui_div).find(".ai_hand").empty();
                }
            }
        });
    
        current_game.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, function (e) {
            $("h2").css("border", "none");
        }); 
        
        current_game.registerEventHandler(Hearts.GAME_OVER_EVENT, function (e) {
            setTimeout( function() {
                $(ui_div).find(".playedCard").empty();}, 1500);
        });
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
    
    //get rank for J,Q,K,A
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
