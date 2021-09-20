declare type ObjectId = '111111.11111'|'111112.222222'|'etc...'

declare interface ObjectData {
    text:string
    backgroundColor:string
    zIndex:number
    top:number
    left:number
}

declare type PizarraId = 'publica' | '__default__' | 'etc...'

declare type PizarraToken = 'Token1' | 'Token2' | 'etc...'

declare type UnifiedMessage = {
    pizarraId:PizarraId
    pizarraToken?:PizarraToken|null
    lastChange:Date
    lastSend:Date
    cambios:{[k in ObjectId]?:ObjectData|null}
}
