var formatHTMLNote = function(jsonObject) {
	return "<article class="+jsonObject.type+">"+
		   "<h1>"+jsonObject.header+"</h1>"+
		   "<p>"+jsonObject.body+"</p>"+
		   "<span class='note-no'>id: "+jsonObject.id+"</span>"+
		   "</article>";
}

var getNotes = function(url) {
	$.get(url, function(rawData) {
		var data = JSON.parse(rawData);
		$("#note-container").prepend(data.map(formatHTMLNote));
	});
}

var getNotesById = function(id) {
	var url = "http://localhost:3000/note?id=" + id;
	getNotes(url);
}

$(document).ready(function() {
	// Sets up note request fields
	$("#get-note-button").click(function () {
		getNoteById($("#node-id-input").val());
	});
	$("#node-id-input").keypress(function (e) {
		if(e.which == 13) { getNoteById($("#node-id-input").val()); }
	});

	// Sets up "Clear" button
	$("#clear-notes-button").click(function() {
		$("#note-container").empty();
	});

	// adds authorization key to POST form
	// TODO this should probably be run upon submit
	// TODO since it currently requires you to submit the note
	// TODO quite soon after opening the page
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

	// add all notes from the server to start with
	getNotes("http://localhost:3000/note/all");
});

