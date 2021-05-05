import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { ModuleFilter } from "../lib/filter.module"


console.log = () => {}

test('filter - implementation as string', (done) => {

    let branches = [
        '|~emitter~|-----|~filter~|---',
    ]
    
    let modules = instantiateModules({
        emitter:        ModuleDataEmitter,      
        filter :       [ModuleFilter, {implementation:"return ({data}) => data==2"}],
    })
    
    let graph       = parseGraph( { branches, modules}  )

    new Runner( graph ) 
    let output$ = modules.filter.outputSlots[0].observable$

    output$
    .subscribe( ({data}) => {   
        expect(data).toEqual(2)
        done()
    })
    for( let i=0 ; i<10; i++){
        modules.emitter.emit({data:i})
    }
})



test('filter - implementation as function', (done) => {

    let branches = [
        '|~emitter~|-----|~filter~|---',
    ]
    
    let modules = instantiateModules({
        emitter:        ModuleDataEmitter,      
        filter :       [ModuleFilter, {implementation:({data}) => data==2}],
    })
    
    let graph       = parseGraph( { branches, modules}  )

    new Runner( graph ) 
    let output$ = modules.filter.outputSlots[0].observable$

    output$
    .subscribe( ({data}) => {   
        expect(data).toEqual(2)
        expect(modules.filter.cache.cachedObjects.length).toEqual(1)
        done()
    })
    for( let i=0 ; i<10; i++){
        modules.emitter.emit({data:i})
    }
})
