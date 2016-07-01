var getNote = function(id) {
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
	$("#get-note-button").click(function () {
		getNote($("#node-id-input").val());
	});
	$("#node-id-input").keypress(function (e) {
		if(e.which == 13) { getNote($("#node-id-input").val()); }
	});

	// Sets up "Clear" button
	$("#clear-notes-button").click(function() {
		$("#note-container").empty();
	});

	$.get("/note/token/html", function (data) {
		$("#comment-form").append(data);
	});

	// this still publishes the data to the "value" url
	// but runs this function instead of redirecting
	$("#comment-form").ajaxForm(function(data) {
		// Data is the server response
		JSON.parse(data).map(function(key) {
			getNote(key.generated_key);
		});
	});
});

