// TODO possibly only require a sub url
var post = function(url, json, callback) {
	// TODO can I handle the anti forgery token like this?
	$.get("/note/token/raw", function(token) {
		json["__anti-forgery-token"] = token;
		$.post(url, json, callback);
	});
}

var enableCheckbox = function(event) {
	var el = $(event.toElement);

	var newValue;
	if(el.hasClass("checked")) {
		newValue = 0;
		el.removeClass("checked");
	} else {
		newValue = 1;
		el.addClass("checked");
	}

	// this is also called when pressing the new-item 'item'
	// it probably shouldn't
	post("/note/list/set-checkbox",
			{
				"list-id": el.data("listId"),
				"id": el.data("id"),
				"new-value": newValue,
			});
}

var createHTMLList = function(json) {
	var bullets = "";
	var bulletTemplate = Handlebars.compile($("#single-bullet-template").html());
	json.map(function(item) {
		if(item.done)
			item.checked = "checked";
		bullets += bulletTemplate(item);
	});
	// TODO maybe get the list-id in a prettier way
	// TODO this will break whene there are 0 nodes in the list
	bullets += Handlebars.compile($("#new-bullet-template").html())(json[0]);
	return "<ul class='checkbox-list'>"+bullets+"</ul>";
}


var newBulletSubmit = function(event) {
	var form = $(event.target);

	var textArea = form.find("input[name=text]");
	var text = textArea.val();
	var listId = form.data("listId");
	
	post("/note/list/add-item",
			{
				"list-id": listId,
				"text": text
			},
			function(resp) {
				// resp [{"generated_key": 6}]
				var json =
				{
					"text": text,
					"checked": "",
					"list_id": listId,
					"id": JSON.parse(resp)[0].generated_key
				}

				var template = Handlebars.compile($("#single-bullet-template").html());

				// THIS ELEMENT SOMEHOW HAS THE CLICK LISTENER ALREADY ENABLED‽
				var element = $(template(json));

				// possibly better parent finding
				// should be nearest <li> element
				form.parent().before(element);
				textArea.val("");
			});
	event.preventDefault();
}

var createNote = function(json) {
	var template = Handlebars.compile($("#note-template").html());

	$("#note-container").prepend(template(json));

	if(json.type == "list") {
		$.getJSON("/note/list?id="+json.id, function(list) {
			var note = $("#note-" + json.id);

			var items = $(createHTMLList(list));
			// this enables the "clickability" of the list items
			items.click(enableCheckbox);

			note.children(".note-footer").before(items);
			var form = note.find("form[name=new-bullet]");
			form.submit(newBulletSubmit);
		});
	}
}

var getNotes = function(url) {
	$.getJSON(url, function(data) {
		data.map(createNote);
	});
}

var getNotesById = function(id) {
	var url = "/note?id=" + id;
	getNotes(url);
}

var newNoteForm = function(event) {
	//console.log(event);
	event.preventDefault();
	var form = $(event.target);

	var json =
	{
		"header": form.find("input[name=header]").val(),
		"body": form.find("textarea[name=body]").val(),
		"type": "note"
	}

	post("/note/submit", json,
			function (response) {
				var key = JSON.parse(response)[0].generated_key;
				getNotesById(key);
			});

	form[0].reset();
}

var afterInit = function() {
	var source = $("#new-note-template").html()
	var template = Handlebars.compile(source);
	var form = $(template());
	$("#note-container").prepend(form);

	form.submit(newNoteForm);
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

	/*
	// this still publishes the data to the "value" url
	// but runs this function instead of redirecting
	$("#comment-form").ajaxForm(function(data) {
		// Data is the server response
		JSON.parse(data).map(function(key) {
			getNotesById(key.generated_key);
		});
	});
	*/

	// add all notes from the server to start with
	getNotes("/note/all");

	// TODO this is ugly!
	setTimeout(afterInit, 1500);

});

