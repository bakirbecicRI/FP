// For more information see https://aka.ms/fsharp-console-apps

open Elmish
open Elmish.React
open Feliz

type Operator =
  | Add
  | Sub
  | Mul
  | Div
  | Invalid

type Value =
  | Num of int64
  | Posinf
  | Neginf
  | NaN

type Msg =
  | Number of char
  | Eval
  | Clear
  | Operation of Operator

let opToStr (op: Operator) : char =
    match op with
    | Add -> '+'
    | Sub -> '-'
    | Mul -> '*'
    | Div -> '/'
    | Invalid -> '?'

let showValue v =
    match v with
    | Num x -> x.ToString()
    | Posinf -> "+Inf"
    | Neginf -> "-Inf"
    | NaN -> "Nan"

let limit = 10000000000L

let abs64 (x: int64) : int64 =
  if x >= 0L then x else -x

let apply op a b =
    match a, b with
    | NaN, _ | _, NaN -> NaN
    | _, Num 0L when op = Div -> NaN  
    | Posinf, Num y ->
        match op with
        | Add | Mul when y > 0L -> Posinf
        | Add | Mul when y < 0L -> Neginf
        | Sub when y > 0L -> Posinf
        | Sub when y < 0L -> Posinf
        | Div when y > 0L -> Posinf
        | Div when y < 0L -> Neginf
        | _ -> NaN
    | Neginf, Num y ->
        match op with
        | Add | Mul when y > 0L -> Neginf
        | Add | Mul when y < 0L -> Posinf
        | Sub when y > 0L -> Neginf
        | Sub when y < 0L -> Neginf
        | Div when y > 0L -> Neginf
        | Div when y < 0L -> Posinf
        | _ -> NaN
    | Num x, Posinf ->
        match op with
        | Add -> Posinf
        | Sub -> Neginf
        | Mul when x > 0L -> Posinf
        | Mul when x < 0L -> Neginf
        | Div -> Num 0L
        | _ -> NaN
    | Num x, Neginf ->
        match op with
        | Add -> Neginf
        | Sub -> Posinf
        | Mul when x > 0L -> Neginf
        | Mul when x < 0L -> Posinf
        | Div -> Num 0L
        | _ -> NaN
    | Num x, Num y ->
        let r =
            match op with
            | Add -> x + y
            | Sub -> x - y
            | Mul -> x * y
            | Div -> x / y
            | Invalid -> 0L
        if abs64 r >= limit then if r >= 0L then Posinf else Neginf
        else Num r
    | _ -> NaN

 
let parse (s: string) : Value =
  match s with
  | "+Inf" -> Posinf
  | "-Inf" -> Neginf
  | "Nan" -> NaN
  | "" -> Num 0L
  | _ -> Num (int64 s)


let parseExpr (expr:string) : Value =
    
  let findOpIndex (s: string) =
    s |> Seq.tryFindIndex (fun a -> a='+' || a='-' || a='*' || a='/')
  
  match findOpIndex expr with
  | None ->
     parse expr
  | Some x ->
    if (x = 0) then
      let copystr = expr.[1..]
      let idx =  
        match findOpIndex copystr with
        | Some i -> i
        | None -> failwith "Impossible state"
      let lhsStr = expr.Substring(0, idx+1)
      let rhsStr = expr.Substring(idx+2)
      let opChar = copystr[idx]

      let op =
        match opChar with
        | '+' -> Add
        | '-' -> Sub
        | '*' -> Mul
        | '/' -> Div
        | _ -> Invalid

      let lhs = parse lhsStr
      let rhs = parse rhsStr

      apply op lhs rhs

    else
      
      let lhsStr = expr.Substring(0, x)
      let rhsStr = expr.Substring(x+1)
      let opChar = expr[x]

      let op =
        match opChar with
        | '+' -> Add
        | '-' -> Sub
        | '*' -> Mul
        | '/' -> Div
        | _ -> Invalid

      let lhs = parse lhsStr
      let rhs = parse rhsStr

      apply op lhs rhs
    
type State =
  | Num1Input of string
  | Operator of string
  | Num2Input of string

let initial = Num1Input ""

let init() : State = initial

let update (msg: Msg) (state: State) : State =
  match state with
  | Num1Input(str) ->
      match msg with
      | Number x ->
        if str.Length < 10 then
          Num1Input(str + string x)
        else
          state
      | Eval -> state
      | Clear -> initial
      | Operation op ->
          if str = "" then 
            state
          else
          Operator (str + string (opToStr op)) 
  | Operator (expr) -> 
      match msg with 
        | Number x ->
            Num2Input(expr + string x)
        | Eval -> state
        | Clear -> initial
        | Operation (op) ->
            Operator (expr.[0..expr.Length-2] + string (opToStr op))
  | Num2Input(expr) ->
      match msg with
      | Number x ->
          if expr.Length < 20 then Num2Input(expr + string x)
          else
            state
      | Eval ->
          let result = parseExpr expr |> showValue
          Num1Input result
      | Operation op ->
          let result = parseExpr expr |> showValue
          Operator(result + string (opToStr op))
      | Clear -> initial


let view (state: State) (dispatch: Msg -> unit) =
    let btnColored txt msg color =
        Html.button [
            prop.style [ style.fontSize 28; style.margin 4; style.width 90; style.height 90; style.backgroundColor color; style.borderRadius 8 
            ]
            prop.text (txt:string)
            prop.onClick (fun _ -> dispatch msg)
        ]

    let displayText =
        match state with
        | Num1Input s -> s
        | Operator s -> s
        | Num2Input s -> s

    Html.div [
        prop.style [ 
          style.width 400
          style.backgroundColor "#eee"
          style.padding 10
          style.borderWidth 2
          style.borderStyle.inset
          style.borderColor "#aaa"
          style.borderRadius 15
        ]
        prop.children [

            Html.div [
                prop.style [
                    style.height 100
                    style.backgroundColor "#eee"
                    style.textAlign.right
                    style.fontSize 26
                    style.paddingRight 10
                    style.marginBottom 10
                    style.borderRadius 5
                    style.borderWidth 2
                    style.borderStyle.solid
                    style.borderColor "#aaa"

                ]
                prop.text displayText
            ]

            Html.div [
                btnColored "1" (Number '1') "#fff176"; btnColored "2" (Number '2') "#fff176"; btnColored "3" (Number '3') "#fff176"; btnColored "+" (Operation Add) "#90caf9"
            ]

            Html.div [
                btnColored "4" (Number '4') "#fff176"; btnColored "5" (Number '5') "#fff176"; btnColored "6" (Number '6') "#fff176"; btnColored "-" (Operation Sub) "#90caf9"
            ]

            Html.div [
                btnColored "7" (Number '7') "#fff176"; btnColored "8" (Number '8') "#fff176"; btnColored "9" (Number '9') "#fff176"; btnColored "*" (Operation Mul) "#90caf9"
            ]

            Html.div [
                btnColored "CE" (Clear) "#ef9a9a"; btnColored "0" (Number '0') "#fff176"; btnColored "=" Eval "#a5d6a7"; btnColored "/" (Operation Div) "#90caf9"
            ]
        ]
    ]

Program.mkSimple init update view
|> Program.withReactSynchronous "app"
|> Program.run
