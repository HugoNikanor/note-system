create table pass_test
(
	id int NOT NULL AUTO_INCREMENT,
	service varchar(255) NOT NULL,
	username varchar(255) NOT NULL,
	email varchar(255) NOT NULL DEFAULT "",
	note varchar(4096),
	date_set datetime DEFAULT CURRENT_TIMESTAMP,
	password blob NOT NULL,
	replaced boolean DEFAULT false,

	PRIMARY KEY (id)
);
