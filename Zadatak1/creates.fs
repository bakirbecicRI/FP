module creates

open Microsoft.Data.Sqlite

let createTablesSql = """

CREATE TABLE IF NOT EXISTS Film (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Naziv TEXT NOT NULL,
  TrajanjeMin INTEGER NOT NULL,
  Opis TEXT
);

CREATE TABLE IF NOT EXISTS Sala (
  Id INTEGER PRIMARY KEY,
  BrojSjedista INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Projekcija (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  FilmId INTEGER NOT NULL,
  SalaId INTEGER NOT NULL,
  Pocetak TEXT NOT NULL,
  Cijena REAL NOT NULL,
  Aktivna INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS Rezervacija (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  ProjekcijaId INTEGER NOT NULL,
  BrojSjedista INTEGER NOT NULL,
  ImeKorisnika TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS AuditLog (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  TimeStamp TEXT NOT NULL,
  AuditDesc TEXT NOT NULL
);
"""

let seedSalaSql = """
INSERT OR IGNORE INTO Sala (Id, BrojSjedista)
VALUES (1, 30);

INSERT OR IGNORE INTO Sala (Id, BrojSjedista)
VALUES (2, 50);
"""

let initDatabase (connection: SqliteConnection) =
  use cmd = connection.CreateCommand()
  cmd.CommandText <- createTablesSql
  cmd.ExecuteNonQuery() |> ignore
  cmd.CommandText <- seedSalaSql
  cmd.ExecuteNonQuery() |> ignore


