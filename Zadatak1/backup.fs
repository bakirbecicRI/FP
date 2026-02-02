open System
open Microsoft.Data.Sqlite

open creates
open upiti

module InputHelper =
    let ReadLine(prompt: string) =
        Console.Write(prompt)
        Console.ReadLine()

    let PressEnter() =
        Console.WriteLine("Pritisnite Enter za nastavak...")
        Console.ReadLine() |> ignore

type Admin(connectionString: string, adminPin: string) =
    member this.Login() =
        Console.Clear()
        let pin = InputHelper.ReadLine("Unesite admin PIN: ")
        if pin <> adminPin then
            Console.WriteLine("Pogresan PIN!")
            InputHelper.PressEnter()
            false
        else true

    member this.Loop() =
        let rec loop () =
            Console.Clear()
            Console.WriteLine("ADMIN MENI")
            Console.WriteLine("1. Dodaj film")
            Console.WriteLine("2. Izmjeni film")
            Console.WriteLine("3. Obrisi film")
            Console.WriteLine("4. Zakazi projekciju")
            Console.WriteLine("5. Izmjeni projekciju")
            Console.WriteLine("6. Otkazi projekciju")
            Console.WriteLine("7. Pregled rezervacija za projekciju")
            Console.WriteLine("0. Nazad")

            match InputHelper.ReadLine("Odaberite opciju: ") with
            | "1" ->
                let naziv = InputHelper.ReadLine "Naziv filma: "
                let trajanje = int (InputHelper.ReadLine "Trajanje (min): ")
                let opis = InputHelper.ReadLine "Opis filma: "
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                insertFilm naziv trajanje opis cmd
                cmd.ExecuteNonQuery |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"Dodan film: {naziv}" auditCmd
                auditCmd.ExecuteNonQuery() |> ignore  
                Console.WriteLine("Film dodan!")
                InputHelper.PressEnter()
                loop()
            | "2" ->
                let id = int (InputHelper.ReadLine "ID filma: ")
                let naziv = InputHelper.ReadLine "Novi naziv: "
                let trajanje = int (InputHelper.ReadLine "Novo trajanje (min): ")
                let opis = InputHelper.ReadLine "Novi opis: "
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                updateFilm id naziv trajanje opis cmd
                cmd.ExecuteNonQuery() |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"{id} Film izmjenjen" auditCmd
                auditCmd.ExecuteNonQuery |> ignore
                Console.WriteLine("Film izmjenjen!")
                InputHelper.PressEnter()
                loop()
            | "3" ->
                let id = int (InputHelper.ReadLine "ID filma: ")
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                deleteFilm id cmd
                cmd.ExecuteNonQuery |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"{id} Film obrisan (ako nije bilo projekcije)" auditCmd
                auditCmd.ExecuteNonQuery() |> ignore
                Console.WriteLine("Film obrisan (ako nema projekcija)!")
                InputHelper.PressEnter()
                loop()
            | "4" ->
                Console.WriteLine("Prikaz dostupnih filmova: ")
                Console.WriteLine("Id   |  Naziv Filma   |   Trajanje   |   Opis   ") 
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd1 = conn.CreateCommand()
                cmd1.CommandText <- "Select * FROM Film;"
                use exec = cmd1.ExecuteReader()
                while exec.Read() do
                    printfn "%d, %s, %d, %s" (exec.GetInt32(0)) (exec.GetString(1)) (exec.GetInt32(2)) (exec.GetString(3))    
                let filmId = int (InputHelper.ReadLine "ID filma: ")
                let salaId = int (InputHelper.ReadLine "ID sale (1 ili 2): ")
                let pocetak = InputHelper.ReadLine "Datum i vrijeme (YYYY-MM-DD HH:MM): "
                let cijena = float (InputHelper.ReadLine "Cijena karte: ")
                use cmd = conn.CreateCommand()
                insertProjekcija filmId salaId pocetak cijena cmd
                cmd.ExecuteNonQuery() |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"{id} Projekcija dodana!" auditCmd
                auditCmd.ExecuteNonQuery() |> ignore
                Console.WriteLine("Projekcija dodana!")
                InputHelper.PressEnter()
                loop()
            | "5" ->
                let id = int (InputHelper.ReadLine "ID projekcije: ")
                let salaId = int (InputHelper.ReadLine "Nova sala (1 ili 2): ")
                let pocetak = InputHelper.ReadLine "Novi datum i vrijeme (YYYY-MM-DD HH:MM): "
                let cijena = float (InputHelper.ReadLine "Nova cijena karte: ")
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                updateProjekcija id salaId pocetak cijena cmd
                cmd.ExecuteNonQuery() |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"Izmjenjena projekcija ID={id}" auditCmd
                auditCmd.ExecuteNonQuery() |> ignore
                Console.WriteLine("Projekcija izmjenjena!")
                InputHelper.PressEnter()
                loop()
            | "6" ->
                let id = int (InputHelper.ReadLine "ID projekcije: ")
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                cancelProjekcija id cmd
                cmd.ExecuteNonQuery() |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"OTkazana projekcija ID={id}" auditCmd
                auditCmd.ExecuteNonQuery() |> ignore
                Console.WriteLine("Projekcija otkazana!")
                InputHelper.PressEnter()
                loop()
            | "7" ->
                let id = int (InputHelper.ReadLine "ID projekcije: ")
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                selectRezervacijeByProjekcija id cmd
                use reader = cmd.ExecuteReader()
                Console.WriteLine("BrojSjedista | ImeKorisnika")
                while reader.Read() do
                    Console.WriteLine($"{reader.GetInt32(0)} | {reader.GetString(1)}")
                InputHelper.PressEnter()
                loop()
            | "0" -> ()
            | _ -> loop()
        loop()

