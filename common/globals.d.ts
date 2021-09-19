declare type ObjectId = '111111.11111'|'111112.222222'|'etc...';

declare interface ObjectData {
    text:string
    backgroundColor:string
    zIndex:number
    top:number
    left:number
}

declare type UnifiedMessage = {
    lastChange:Date
    lastSend:Date
    cambios:{[k in ObjectId]?:ObjectData|null}
}
