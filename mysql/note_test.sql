create table note_test
(
	id int NOT NULL AUTO_INCREMENT,
	header varchar(255),
	body varchar(4096),
	date_set datetime DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id)
);