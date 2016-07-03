// TODO possibly only require a sub url
var post = function(url, json, callback) {
	// TODO can I handle the anti forgery token like this?
	$.get("http://localhost:3000/note/token/raw", function(token) {
		json["__anti-forgery-token"] = token;
		$.post(url, json, callback);
	});
}
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

		// this is also called when pressing the new-item 'item'
		// it probably shouldn't
		post("http://localhost:3000/note/list/set-checkbox",
				{
					"list-id": el.data("listId"),
					"id": el.data("id"),
					"new-value": newValue,
				});
	});

}

/*
var enableCheckboxForms = function() {
	$(".checkbox-list").children("form").ajaxForm(function(data) {
		console.log(data);
		return false;
	});
}
*/

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
	
	var json =
			{
				"list-id": listId,
				"text": text
			};


	post("http://localhost:3000/note/list/add-item",
			json,
			function(resp) {
				// resp [{"generated_key": 6}]
				var json =
				{
					"text": text,
					"checked": "",
					"list_id": listId,
					"id": JSON.parse(resp)[0].generated_key
				}

				var htmlStr = Handlebars.compile($("#single-bullet-template").html())( json );

				// possibly better parent finding
				// should be nearest <li> element
				form.parent().before(htmlStr);

				textArea.val("");
			});
	event.preventDefault();
}

var createNote = function(json) {
	var template = Handlebars.compile($("#note-template").html());

	$("#note-container").prepend(
		template(json)
	);

	if(json.type == "list") {
		$.getJSON("http://localhost:3000/note/list?id="+json.id, function(list) {
			$("#note-" + json.id).children(".note-footer").before(createHTMLList(list));
			// TODO possibly check this so it doesn't reaply the function to all forms
			$("form[name=new-bullet]").submit(newBulletSubmit);
		});
	}
}

var getNotes = function(url) {
	$.getJSON(url, function(data) {
		data.map(createNote);
		enableCheckboxList();
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

	//enableCheckboxList();

});

