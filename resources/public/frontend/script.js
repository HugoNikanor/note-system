/*
 * posts a json object to the server
 * No checks are in place to see if the data is valid
 * The reason for not just calling $.post directly is that this
 * 	first adds an anti forgery token to the request
 */
var post = function(url, json, callback) {
	// TODO can I handle the anti forgery token like this?
	$.get("/note/token/raw", function(token) {
		json["__anti-forgery-token"] = token;
		$.post(url, json, callback);
	});
}

/*
 * This enables the functionalty of selecting and deselecting
 * the list bullet points.
 *
 * TODO reenable post
 */
var checkboxHandler = function(event) {
	var el = $(this);

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
	/*
	post("/note/list/set-checkbox",
			{
				"list-id": el.data("listId"),
				"id": el.data("id"),
				"new-value": newValue,
			});
			*/
	event.stopPropagation();
}

/*
 * This takes a json list of list bullets, and returns the HTML equivalent
 */
/*
var createHTMLList = function(json) {
	var bullets = "";
	var bulletTemplate = Handlebars.compile($("#single-bullet-template").html());
	json.map(function(item) {
		if(item.done)
			item.checked = "checked";
		bullets += bulletTemplate(item);
	});

	return "<ul class='checkbox-list'>"+bullets+"</ul>";
}
*/

/*
 * This handles the post request when adding a new bullet to a list
 *
 * TODO this only needs minor cleanup for the new version
 */
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

/*
 * This takes a note in json form and adds it it in html form to the dom
 * If the note is a list it also fetches the list items, and adds
 * them to the dom
 */
/*
var createNote = function(json) {
	var template = Handlebars.compile($("#note-template").html());

	var note = $(template(json));

	// trigers for the header
	note.find("h1").click(function (event) {
		var element = $(event.currentTarget);

		if(!element.find("input").is(":focus"))
			makeNoteEditable(element);
		event.stopPropagation();
	});

	// trigers for the rest of the note
	// but not the lists, since they are checked for event propagation before
	note.click(function(event) {
		var element = $(event.currentTarget);

		if(!element.find("textarea").is(":focus"))
			makeNoteEditable(element);
		event.stopPropagation();
	});

	//$("#note-container").prepend(template(json));
	$("#note-container").find(".new-note").after(note);

	if(json.type == "list") {
		$.getJSON("/note/list?id="+json.id, function(list) {
			var note = $("#note-" + json.id);

			var items = $(createHTMLList(list));
			// this enables the "clickability" of the list items
			items.click(checkboxHandler);

			note.children("footer").before(items);

			// adds the new-item form for the bullet list
			var source = $("#new-bullet-template").html();
			var template = Handlebars.compile(source);
			var form = template(json);
			note.children("footer").siblings("ul").append(form);

			var form = note.find("form[name=new-bullet]");
			form.submit(newBulletSubmit);
		});
	}
}
*/

/*
 * Get notes by url, and adds them to the dom
 * /note/all
 * /note?id=<id>
 * 		<id> is a comma separated list of note id's
 */
/*
var getNotes = function(url) {
	$.getJSON(url, function(data) {
		data.map(createNote);
	});
}
*/

/*
 * Get notes by id's, and adds them to the dom
 */
/*
var getNotesById = function(id) {
	var url = "/note?id=" + id;
	getNotes(url);
}
*/

/*
 * Handles the post request when creating a new note
 * Adds the newly posted note to the dom
 */
/*
var newNoteForm = function(event) {
	event.preventDefault();
	var form = $(event.target);

	var json =
	{
		"header": form.find("input[name=header]").val(),
		"body": form.find("textarea[name=body]").val(),
		"type": "list"
	}

	post("/note/submit", json,
			function (response) {
				var key = JSON.parse(response)[0].generated_key;
				getNotesById(key);
			});

	form[0].reset();
}
*/

/*
 * Makes the node editable.
 * Currently only works with articles which have one <p> child,
 * or <h1>
 *
 * TODO make <input> submit also work with enter
 */
/*
var makeNoteEditable = function(inObject) {
	var object;
	var id;
	var input;
	var type;

	if(inObject.is("h1")) {
		object = inObject;
		id = object.closest("article").data("id");
		var text = object.text();
		input = $("<input type='text' class='seamless' value='"+text+"'/>");
		type = "header";
	} else {
		object = inObject.find("p");
		id = inObject.data("id");
		var text = object.text();
		input = $("<textarea class='seamless'>"+text+"</textarea>");
		type = "body";
	}

	object.html(input);

	// update dom with new data on
	// also send new data to server
	input.focusout(function (event) {
		var newData = event.currentTarget.value;
		object.html(newData);

		var json = { "id": id, };
		json[type] = newData;

		post("/note/update", json);
	});

	input.focus();
}
*/

