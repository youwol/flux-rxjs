import { Flux, BuilderView, Pipe, ModuleFlux, freeContract } from '@youwol/flux-core'
import { pack } from './main';


//Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
let svgIcon = `
<g xmlns="http://www.w3.org/2000/svg" id="Layer_1_2_" style="transform: rotate(90deg)">
<path d="M573.113,298.351l-117.301-117.3c-3.824-3.825-10.199-5.1-15.299-2.55c-5.102,2.55-8.926,7.65-8.926,12.75v79.05    c-38.25,0-70.125,6.375-96.9,19.125V145.35h73.951c6.375,0,11.475-3.825,12.75-8.925c2.549-5.1,1.273-11.475-2.551-15.3    L301.537,3.825C298.988,1.275,295.162,0,291.338,0c-3.825,0-7.65,1.275-10.2,3.825l-118.575,117.3    c-3.825,3.825-5.1,10.2-2.55,15.3c2.55,5.1,7.65,8.925,12.75,8.925h75.225v142.8c-26.775-12.75-58.65-19.125-98.175-19.125v-79.05    c0-6.375-3.825-11.475-8.925-12.75c-5.1-2.55-11.475-1.275-15.3,2.55l-117.3,117.3c-2.55,2.55-3.825,6.375-3.825,10.2    s1.275,7.649,3.825,10.2l117.3,117.3c3.825,3.825,10.2,5.1,15.3,2.55c5.1-2.55,8.925-7.65,8.925-12.75v-66.3    c72.675,0,96.9,24.225,96.9,98.175v79.05c0,24.226,19.125,43.351,42.075,44.625h2.55c22.949-1.274,42.074-20.399,42.074-44.625    v-79.05c0-73.95,22.951-98.175,96.9-98.175v66.3c0,6.375,3.826,11.475,8.926,12.75c5.1,2.55,11.475,1.275,15.299-2.55    l117.301-117.3c2.551-2.551,3.824-6.375,3.824-10.2S575.662,300.9,573.113,298.351z"/>
</g>`

export namespace ModuleDispatcher {

    export class PersistentData {
        
        constructor() {
        }
    }

    @Flux({
        pack:           pack,
        namespace:      ModuleDispatcher,
        id:             "Dispatcher",
        displayName:    "Dispatcher",
        description:    "Dispatch data"
    })
    @BuilderView({
        namespace:      ModuleDispatcher,
        icon:           svgIcon
    })
    export class Module extends ModuleFlux {
        
        readonly dispatched$ : Pipe<any>

        constructor(params){ 
            super(params)    
            this.addInput({
                id: "input",     
                description: 'trigger the dispatch',
                contract: freeContract(),
                onTriggered: ({data,configuration, context}) => this.dispatched$.next({data,configuration,context}) 
            })
            this.dispatched$ = this.addOutput()
        }
    }
}