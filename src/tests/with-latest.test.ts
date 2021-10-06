import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { Subject } from "rxjs"
import { reduce } from "rxjs/operators"
import { WithLatest } from ".."


console.log = () => {}

test('with latest, first input as master', (done) => {

    let branches = [
        '|~emitter0~|-----|#0~latest~|----$latestOut$',
        '|~emitter1~|-----|#1~latest~|',
        '|~emitter2~|-----|#2~latest~|'
    ]
    
    let modules = instantiateModules({
        emitter0:      ModuleDataEmitter,     
        emitter1:      ModuleDataEmitter,    
        emitter2:      ModuleDataEmitter,     
        latest :       [WithLatest, {nInputs:3}],
    })
    
    let observers = {
        latestOut: new Subject()
    }

    let graph       = parseGraph( { branches, modules, observers}  )

    new Runner( graph ) 
    observers.latestOut.pipe(
        reduce( (acc,e) => {
            acc.push(e)
            return acc
        }, [])
    ).subscribe( (acc) => {
        console.log(acc)
        let e0 = ["emitter1.1","emitter2.0"]
        e0['trigger'] =  "emitter0.1"
        let e1 = ["emitter1.1","emitter2.2"]
        e1['trigger'] =  "emitter0.2"
        expect(acc).toEqual([e0, e1])
        done()
    })
    
    modules.emitter0.emit({data:"emitter0.0"})
    modules.emitter1.emit({data:"emitter1.0"})
    modules.emitter2.emit({data:"emitter2.0"})


    modules.emitter1.emit({data:"emitter1.1"})
    modules.emitter0.emit({data:"emitter0.1"})

    modules.emitter2.emit({data:"emitter2.2"})
    modules.emitter0.emit({data:"emitter0.2"})
    
    observers.latestOut.complete()
})


test('with latest, third input as master', (done) => {

    let branches = [
        '|~emitter0~|-----|#0~latest~|----$latestOut$',
        '|~emitter1~|-----|#1~latest~|',
        '|~emitter2~|-----|#2~latest~|'
    ]
    
    let modules = instantiateModules({
        emitter0:      ModuleDataEmitter,     
        emitter1:      ModuleDataEmitter,    
        emitter2:      ModuleDataEmitter,     
        latest :       [WithLatest, {nInputs:3, triggerIndex:2}],
    })
    
    let observers = {
        latestOut: new Subject()
    }

    let graph       = parseGraph( { branches, modules, observers}  )

    new Runner( graph ) 
    observers.latestOut.pipe(
        reduce( (acc,e) => {
            acc.push(e)
            return acc
        }, [])
    ).subscribe( (acc) => {
        console.log(acc)
        let e0 = ["emitter0.0","emitter1.0"]
        e0['trigger'] =  "emitter2.0"
        let e1 = ["emitter0.1","emitter1.1"]
        e1['trigger'] =  "emitter2.2"
        expect(acc).toEqual([e0, e1])
        done()
    })
    
    modules.emitter0.emit({data:"emitter0.0"})
    modules.emitter1.emit({data:"emitter1.0"})
    modules.emitter2.emit({data:"emitter2.0"})


    modules.emitter1.emit({data:"emitter1.1"})
    modules.emitter0.emit({data:"emitter0.1"})

    modules.emitter2.emit({data:"emitter2.2"})
    modules.emitter0.emit({data:"emitter0.2"})
    
    observers.latestOut.complete()
})
