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

/*
 * This handles the post request when adding a new bullet to a list 
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
			items.click(enableCheckbox);

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

/*
 * Get notes by url, and adds them to the dom
 * /note/all
 * /note?id=<id>
 * 		<id> is a comma separated list of note id's
 */
var getNotes = function(url) {
	$.getJSON(url, function(data) {
		data.map(createNote);
	});
}

/*
 * Get notes by id's, and adds them to the dom
 */
var getNotesById = function(id) {
	var url = "/note?id=" + id;
	getNotes(url);
}

/*
 * Handles the post request when creating a new note
 * Adds the newly posted note to the dom
 */
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

/*
 * Makes the node editable.
 * Currently only works with articles which have one <p> child,
 * or <h1>
 *
 * TODO make <input> submit also work with enter
 */
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

$(document).ready(function() {
	// add the submit handler to the new note submit form
	//$(".new-note").submit(newNoteForm);

	// add all notes from the server to start with
	//getNotes("/note/all");
	
	$(document).on("click", ".checkbox-list > li", enableCheckbox);

	// TODO decide if vanilla or jQuery should be used

	var addCompBtns =
		"<div class='module module-adder'> \
			 <button data-type='header' class='module-btn header-module-btn'>H</button> \
			 <button data-type='text'   class='module-btn text-module-btn'  >P</button> \
			 <button data-type='list'   class='module-btn list-module-btn'  >L</button> \
			 <button data-type='image'  class='module-btn img-module-btn'   >I</button> \
		 </div>"

	//var plusBtn = document.querySelector(".module-adder button.pre-module-btn").parentNode.cloneNode(true);
	$(document).on("click", "button.edit-module-btn", function(event) {
		console.log("Editing note:");
		console.log(this.parentNode.parentNode);
		event.stopPropagation();
	});

	$("button.pre-module-btn").on("click", function(event) {
		console.log(this);
		// TODO fancy animations
		//$(this).replaceWith(addCompBtns);
		this.parentNode.insertAdjacentHTML("beforebegin", addCompBtns);
		this.parentNode.style.display = "none";
		event.stopPropagation();
	});

	$(document).on("click", "button.module-btn", function(event) {

		var newModule = document.createElement("div");
		newModule.className = "module";

		var type = this.dataset.type;
		newModule.dataset.type = type;

		switch(this.dataset.type) {
			case "header":
				newModule.innerHTML = "<h1>New Header!</h1>";
				break;
			case "text":
				newModule.innerHTML = "<p>New text module created!</p>";
				break;
			case "image":
				newModule.innerHTML = "<img src='http://imgs.xkcd.com/comics/red_car.png' />";
				break;
			case "list":
				newModule.innerHTML = "<ul class='checkbox-list'><li>sample</li></ul>";
				break;
		}
		// TODO which one of these are best
		//this.parentNode.parentNode.insertBefore(newModule, this.parentNode);
		//this.parentNode.insertAdjacentHTML("beforebegin", newModule.outerHTML);

		//this.parentNode.insertAdjacentHTML("afterend", plusBtn.outerHTML);
		/*
		this.parentNode.insertAdjacentHTML("afterend", newModule.outerHTML);
		this.parentNode.remove();
		*/
		this.parentNode.parentNode.replaceChild(newModule, this.parentNode);
		//this.parentNode.style.display = "block";

		// TODO remove this, add propper iteration
		// This should just make the meta control vissible again
		NodeList.prototype.forEach = Array.prototype.forEach;
		document.querySelectorAll(".meta-control button.pre-module-btn").forEach(function (i) {
			i.parentNode.style.display = "block";
		});

		// TODO
		var listId = 0;
		var moduleJson = {
			"type": type,
			"list-id": listId
		}
		//post("/note/add-module", moduleJson, function() { });

		event.stopPropagation();
	});
});

