-- Possibly have something here for determining the order of the list bullets
CREATE TABLE list_items
(
	id int NOT NULL AUTO_INCREMENT,
	text varchar(4096),
	done BOOLEAN DEFAULT FALSE,

	module_id int NOT NULL,
	note_id int NOT NULL,

	PRIMARY KEY (id)
);
