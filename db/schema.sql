--delete the current data if it exist, so we can remake the tables
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS voters;
DROP TABLE IF EXISTS votes;
--parties table needs to come before the candidates because of the constraint and foreign key
CREATE TABLE parties (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);
CREATE TABLE candidates (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    industry_connected BOOLEAN NOT NULL,
    party_id INTEGER UNSIGNED,
    CONSTRAINT fk_party FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE
    SET NULL
);
CREATE TABLE voters (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    --add automatically generated dates to records
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE votes (
    id INTEGER PRIMARY KEY,
    voter_id INTEGER UNSIGNED NOT NULL,
    candidate_id INTEGER UNSIGNED NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    --uc_voter signifies that the values in voter_id must be unique
    --this will not allow a voter to vote twice
    CONSTRAINT uc_voter UNIQUE (voter_id),
    --foreign key constraints and the CASCADE will delete the entire row
    --these will remove the vote if the voter or candidate gets removed from the database
    CONSTRAINT fk_voter FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
    CONSTRAINT fk_candidate FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);