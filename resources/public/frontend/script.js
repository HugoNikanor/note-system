var getNote = function() {
	var id = $("#node-id-input").val();
	var url = "http://localhost:3000/note?id=" + id;
	$.get(url, function(rawData) {
		var data = JSON.parse(rawData);
		// TODO better html templating
		data.map(function(d) {
			$("#note-container").prepend(
					"<article class="+d.type+">"+
					"<h1>"+d.header+"</h1>"+
					"<p>"+d.body+"</p>"+
					"</article>");
		});
	});
}

$(document).ready(function() {
	// Sets up note request fields
	$("#get-note-button").click(getNote);
	$("#node-id-input").keypress(function (e) {
		if(e.which == 13) { getNote(); }
	});

	// Sets up "Clear" button
	$("#clear-notes-button").click(function() {
		$("#note-container").empty();
	});
});

