CREATE TABLE note_list 
(
	id int NOT NULL AUTO_INCREMENT,
	text varchar(4096),
	done BOOLEAN DEFAULT FALSE,
	list_id int NOT NULL,

	PRIMARY KEY (id)
);
