module BoardModel

type Slovo =
  {
    sym: char
    point: int
  }

let vowels : List<Slovo> =
  [{sym='A'; point=1}; {sym='E'; point=1}; {sym='I'; point=1}; {sym='O'; point=1}; {sym='U'; point=2}]

let rares : List<Slovo> =
  [{sym='X'; point=10}; {sym='J'; point=10}; {sym='Q'; point=10}; {sym='Z'; point=10}]

let commons : List<Slovo> =
  [{sym='B'; point=4}; {sym='C'; point=4}; {sym='D'; point=2}; {sym='F'; point=4}; {sym='G'; point=3}
   {sym='H'; point=4}; {sym='K'; point=5}; {sym='L'; point=1}; {sym='M'; point=3}; {sym='M'; point=1}
   {sym='P'; point=4}; {sym='R'; point=1}; {sym='S'; point=1}; {sym='T'; point=1}; {sym='V'; point=4}
   {sym='W'; point=4}; {sym='Y'; point=4}]

let no_vowels =
  ['B'; 'C'; 'D'; 'F'; 'G'; 'H'; 'J'; 'K'; 'L'; 'M'; 'N'; 'P'; 'Q'; 'R'; 'T']

let make_vowels() : List<Slovo> =
  let r = System.Random()
  let n_vowels = r.Next(5, 9)
  seq {
    for _ in 1..n_vowels do
      let idx = r.Next(4)
      yield vowels[idx]
  } |> Seq.toList

let make_commons(n: int) : List<Slovo> =
  let r = System.Random()
  seq {
    for _ in 1..n do
      let idx = r.Next(0, 17)
      yield commons[idx]
  } |> Seq.toList

let maybe_rare () : Option<Slovo> =
  let r = System.Random()
  if r.Next(0, 15) = 13 then
    let idx = r.Next(0, 4)
    Some rares[idx]
  else
    None

let shuffle (xs: 'a list) : 'a list =
  let rng = System.Random()
  let a = List.toArray xs
  // Fisher–Yates
  for i = a.Length - 1 downto 1 do
      let j = rng.Next(i + 1)
      let tmp = a[i]
      a[i] <- a[j]
      a[j] <- tmp
  Array.toList a

let isSelectionValid (lastIdx: int) (newIdx: int) : bool =
  if lastIdx = -1 then 
    true
  else
    let side = 4
    let lr, lc = lastIdx / side, lastIdx % side
    let nr, nc = newIdx / side, newIdx % side
    let dr = abs (lr - nr)
    let dc = abs (lc - nc)
    dr <= 1 && dc <= 1 && (dr <> 0 || dc <> 0)

let make_board() : List<Slovo> =
  let vowels = make_vowels()
  match maybe_rare(), maybe_rare() with
  | (Some r1), (Some r2) ->
    let commons = make_commons(14-vowels.Length)
    shuffle (r1 :: (r2 :: commons |> List.append vowels))
  | (Some r1), None ->
    let commons = make_commons(15-vowels.Length)
    shuffle (r1 :: commons |> List.append vowels)
  | (None), (Some r2) ->
    let commons = make_commons(15-vowels.Length)
    shuffle (r2 :: commons |> List.append vowels)
  | (None), (None) ->
    let commons = make_commons(16-vowels.Length)
    shuffle (commons |> List.append vowels)

