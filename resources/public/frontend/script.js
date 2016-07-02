var enableCheckboxList = function() {
	$(".checkbox-list").find("li").click(function(event) {
		var el = $(event.toElement);

		var newValue;
		if(el.hasClass("checked")) {
			newValue = 0;
			el.removeClass("checked");
		} else {
			newValue = 1;
			el.addClass("checked");
		}

		// TODO can I handle the anti forgery token like this?
		$.get("http://localhost:3000/note/token/raw", function(token) {
			$.post("http://localhost:3000/note/list/set-checkbox",
					{
						"list-id": el.data("listId"),
						"id": el.data("id"),
						"new-value": newValue,
						"__anti-forgery-token": token,
					});
		});
	});

	/*
	$(".checkbox-list").find(".new-item").find("input").keypress(function(e) {
		if(e.which == 13) {
			$.post("http://localhost:3000/note/list/add-item",
					{
						"list-id": 36,
						"text": t
		}
	});
	*/

}

var enableCheckboxForms = function() {
	$(".checkbox-list").children("form").ajaxForm(function(data) {
		console.log(data);
		return false;
	});
}

// TODO possibly rewrite this without mutation
var createHTMLList = function(json) {
	var bullets = "";
	var id;
	json.map(function(item) {
		// item.done to see check-mark status
		console.log(item);
		id = item.list_id;
		var checked = "";
		if(item.done) {
			checked = " checked";
		}
		bullets +=
			"<li class='"+
			checked+
			"' "+
			"data-list-id='"+
			item.list_id+
			"' "+
			"data-id='"+
			item.id+
			"'>"+
			item.text+
			"</li>";
	});
	bullets += "<li class='new-item'>"
	bullets += "<input name='text' type='text' placeholder='new note' />"
	bullets += "</li>";
	return "<ul class='checkbox-list'>"+bullets+"</ul>";
}

var createNote = function(json) {
	var id = json.id;
	var header = json.header;
	var type = json.type;
	var body = json.body;

	var noteId = "note-" + id;

	$("#note-container").prepend(
	       "<article id='"+noteId+"' class='"+type+"'>"+
	       "<h1>"+header+"</h1>"+
	       "<p>"+body+"</p>"+
	       "<div class='note-footer'>"+
		   "<span class='id'>id: "+id+"</span>"+
		   "</div>"+
	       "</article>"
	);

	if(type == "list") {
		$.getJSON("http://localhost:3000/note/list?id="+id, function(list) {
			$("#" + noteId).children(".note-footer").before(createHTMLList(list)); 
		});
	}
}

var getNotes = function(url) {
	$.getJSON(url, function(data) {
		data.map(createNote);
	});
}

var getNotesById = function(id) {
	var url = "http://localhost:3000/note?id=" + id;
	getNotes(url);
}

$(document).ready(function() {
	// Sets up note request fields
	$("#get-note-button").click(function () {
		getNotesById($("#node-id-input").val());
	});
	$("#node-id-input").keypress(function (e) {
		if(e.which == 13) { getNotesById($("#node-id-input").val()); }
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
			getNotesById(key.generated_key);
		});
	});

	// add all notes from the server to start with
	getNotes("http://localhost:3000/note/all");

	enableCheckboxList();

});

