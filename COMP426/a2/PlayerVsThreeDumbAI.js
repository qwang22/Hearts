$(document).ready(function () {

	var name = window.prompt("Enter your name");

    var north = new Player(name, $("#north_player")[0]);
    var east = new DumbAI("Bob", $("#east_player")[0]);
    var south = new DumbAI("Carol", $("#south_player")[0]);
    var west = new DumbAI("David", $("#west_player")[0]);

    var match = new HeartsMatch(north, east, south, west);

    match.run();
});
