declare interface Posicion{
    x:number 
    y:number
    top:number
    left:number
}
declare interface ObjectData {
    text:string
    backgroundColor:string
    posicion:Posicion
    rectangulito:Rectangulito
}

declare type ObjectId = '111111.11111'|'111112.222222'|'etc...';

declare interface HTMLDivElement{
    synchronizeInWebSocket:()=>void
    lugarAgarreX:number
    lugarAgarreY:number
}
declare var superior: HTMLDivElement
declare var central: HTMLDivElement
declare var lateral: HTMLDivElement
declare var tacho: HTMLDivElement
declare interface Rectangulito extends HTMLDivElement{
}