// ----------------------------------------------------------------------------

/*
 * Enters the note into edit mode.
 * This should allow the user to modify any text or data about the modules,
 * as well as move and remove modules in and from the note.
 */
$.fn.editModule = function() {

	this.each(function() {
		var module = $(this);

		var type = module.data("type");
		var contents = module.children();

		//console.log(contents);

		switch(type) {
			case "header":
			case "text":
				contents.attr("contenteditable", "true");
				break;
			case "image":
				// replace image with text fields for all the atributes
				break;
			case "list":
				// Note that the button can be deleted since it's a child of the <li>
				// TODO could the buttons be to close together to comfortably be used
				// TODO this should also temporarly disable toggling of the checkmax
				//❌
				var listItems = contents.find("li:not(.new-item)");
				listItems.attr("contenteditable", "true");
				listItems.append("<button class='remove-bullet-button'>X</button>");
				break;
		}
	});

	return this;

}

/*
 * Call this function when a note is done editing
 * This should extract the new data from the note,
 * and send it off to the server.
 */
$.fn.endEdit = function(note) {
	this.each(function() {
		var module = $(this);
		var type = module.data("type");
		var contents = module.children();

		switch(type) {
			case "header":
			case "text":
				contents.attr("contenteditable", "false");
				break;
			case "list":
				// TODO this should reenable checkbox behavior
				var listItems = contents.find("li:not(.new-item)");
				listItems.attr("contenteditable", "false");
				listItems.find(".remove-bullet-button").remove();
				break;
		}
	});

	return this;
}


// Dialog is from where you came, module is where you are going
// Both should be jQuery objects
$.fn.showNextDialog = function(module, callback) {

	var dialog = this;

	// slideUp hides, sildeDown unhides
	dialog.slideUp(200);
	module.slideDown(200);

	// TODO possibly find a more elegant way to
	// stop multiple listeners from being added
	module.find("button").unbind("click");
	module.find("button").click(function(event) {
		callback(event, this);

		// TODO these animations doesn't run!
		//dialog.slideDown();
		//module.slideUp();

		dialog.show(0);
		module.hide(0);
	});

	return this;
}

/*
 * addes a new module of the type 'moduleType',
 * the body 'moduleBody' to the note 'note'
 *
 * Should be applied to a 'note'
 */
$.fn.addNewModule = function(moduleType, moduleBody) {

	var note = this;

	var module = "<div class='" + moduleType + "-module' role='module'>" + moduleBody + "</div>";
	note.find(".module-divide").before(module);

	return this;
}

$(document).ready(function() {
	/*
	 * TODO send data back to the server!
	 */

	// add the submit handler to the new note submit form
	//$(".new-note").submit(newNoteForm);

	// add all notes from the server to start with
	//getNotes("/note/all");

	// enable checkbox lists
	$(document).on("click", ".checkbox-list > li", checkboxHandler);

	// add meta buttons
	$(".module-divide").after($("#meta-control-template").html());

	// edit button
	$(document).on("click", "button.edit-module-btn", function(event) {
		var note = $(this).parents(".note");
		note.find("div[role='module']:not(.meta-module)").editModule();
		note.find(".meta-control-module").showNextDialog(
				note.find(".edit-control-module"),
				function(event, source) {
					note.find("div[role='module']:not(.meta-module)").endEdit();
				});
	});

	// new module button
	$(document).on("click", "button.new-module-btn", function(event) {
		var note = $(this).parents(".note");
		note.find(".meta-control-module").showNextDialog(
				note.find(".module-adder-module"),
				function(event, source) {
					console.log(source);
					var moduleBody;
					var moduleType = source.dataset.type;
					switch(moduleType) {
						case "header":
							moduleBody = "<h1>New Header!</h1>";
							break;
						case "text":
							moduleBody = "<p>New text module created!</p>";
							break;
						case "image":
							moduleBody = "<img src='http://imgs.xkcd.com/comics/red_car.png' />";
							break;
						case "list":
							// TODO this should also add in the item for adding more bullets,
							// ...yet another reason for it to be in a template
							moduleBody = "<ul class='checkbox-list'><li>sample</li></ul>";
							break;
					}
					note.addNewModule(moduleType, moduleBody);
				});

		event.stopPropagation();
	});

	// remove button
	$(document).on("click", "button.remove-module-btn", function(event) {
		var note = $(this).parents(".note");

		note.find(".meta-control-module").showNextDialog(
				note.find(".remove-confirm-module"),
				function(event, source) {
					var note = $(source).closest(".note");
					switch (source.name) {
						case "confirm":
							note.hide("slow", function() {
								note.remove();
							});
							break;
						case "cancel":
							break;
						default:
					}
				});
		event.stopPropagation();
	});
});
