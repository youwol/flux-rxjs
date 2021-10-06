import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { assert } from "node:console"
import { ReplaySubject, Subject } from "rxjs"
import { take } from "rxjs/operators"
import { ModuleCombineLatest } from "../lib/combine-latest.module"


console.log = () => {}

test('combine latest', (done) => {


    let branches = [
        '|~emitter0~|-----|#0~latest~|----$outLatest$',
        '|~emitter1~|-----|#1~latest~|'
    ]
    
    let modules = instantiateModules({
        emitter0:      ModuleDataEmitter,     
        emitter1:      ModuleDataEmitter,     
        latest :       [ModuleCombineLatest, {inputsCount:2}],
    })
    let observers = {
        outLatest: new ReplaySubject(1)
    }
    let graph       = parseGraph( { branches, modules, observers}  )

    new Runner( graph ) 

    //------
    // when
    let emitter0First = {data:0}
    let emitter1First = {data:1}
    let expectedFirst = [0,1]

    // then
    modules.emitter0.emit(emitter0First)
    modules.emitter1.emit(emitter1First)

    // assert 
    observers.outLatest.pipe( 
        take(1)
        )
    .subscribe( (data) => {  
        expect(data).toEqual(expectedFirst)
    })
    //------

    let emitter0Second = {data:2}
    let expectedSecond = [2,1]

    modules.emitter0.emit(emitter0Second)
    observers.outLatest.pipe(
        take(1)
        )
    .subscribe( (data) => {    
        expect(data).toEqual(expectedSecond)
        modules.latest.dispose()
        expect(modules.latest.subscription.closed).toBeTruthy()
        done()
    })
})
