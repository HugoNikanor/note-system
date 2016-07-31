create table image_modules
(
	id int NOT NULL AUTO_INCREMENT,
	image_src varchar(2000),
	title_text varchar(2000),

	module_id int NOT NULL,
	note_id int NOT NULL,

	PRIMARY KEY (id)
);
