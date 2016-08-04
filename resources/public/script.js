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
 */
var checkboxHandler = function(event) {
	var el = $(this);
	var ul = el.parent();

	post("/note/list/set-checkbox",
			{
				"note-id":   ul.data("note-id"),
				"module-id": ul.data("module-id"),
				"item-id":   el.data("id"),
				"new-value":
					el
					.toggleClass("checked")
					.hasClass("checked") ? 1 : 0
			});

	event.stopPropagation();
}

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
				var listItems = contents.find("li:not(.new-item)");
				listItems.attr("contenteditable", "true");
				listItems.wrap("<span class='li-spacer' />");
				// Remove the button when unfocused,
				// but first after a short delay so it still is clickable
				// TODO if this delay is to short the button
				// click isn't registered, keep this in mind
				listItems.focusout(function(event) {
					var li = $(this);
					setTimeout(function() {
						li.siblings("button").remove();
					}, 100);
				});
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
				module.find("span").replaceWith(function() {
					var items = $(this).find("li");
					items.attr("contenteditable", "false");
					return items;
				});
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

		dialog.slideDown(200);
		module.slideUp(200);
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
	var moduleDivide = note.find(".module-divide");

	// TODO get data-id for the module from the server
	$("<div class='" + moduleType + "-module' role='module' data-type='" + moduleType + "'>" + moduleBody + "</div>")
		.hide()
		.insertBefore(moduleDivide)
		.slideDown();

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

	// form for adding new items to bullet lists
	$(document).on("submit", "form[name='new-bullet']", function(event) {

		var form = $(this);
		var rawData = form.serializeArray();
		var data = {};

		// transform the json from form.seri... to a more sensible form
		$.each(rawData, function(index, dataPoint) {
			data[dataPoint.name] = dataPoint.value;
		});

		// data is now:
		// {"text":"Test","module-id":"3","note-id":"1"}

		post("/note/list/add-item", data, function(resp) {
			var id = JSON.parse(resp)[0].generated_key;

			$("<li data-id='" + id + "'>" + data.text + "</li>")
				.hide()
				.insertBefore(form.parents("li"))
				.slideDown(200);

			form[0].reset();
		});

		// This stops the form from sending a request to the server
		event.preventDefault();
	});

	// enable checkbox lists
	$(document).on(
			"click",
			".checkbox-list > li[contenteditable!='true']:not(.new-item)",
			checkboxHandler);

	// this listener is here so it isn't added every time edit mode is entered
	// It adds the bullet remove button when a bullet is pressed, the selector
	// targets the li element so that the button doesn't spawn another of itself.
	//
	// Note that deleting all the text in a bullet should also remove it
	$(document).on("focus", ".li-spacer > li", function(event) {
		var btn = $("<button class='remove-bullet-button'>❌</button>");
		btn.click(function(event) {
			// TODO send to server that the bullet is removed
			// or at least add it to the stack of pending changes,
			// if I decide to both have a "save changes" and
			// "cancel changes" button
			console.log(this);
			$(this).parents(".li-spacer").remove();
		});
		$(this).after(btn);
	});

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
					var moduleType = source.name;
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
					if(moduleType !== "cancel") {
						note.addNewModule(moduleType, moduleBody);
					}
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
