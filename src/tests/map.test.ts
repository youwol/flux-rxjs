import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { ModuleMap } from "../lib/map.module"


console.log = () => {}

test('map - implementation as string', (done) => {

    let branches = [
        '|~emitter~|-----|~map~|---',
    ]
    
    let modules = instantiateModules({
        emitter:        ModuleDataEmitter,      
        map :       [ModuleMap, {implementation:"return ({data}) => data * 2"}],
    })
    
    let graph       = parseGraph( { branches, modules}  )

    new Runner( graph ) 
    let output$ = modules.map.outputSlots[0].observable$

    output$
    .subscribe( ({data}) => {   
        expect(data).toEqual(2)
        done()
    })
    modules.emitter.emit({data:1})
})


test('map - implementation as function', (done) => {

    let branches = [
        '|~emitter~|-----|~map~|---',
    ]
    
    let modules = instantiateModules({
        emitter:        ModuleDataEmitter,      
        map :       [ModuleMap, {implementation:({data}) => data * 2}],
    })
    
    let graph       = parseGraph( { branches, modules}  )

    new Runner( graph ) 
    let output$ = modules.map.outputSlots[0].observable$

    output$
    .subscribe( ({data}) => {   
        expect(data).toEqual(2)
        expect(modules.map.cache.cachedObjects.length).toEqual(1)
        done()
    })
    modules.emitter.emit({data:1})
})