type User(connectionString: string) =
    member this.Loop() =
        let rec loop () =
            Console.Clear()
            Console.WriteLine("KORISNIK MENI")
            Console.WriteLine("1. Pregled projekcija po datumu")
            Console.WriteLine("2. Pretraga projekcija po nazivu filma")
            Console.WriteLine("3. Prikaz sale")
            Console.WriteLine("4. Kreiranje rezervacije")
            Console.WriteLine("5. Otkazivanje rezervacije")
            Console.WriteLine("6. Pretraga rezervacija po imenu korisnika")
            Console.WriteLine("0. Nazad")

            match InputHelper.ReadLine("Odaberite opciju: ") with
            | "1" ->
                let datum = InputHelper.ReadLine "Datum (YYYY-MM-DD): "
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                selectProjekcijaByDate datum cmd
                use reader = cmd.ExecuteReader()
                Console.WriteLine("ID | Film | Sala | Pocetak | Cijena")
                while reader.Read() do
                    Console.WriteLine($"{reader.GetInt32(0)} | {reader.GetString(1)} | {reader.GetInt32(2)} | {reader.GetString(3)} | {reader.GetDouble(4)}")
                InputHelper.PressEnter()
                loop()
            | "2" ->
                let naziv = InputHelper.ReadLine "Naziv filma: "
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                selectProjekcijaByFilmName naziv cmd
                use reader = cmd.ExecuteReader()
                Console.WriteLine("ID | Film | Sala | Pocetak | Cijena")
                while reader.Read() do
                    Console.WriteLine($"{reader.GetInt32(0)} | {reader.GetString(1)} | {reader.GetInt32(2)} | {reader.GetString(3)} | {reader.GetDouble(4)}")
                InputHelper.PressEnter()
                loop()
            | "3" ->
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use command = conn.CreateCommand()
                Console.WriteLine("Prikaz rezervacija: ")
                Console.WriteLine("    ID     |     SalaID    |     Pocetak    |    Cijena    ")
                command.CommandText <- "SELECT Id, SalaId, Pocetak, Cijena FROM Projekcija WHERE Aktivna = 1;"
                use read = command.ExecuteReader()
                while read.Read() do
                    printfn "%d | %d | %s | %.2f"(read.GetInt32(0))(read.GetInt32(1))(read.GetString(2))(read.GetDouble(3))
                let projId = int (InputHelper.ReadLine "ID projekcije: ")
                use cmd = conn.CreateCommand()
                selectSjedistaByProjekcija projId cmd
                use reader = cmd.ExecuteReader()
                let mutable zauzeta = []
                while reader.Read() do
                    zauzeta <- reader.GetInt32(0) :: zauzeta
                use cmd2 = conn.CreateCommand()
                cmd2.CommandText <- "SELECT BrojSjedista FROM Sala WHERE Id = (SELECT SalaId FROM Projekcija WHERE Id=@Id);"
                cmd2.Parameters.AddWithValue("@Id", projId) |> ignore
                let brojSjedista =
                    use r = cmd2.ExecuteReader()
                    if r.Read() then r.GetInt32(0) else 0
                Console.WriteLine("Prikaz sale: . = slobodno, X = zauzeto")
                for i in 1 .. brojSjedista do
                    if List.contains(i) zauzeta then Console.Write("X ") else Console.Write(". ")
                    if i % 10 = 0 then printfn "\n"
                Console.WriteLine()
                InputHelper.PressEnter()
                loop()
            | "4" ->
                let projId = int (InputHelper.ReadLine "ID projekcije: ")
                let brojSjedista = int (InputHelper.ReadLine "Broj sjedista: ")
                let ime = InputHelper.ReadLine "Ime korisnika: "
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cm = conn.CreateCommand()
                cm.CommandText <- "SELECT SalaId FROM Projekcija WHERE Id = @id;" 
                cm.Parameters.AddWithValue("id", projId) |> ignore
                use read = cm.ExecuteReader()

                if read.Read() then
                  let id = read.GetInt32(0)
                  if ((id = 1 && brojSjedista <= 30) || (id = 2 && brojSjedista <= 50)) then
                    use cmd = conn.CreateCommand()
                    cmd.CommandText <- "SELECT BrojSjedista FROM Rezervacija WHERE ProjekcijaId = @id;"
                    cmd.Parameters.AddWithValue("@id", projId) |> ignore
                    let mutable zauzeti = []
                    use reader = cmd.ExecuteReader()
                    while reader.Read() do
                          zauzeti <- reader.GetInt32(0) :: zauzeti
                          if List.contains brojSjedista zauzeti then
                             Console.WriteLine(sprintf "Sjediste %d je već zauzeto! Rezervacija nije moguća." brojSjedista)
                          else
                             use cmdInsert = conn.CreateCommand()
                             insertRezervacija projId brojSjedista ime cmdInsert
                             cmdInsert.ExecuteNonQuery() |> ignore
                             use auditCmd = conn.CreateCommand()
                             insertAudit $"USER: Rezervacija proj={projId}, sjediste={brojSjedista}, ime={ime}" auditCmd
                             auditCmd.ExecuteNonQuery() |> ignore
                             Console.WriteLine("Rezervacija kreirana!")
                             InputHelper.PressEnter()
                             loop()
                  else
                    printfn"Broj sjedista nije validan za ovu salu!"
                    InputHelper.PressEnter()
                    loop()
            | "5" ->
                let rezId = int (InputHelper.ReadLine "ID rezervacije: ")
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                deleteRezervacija rezId cmd
                cmd.ExecuteNonQuery() |> ignore
                use auditCmd = conn.CreateCommand()
                insertAudit $"USER: Otkazana rezervacija ID={id}" auditCmd
                auditCmd.ExecuteNonQuery() |> ignore
                Console.WriteLine("Rezervacija otkazana!")
                InputHelper.PressEnter()
                loop()
            | "6" ->
                let ime = InputHelper.ReadLine "Ime korisnika: "
                use conn = new SqliteConnection(connectionString)
                conn.Open()
                use cmd = conn.CreateCommand()
                selectRezervacijeByUserName ime cmd
                use reader = cmd.ExecuteReader()
                Console.WriteLine("ID | Projekcija | BrojSjedista | Ime")
                while reader.Read() do
                    Console.WriteLine($"{reader.GetInt32(0)} | {reader.GetInt32(1)} | {reader.GetInt32(2)} | {reader.GetString(3)}")
                InputHelper.PressEnter()
                loop()
            | "0" -> ()
            | _ -> loop()
        loop()

type Kino(connectionString: string) =
    member this.MainMenu() =
        let rec loop () =
            Console.Clear()
            Console.WriteLine("1. Admin")
            Console.WriteLine("2. Korisnik")
            Console.WriteLine("0. Izlaz")
            match InputHelper.ReadLine("Odaberite opciju: ") with
            | "1" ->
                let admin = Admin(connectionString, "1234")
                if admin.Login() then admin.Loop()
                loop()
            | "2" ->
                let user = User(connectionString)
                user.Loop()
                loop()
            | "0" -> ()
            | _ -> loop()
        loop()

let main () =
    use conn = new SqliteConnection("Data Source=kino.db")
    conn.Open()
    initDatabase conn
    let kino = Kino("Data Source=kino.db")
    kino.MainMenu()

main()

