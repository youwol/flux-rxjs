import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { ReplaySubject } from "rxjs"
import { take } from "rxjs/operators"
import { ModuleCombineLatest } from "../lib/combine-latest.module"
import { ModuleDispatcher } from "../lib/dispatcher.module"


console.log = () => {}

test('dispatch', (done) => {

    let branches = [
        '|~emitter0~|-----|~dispatcher~|----$dispatchOut$--',
        '|~emitter1~|-----|~dispatcher~|'
    ]
    
    let modules = instantiateModules({
        emitter0:      ModuleDataEmitter,     
        emitter1:      ModuleDataEmitter,     
        dispatcher:    ModuleDispatcher,
    })
    let observers = {
        dispatchOut: new ReplaySubject(1)
    }
    let graph       = parseGraph( { branches, modules, observers}  )

    new Runner( graph ) 
    
    modules.emitter0.emit({data:0})
    observers.dispatchOut.pipe(
        take(1)
    ).subscribe( (data) => {
        expect(data).toEqual(0)
    })

    modules.emitter1.emit({data:1})
     observers.dispatchOut.pipe(
        take(1)
    ).subscribe( (data) => {
        expect(data).toEqual(1)
        done()
    })
})
