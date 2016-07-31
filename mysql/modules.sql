CREATE TABLE modules
(
	id int NOT NULL AUTO_INCREMENT,
	-- TODO add equation type
	type ENUM ('header', 'text', 'list', 'image') NOT NULL,
	note_id int NOT NULL,

	PRIMARY KEY (id)
);
