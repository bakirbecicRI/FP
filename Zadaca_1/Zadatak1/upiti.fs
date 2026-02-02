module upiti
open System
open Microsoft.Data.Sqlite

let selectProjekcijaByDate (date: string) =
  let sql = "SELECT p.Id, f.Naziv, p.SalaId, p.Pocetak, p.Cijena 
             FROM Projekcija p
             JOIN Film f ON p.FilmId = f.Id
             WHERE date(p.Pocetak) = @Datum AND p.Aktivna = 1;"
  fun (cmd: SqliteCommand) ->
      cmd.CommandText <- sql
      cmd.Parameters.AddWithValue("@Datum", date) |> ignore

let selectProjekcijaByFilmName (name: string) =
  let sql = "SELECT p.Id, f.Naziv, p.SalaId, p.Pocetak, p.Cijena
             FROM Projekcija p
             JOIN Film f ON p.FilmId = f.Id
             WHERE f.Naziv LIKE @Naziv AND p.Aktivna = 1;"
  fun (cmd: SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@Naziv", "%" + name + "%") |> ignore

let selectRezervacijeByProjekcija (projekcijaId: int) =
  let sql = "SELECT BrojSjedista, ImeKorisnika
             FROM Rezervacija
             WHERE ProjekcijaId = @ProjekcijaId;"
  fun (cmd: SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@ProjekcijaId", projekcijaId) |> ignore

let insertRezervacija (projekcijaId: int) (brojSjedista: int) (ime: string) =
  let sql = "INSERT INTO Rezervacija (ProjekcijaId, BrojSjedista, ImeKorisnika)
             VALUES (@ProjekcijaId, @BrojSjedista, @ImeKorisnika);"
  fun (cmd: SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@ProjekcijaId", projekcijaId) |> ignore
    cmd.Parameters.AddWithValue("@BrojSjedista", brojSjedista) |> ignore
    cmd.Parameters.AddWithValue("@ImeKorisnika", ime) |> ignore

let deleteRezervacija (rezervacijaId: int) =
  let sql = "DELETE FROM Rezervacija WHERE Id = @Id;"
  fun (cmd: SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@Id", rezervacijaId) |> ignore

let selectRezervacijeByUserName (ime: string) =
  let sql = "SELECT r.Id, r.ProjekcijaId, r.BrojSjedista, r.ImeKorisnika
             FROM Rezervacija r
             WHERE r.ImeKorisnika LIKE @Ime;"
  fun (cmd: SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@Ime", "%" + ime + "%") |> ignore

let selectSjedistaByProjekcija (projekcijaId:int) =
  let sql = "SELECT BrojSjedista FROM Rezervacija WHERE ProjekcijaId = @ProjekcijaId;"
  fun (cmd : SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@ProjekcijaId", projekcijaId) |> ignore

let insertFilm (naziv:string) (trajanje:int) (opis:string) =
  let sql = "INSERT INTO Film(Naziv, TrajanjeMin, Opis) VALUES(@Naziv, @Trajanje, @Opis);"
  fun (cmd: SqliteCommand) ->
    cmd.CommandText <- sql
    cmd.Parameters.AddWithValue("@Naziv", naziv) |> ignore
    cmd.Parameters.AddWithValue("@Trajanje", trajanje) |> ignore
    cmd.Parameters.AddWithValue("@Opis", opis) |> ignore

let updateFilm (id:int) (naziv:string) (trajanje:int) (opis:string) =
    let sql = "UPDATE Film SET Naziv=@Naziv, TrajanjeMin=@Trajanje, Opis=@Opis WHERE Id=@Id;"
    fun (cmd: SqliteCommand) ->
        cmd.CommandText <- sql
        cmd.Parameters.AddWithValue("@Id", id) |> ignore
        cmd.Parameters.AddWithValue("@Naziv", naziv) |> ignore
        cmd.Parameters.AddWithValue("@Trajanje", trajanje) |> ignore
        cmd.Parameters.AddWithValue("@Opis", opis) |> ignore

let deleteFilm (id:int) =
    let sql = "DELETE FROM Film WHERE Id=@Id AND NOT EXISTS (SELECT 1 FROM Projekcija WHERE FilmId=@Id);"
    fun (cmd: SqliteCommand) ->
        cmd.CommandText <- sql
        cmd.Parameters.AddWithValue("@Id", id) |> ignore


let insertProjekcija (filmId:int) (salaId:int) (pocetak:string) (cijena:float) =
    let sql = "INSERT INTO Projekcija(FilmId, SalaId, Pocetak, Cijena) VALUES(@FilmId,@SalaId,@Pocetak,@Cijena);"
    fun (cmd: SqliteCommand) ->
        cmd.CommandText <- sql
        cmd.Parameters.AddWithValue("@FilmId", filmId) |> ignore
        cmd.Parameters.AddWithValue("@SalaId", salaId) |> ignore
        cmd.Parameters.AddWithValue("@Pocetak", pocetak) |> ignore
        cmd.Parameters.AddWithValue("@Cijena", cijena) |> ignore

let updateProjekcija (id:int) (salaId:int) (pocetak:string) (cijena:float) =
    let sql = "UPDATE Projekcija SET SalaId=@SalaId, Pocetak=@Pocetak, Cijena=@Cijena WHERE Id=@Id;"
    fun (cmd: SqliteCommand) ->
        cmd.CommandText <- sql
        cmd.Parameters.AddWithValue("@Id", id) |> ignore
        cmd.Parameters.AddWithValue("@SalaId", salaId) |> ignore
        cmd.Parameters.AddWithValue("@Pocetak", pocetak) |> ignore
        cmd.Parameters.AddWithValue("@Cijena", cijena) |> ignore

let cancelProjekcija (id:int) =
    let sql = "UPDATE Projekcija SET Aktivna=0 WHERE Id=@Id;"
    fun (cmd: SqliteCommand) ->
        cmd.CommandText <- sql
        cmd.Parameters.AddWithValue("@Id", id) |> ignore

let insertAudit (opis:string) (cmd:SqliteCommand) =
  cmd.CommandText <- "
      INSERT INTO AuditLog (TimeStamp, AuditDesc)
      VALUES (@ts, @desc);"
  cmd.Parameters.Clear()
  cmd.Parameters.AddWithValue("@ts", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")) |> ignore
  cmd.Parameters.AddWithValue("@desc", opis) |> ignore

let existsFilm (filmId:int) (conn: SqliteConnection) =
    use cmd = conn.CreateCommand()
    cmd.CommandText <- "SELECT 1 FROM Film WHERE Id=@Id;"
    cmd.Parameters.AddWithValue("@Id", filmId) |> ignore
    use reader = cmd.ExecuteReader()
    reader.Read()

let existsProjekcija (projekcijaId:int) (conn: SqliteConnection) =
    use cmd = conn.CreateCommand()
    cmd.CommandText <- "SELECT 1 FROM Projekcija WHERE Id=@Id AND Aktivna=1;"
    cmd.Parameters.AddWithValue("@Id", projekcijaId) |> ignore
    use reader = cmd.ExecuteReader()
    reader.Read()

let existsRezervacija (rezervacijaId:int) (conn: SqliteConnection) =
    use cmd = conn.CreateCommand()
    cmd.CommandText <- "SELECT 1 FROM Rezervacija WHERE Id=@Id;"
    cmd.Parameters.AddWithValue("@Id", rezervacijaId) |> ignore
    use reader = cmd.ExecuteReader()
    reader.Read()

let selectProjekcijaByDateAndName (date: string) (name: string) =
    let sql = "
        SELECT p.Id, f.Naziv, p.SalaId, p.Pocetak, p.Cijena
        FROM Projekcija p
        JOIN Film f ON p.FilmId = f.Id
        WHERE date(p.Pocetak) = @Datum AND f.Naziv LIKE @Naziv AND p.Aktivna = 1;"
    fun (cmd: SqliteCommand) ->
        cmd.CommandText <- sql
        cmd.Parameters.Clear()
        cmd.Parameters.AddWithValue("@Datum", date) |> ignore
        cmd.Parameters.AddWithValue("@Naziv", "%" + name + "%") |> ignore

let existsProjekcijaForFilm (filmId: int) (conn: SqliteConnection) : bool =
    use cmd = conn.CreateCommand()
    cmd.CommandText <- """
        SELECT COUNT(*)
        FROM Projekcija
        WHERE FilmId = @filmId AND Aktivna = 1;
    """
    cmd.Parameters.AddWithValue("@filmId", filmId) |> ignore
    let count : int = Convert.ToInt32(cmd.ExecuteScalar())
    count > 0


