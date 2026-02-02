module Program

open System
open Elmish
open Elmish.React
open Feliz
open BoardModel

// Jedno polje na tabli: ima id (index) i slovo (sa simbolom i poenima iz BoardModel.fs)
type word =
    { id: int
      char: Slovo }

// Jedna pronađena riječ + koliko vrijedi bodova
type finded =
    { text: string
      points: int }

// Koju animaciju trenutno radimo (da znamo šta blokira unos i šta se desilo)
type Anim =
    | Shakeone of int        // shake samo jednog pogrešnog polja (nesusjedno)
    | Shakeselected          // shake svih trenutno odabranih slova (ne postoji riječ)
    | Acceptword             // animacija validne riječi (fly-to-score)
    | Dropboard              // na kraju igre: slova padaju sa table

// Stanje rječnika: dok se učitava / spremno
type WordState =
    | Notloaded
    | Loading
    | Ready of Set<string>   // koristim Set radi brze provjere (contains)

// Faza igre: normalno igranje, animacija u toku ili results ekran
type StageOfGame =
    | Playing
    | Animating of Anim
    | Results

// Glavni model aplikacije (sve što mi treba za igru)
type Model =
    { phase: StageOfGame
      board: word array
      chosen: int list            // lista indexa izabranih polja redom
      currentText: string         // tekst koji se trenutno slaže u input box-u
      score: int
      timeLeft: int
      shakeKey: int               // key za pokretanje shake-a više puta
      shakeWordKey: int
      acceptKey: int              // key za animaciju accept (fly-to-score)
      words: WordState
      found: finded list          // sve validne riječi koje je korisnik našao
      used: Set<string> }         // da ne može istu riječ ponovo

// Poruke koje dolaze iz UI-a ili tajmera (async proračun)
type Msg =
    | Clickcell of int
    | Clearpick
    | Submit
    | Time_tick
    | Loaded_words of Set<string>
    | Animation_done
    | Show_results

// Mali helper da sačekam određeni broj ms (koristim za animacije i tick)
let waitMs (ms: int) =
    async { do! Async.Sleep ms }

// Cmd koji nakon ms pošalje neku poruku nazad u update
let cmdDelay ms msg =
    Cmd.OfAsync.perform (fun () -> waitMs ms) () (fun _ -> msg)

// Svake sekunde šalje Time_tick
let cmdTime_tick =
    Cmd.OfAsync.perform (fun () -> waitMs 1000) () (fun _ -> Time_tick)

// Učitavanje riječi iz fajla (riječi su pisane malim slovima, samo trim + filter praznih)
let loadwords () =
    promise {
        let! r = Fetch.fetch "/words_alpha.txt" []
        let! text = r.text()

        return
            text.Split('\n')
            |> Array.map (fun s -> s.Trim())
            |> Array.filter (fun s -> s <> "")
            |> Set.ofArray
    }

// Da li su riječi spremne (da ne pokušavam provjeru dok se nije učitao)
let canUsewords (m: Model) =
    match m.words with
    | Ready _ -> true
    | _ -> false

// Provjera da li riječ postoji u učitanim riječima
let inwords (m: Model) (w: string) =
    match m.words with
    | Ready ws -> Set.contains w ws
    | _ -> false

// Pravimo ploču 4x4 preko datog algoritma (BoardModel.make_board)
let makeBoard () =
    make_board ()
    |> List.mapi (fun i s -> { id = i; char = s })
    |> List.toArray

// Normalizacija riječi za provjeru (logika je rađena sa malim slovima)
let processWord (s: string) =
    s.Trim().ToLowerInvariant()

// Iz liste izabranih polja “sklopi” string (UI može biti velik, ali na submit ga spustim)
let textFromPick (m: Model) (pick: int list) =
    pick
    |> List.map (fun i -> m.board[i].char.sym)
    |> List.toArray
    |> String

// Sabiranje poena za trenutni izbor
let pointsFromPick (m: Model) (pick: int list) =
    pick |> List.sumBy (fun i -> m.board[i].char.point)

let pickScore (m: Model) =
    pointsFromPick m m.chosen

// Resetujem izbor (kad obrišem ili nakon validacije/greške)
let resetPick (m: Model) =
    { m with chosen = []; currentText = "" }

// Kad je animacija u toku ili results, blokiram unos (ne može klik/submit)
let isLocked (m: Model) =
    match m.phase with
    | Playing -> false
    | _ -> true

// Kad je riječ pogrešna (nije u rječniku), zatresu se sva slova i onda se resetuje izbor
let shakeWholePick (m: Model) =
    let m2 =
        { m with
            shakeKey = m.shakeKey + 1
            shakeWordKey = m.shakeWordKey + 1
            phase = Animating Shakeselected }

    m2, cmdDelay 250 Animation_done

