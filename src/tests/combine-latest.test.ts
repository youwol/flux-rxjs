import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { take } from "rxjs/operators"
import { ModuleCombineLatest } from "../lib/combine-latest.module"


console.log = () => {}

test('combine latest', (done) => {

    let branches = [
        '|~emitter0~|-----|#0~latest~|----',
        '|~emitter1~|-----|#1~latest~|'
    ]
    
    let modules = instantiateModules({
        emitter0:      ModuleDataEmitter,     
        emitter1:      ModuleDataEmitter,     
        latest :       [ModuleCombineLatest, {inputsCount:2}],
    })
    
    let graph       = parseGraph( { branches, modules}  )

    new Runner( graph ) 
    let output$ = modules.latest.outputSlots[0].observable$
    
    modules.emitter0.emit({data:0})
    modules.emitter1.emit({data:1})
    output$.pipe( 
        take(1)
        )
    .subscribe( ({data}) => {    
        expect(data.length).toEqual(2)
        expect(data[0]).toEqual(0)
        expect(data[1]).toEqual(1)
    })
    modules.emitter0.emit({data:2})
    output$.pipe(
        take(1)
        )
    .subscribe( ({data}) => {    
        expect(data.length).toEqual(2)
        expect(data[0]).toEqual(2)
        expect(data[1]).toEqual(1)
        modules.latest.dispose()
        expect(modules.latest.subscription.closed).toBeTruthy()
        done()
    })
})
