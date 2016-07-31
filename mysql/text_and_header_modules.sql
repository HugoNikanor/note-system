create table text_and_header_modules
(
	id int NOT NULL AUTO_INCREMENT,
	text varchar(4096),

	module_id int NOT NULL,
	note_id int NOT NULL,

	PRIMARY KEY (id)
);
