

declare interface ObjectData {
    rectangulito:Rectangulito
}

declare interface HTMLDivElement{
    synchronizeInWebSocket:(opts?:{skippeable:boolean})=>void
    lugarAgarreX:number
    lugarAgarreY:number
    movingWithTheMouse:boolean
}
declare var superior: HTMLDivElement
declare var central: HTMLDivElement
declare var lateral: HTMLDivElement
declare var tacho: HTMLDivElement
declare interface Rectangulito extends HTMLDivElement{
}
