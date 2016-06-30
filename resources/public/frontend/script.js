var getNote = function() {
	var id = $("#node-id-input").val();
	var url = "http://localhost:3000/note?id=" + id;
	$.get(url, function(rawData) {
		var data = JSON.parse(rawData);
		// TODO better html templating
		$("#note-container").prepend(
				"<article>"+
				"<h1>"+data.header+"</h1>"+
				"<p>"+data.body+"</p>"+
				"</article>");
	});
}

$(document).ready(function() {
	// Sets up note request fields
	$("#get-note-button").click(getNote);
	$("#node-id-input").keypress(function (e) {
		if(e.which == 13) { getNote(); }
	});
});

