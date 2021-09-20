declare type SocketId = number;

declare type Pizarra<TServer> = {
    token:PizarraToken
    public?:boolean
    sockets:{[id:SocketId]:TServer}
    objects:{[k in ObjectId]?:ObjectData|null}
}

declare function uno():void;