// Inicijalno stanje igre + komande: učitaj riječi i pokreni timer
let init () : Model * Cmd<Msg> =
    let board = makeBoard ()

    { phase = Playing
      board = board
      chosen = []
      currentText = ""
      score = 0
      timeLeft = 120
      shakeKey = 0
      shakeWordKey = 0
      acceptKey = 0
      words = Loading
      found = []
      used = Set.empty },
    Cmd.batch [
        Cmd.OfPromise.perform loadwords () Loaded_words
        cmdTime_tick
    ]

// Update: ovdje je sva logika igre
let update (msg: Msg) (m: Model) : Model * Cmd<Msg> =
    match msg with
    | Loaded_words setWords ->
        // Kad se kompletan rječnik učita, spremim ga u model
        { m with words = Ready setWords }, Cmd.none

    | Time_tick ->
        // Svake sekunde skidam vrijeme, osim ako smo već u Results
        match m.phase with
        | Results ->
            m, Cmd.none
        | _ ->
            let next = m.timeLeft - 1

            if next <= 0 then
                // Kraj igre: blok, obriši izbor, animacija padanja, pa results ekran
                let m2 =
                    { m with
                        timeLeft = 0
                        phase = Animating Dropboard
                        chosen = []
                        currentText = "" }

                m2, cmdDelay 1000 Show_results
            else
                { m with timeLeft = next }, cmdTime_tick

    | Show_results ->
        { m with phase = Results }, Cmd.none

    | Clickcell idx ->
        // Klik na polje: prvo provjere da li je unos zaključan i da li je već izabrano
        if isLocked m then
            m, Cmd.none
        elif List.contains idx m.chosen then
            m, Cmd.none
        else
            // Zadnje izabrano polje (da provjerim susjednost)
            let last =
                match List.tryLast m.chosen with
                | Some x -> x
                | None -> -1

            if not (isSelectionValid last idx) then
                // Ako nije susjedno: zatresi samo to polje, ali NE brišem prethodni izbor
                let m2 =
                    { m with
                        shakeKey = m.shakeKey + 1
                        phase = Animating (Shakeone idx) }

                m2, cmdDelay 320 Animation_done
            else
                // Ako je validno: dodam u izbor i osvježim currentText
                let newPick = m.chosen @ [ idx ]
                let newText = textFromPick m newPick
                { m with chosen = newPick; currentText = newText }, Cmd.none

    | Clearpick ->
        // X dugme: samo resetuje izbor (ako nije locked)
        if isLocked m then m, Cmd.none
        else resetPick m, Cmd.none

    | Submit ->
        // dugme tačno: validacija riječi
        if isLocked m then
            m, Cmd.none
        else
            let w = processWord m.currentText

            if w = "" || m.chosen.IsEmpty then
                m, Cmd.none
            elif Set.contains w m.used then
                // Ako je već korištena riječ, samo ignorišem
                m, Cmd.none
            elif not (canUsewords m) then
                // Ako rječnik nije još spreman: tretiram kao grešku (shake cijeli izbor)
                shakeWholePick m
            elif not (inwords m w) then
                // Riječ ne postoji u rječniku: shake sva slova + reset poslije
                shakeWholePick m
            else
                // Validna riječ: dodam bodove, upišem u found i used, okinem accept animaciju
                let pts = pickScore m
                let fw = { text = w; points = pts }

                let m2 =
                    { m with
                        score = m.score + pts
                        acceptKey = m.acceptKey + 1
                        found = fw :: m.found
                        used = Set.add w m.used
                        phase = Animating Acceptword }

                m2, cmdDelay 550 Animation_done

    | Animation_done ->
        // Kad animacija završi: zavisno od toga koja je bila, vratim state i/ili resetujem izbor
        match m.phase with
        | Animating Acceptword ->
            { resetPick m with phase = Playing }, Cmd.none

        | Animating Shakeselected ->
            { resetPick m with phase = Playing }, Cmd.none

        | Animating (Shakeone _) ->
            { m with phase = Playing }, Cmd.none

        | Animating Dropboard ->
            m, Cmd.none

        | _ ->
            m, Cmd.none

// Gornji panel (score + vrijeme)
let topPanel (m: Model) : ReactElement =
    Html.div [
        prop.className "top-panel"
        prop.children [
            Html.div [
                prop.key ("score-" + string m.acceptKey)
                prop.className (if m.phase = Animating Acceptword then "score-bump" else "")
                prop.text $"Score: {m.score}"
            ]
            Html.div [ prop.text $"Time: {m.timeLeft}s" ]
        ]
    ]

