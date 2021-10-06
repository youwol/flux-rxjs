import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { Subject } from "rxjs"
import { reduce, take } from "rxjs/operators"
import { ModuleStreamer } from "../lib/streamer.module"


console.log = () => {}

test('dispatch', (done) => {

    let branches = [
        '|~emitter0~|-----|~streamer~|----$streamerOut$--'
    ]
    
    let modules = instantiateModules({
        emitter0:      ModuleDataEmitter,     
        streamer:    ModuleStreamer,
    })
    let observers = {
        streamerOut: new Subject()
    }
    let graph       = parseGraph( { branches, modules, observers}  )

    new Runner( graph ) 
    
    let emitter0First = {data:[0,1,2,3]}
    let expectedFirst = [0,1,2,3]

    observers.streamerOut.pipe(
        reduce( (acc,e) => {
            return acc.concat(e)
        }, [] )
    ).subscribe( (data) => {
        expect(data).toEqual(expectedFirst)
        done()
    })

    modules.emitter0.emit(emitter0First)
    observers.streamerOut.complete()
})
