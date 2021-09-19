declare type ObjectId = '111111.11111'|'111112.222222'|'etc...';

declare interface Posicion{
    x:number 
    y:number
    top:number
    left:number
}

declare interface ObjectData {
    text:string
    backgroundColor:string
    zIndex:number
    posicion:Posicion
}

declare type UnifiedMessage = {
    lastChange:Date
    lastSend:Date
    cambios:{[k in ObjectId]?:ObjectData|null}
}