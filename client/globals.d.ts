

declare interface ObjectData {
    rectangulito:Rectangulito
}

declare interface HTMLDivElement{
    synchronizeInWebSocket:(opts?:{skippeable:boolean})=>void
    eliminate:()=>void
    lugarAgarreX:number
    lugarAgarreY:number
    movingWithTheMouse:boolean
}
declare var superior: HTMLDivElement
declare var central: HTMLDivElement
declare var lateral: HTMLDivElement
declare var tacho: HTMLDivElement

declare var pizarraIdInput: HTMLInputElement
declare var pizarraTokenInput: HTMLInputElement

declare interface Rectangulito extends HTMLDivElement{
}
