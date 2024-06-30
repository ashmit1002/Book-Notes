DROP TABLE IF EXISTS books_read;

CREATE TABLE books_read(
	id SERIAL PRIMARY KEY,
	title TEXT,
	isbn TEXT,
	date_read TEXT,
	rate VARCHAR(2),
	review TEXT
);