import { instantiateModules, ModuleDataEmitter, parseGraph, Runner } from "@youwol/flux-core"
import { ModuleDebounceTime } from "../lib/debounce-time.module"


console.log = () => {}

test('filter - implementation as string', (done) => {

    let branches = [
        '|~emitter~|-----|~debounce~|---',
    ]
    
    let modules = instantiateModules({
        emitter:        ModuleDataEmitter,      
        debounce :      ModuleDebounceTime,
    })
    
    let graph       = parseGraph( { branches, modules}  )

    new Runner( graph ) 
    let output$ = modules.debounce.outputSlots[0].observable$

    output$
    .subscribe( ({data}) => {   
        expect(data).toEqual(9)
        modules.debounce.dispose()
        expect(modules.debounce.subscription.closed).toBeTruthy()
        done()
    })
    for( let i=0 ; i<10; i++){
        modules.emitter.emit({data:i})
    }
})