// Input box gdje se prikazuju trenutno izabrana slova + animacije za shake/accept
let wordDisplay (m: Model) : ReactElement =
    let shakeWord =
        match m.phase with
        | Animating Shakeselected -> true
        | _ -> false

    let pickedCells = m.chosen |> List.map (fun i -> m.board[i])

    Html.div [
        prop.key (string m.shakeWordKey)
        prop.className
            ("word-display display-glow "
             + (if shakeWord then "shake" else "")
             + (if m.phase = Animating Acceptword then " accept-overflow" else ""))

        prop.children (
            pickedCells
            |> List.mapi (fun i c ->
                Html.div [
                    prop.key (string c.id + "-" + string m.acceptKey)
                    prop.className ("picked-cell " + (if m.phase = Animating Acceptword then "fly-to-score" else ""))

                    // ovo je jedino ostalo inline jer je delay dinamički (svako slovo kasni malo)
                    if m.phase = Animating Acceptword then
                        prop.style [ style.custom ("animationDelay", $"{float i * 0.07}s") ]

                    prop.children [
                        Html.div [
                            prop.className "picked-cell-points"
                            prop.text (string c.char.point)
                        ]
                        Html.div [
                            prop.className "picked-cell-char"
                            prop.text (string c.char.sym) // UI: velika slova (kako je na tabli)
                        ]
                    ]
                ])
        )
    ]

// Lista riječi nakon kraja igre (sortirano po poenima)
let wordsList (m: Model) : ReactElement =
    Html.div [
        prop.className "words-list"
        prop.children [
            if m.timeLeft = 0 then
                Html.div [
                    prop.className "words-title"
                    prop.text "FOUND WORDS"
                ]

            if m.found.IsEmpty then
                Html.div [
                    prop.className "words-empty"
                    prop.text "No words found"
                ]
            else
                let best = m.found |> List.maxBy (fun x -> x.points)

                Html.div [
                    prop.className "words-best"
                    prop.text $"Best word: {best.text} (+{best.points})"
                ]

                yield!
                    m.found
                    |> List.sortByDescending (fun x -> x.points)
                    |> List.map (fun x ->
                        Html.div [
                            prop.className "word-row"
                            prop.children [
                                Html.div [ prop.text x.text ]
                                Html.div [
                                    prop.className "word-row-points"
                                    prop.text (string x.points)
                                ]
                            ]
                        ])
        ]
    ]

// Prikaz jedne ćelije na tabli + klase za selected/shake/fall
let cellView (c: word) (m: Model) (dispatch: Msg -> unit) =
    let selected = List.contains c.id m.chosen

    let shakeOne =
        match m.phase with
        | Animating (Shakeone i) when i = c.id -> true
        | _ -> false

    let shakeSelected =
        match m.phase with
        | Animating Shakeselected when selected -> true
        | _ -> false

    let falling =
        match m.phase with
        | Animating Dropboard -> true
        | _ -> false

    let shake = shakeOne || shakeSelected

    Html.div [
        prop.key (string c.id + "-" + string (if shake then m.shakeKey else 0))

        prop.className (
            "cell"
            + (if selected then " selected" else "")
            + (if shake then " shake" else "")
            + (if falling then " fall" else "")
        )

        // delay zavisi od id (da polja padaju jedno po jedno)
        if falling then
            prop.style [ style.custom ("animationDelay", $"{float c.id * 0.03}s") ]

        prop.onClick (fun _ ->
            if not (isLocked m) then
                dispatch (Clickcell c.id)
        )

        prop.children [
            Html.div [
                prop.className "cell-points"
                prop.text (string c.char.point)
            ]
            Html.div [
                prop.className "cell-char"
                prop.text (string c.char.sym)
            ]
        ]
    ]

let board (m: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "board"
        prop.children (
            m.board
            |> Array.toList
            |> List.map (fun c -> cellView c m dispatch)
        )
    ]

let buttons (m: Model) (dispatch: Msg -> unit) =
    let locked = isLocked m

    Html.div [
        prop.className "buttons"
        prop.children [
            Html.button [
                prop.className "btn btn-clear"
                prop.text "❌"
                prop.disabled locked
                prop.onClick (fun _ -> if not locked then dispatch Clearpick)
            ]

            Html.button [
                prop.className "btn btn-submit"
                prop.text "✅"
                prop.disabled locked
                prop.onClick (fun _ -> if not locked then dispatch Submit)
            ]
        ]
    ]

// Glavni view: gore panel, input display, buttons ili results lista
let view (m: Model) (dispatch: Msg -> unit) =
    Html.div [
        prop.className "app-container"
        prop.children [
            topPanel m

            if m.timeLeft = 0 then
                Html.div [
                    prop.className "game-over"
                    prop.text "⏰ GAME OVER"
                ]
            else
                Html.none

            wordDisplay m

            match m.phase with
            | Results ->
                wordsList m
            | _ ->
                Html.div [
                    prop.children [
                        board m dispatch
                        if m.timeLeft > 0 then buttons m dispatch else Html.none
                    ]
                ]
        ]
    ]

Program.mkProgram init update view
|> Program.withReactSynchronous "app"
|> Program.run

