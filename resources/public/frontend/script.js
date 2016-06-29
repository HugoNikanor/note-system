var getNote = function() {
	var id = $("#node-id-input").val();
	var url = "http://localhost:3000/note?id=" + id;
	$.get(url, function(data) {
		$("#note-container").append(data);
	});
}

$(document).ready(function() {
	// Set up note request fields
	$("#get-note-button").click(getNote);
	$("#node-id-input").keypress(function (e) {
		if(e.which == 13) { getNote(); }
	});
});

