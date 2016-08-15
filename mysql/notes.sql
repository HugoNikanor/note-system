create table notes
(
	id int NOT NULL AUTO_INCREMENT,
	date_created datetime DEFAULT CURRENT_TIMESTAMP,
	color VARCHAR(128) DEFAULT "yellow",

	PRIMARY KEY (id)
);
