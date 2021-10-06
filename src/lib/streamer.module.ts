import { Flux, BuilderView, Pipe, ModuleFlux, expect, expectInstanceOf, Context } from '@youwol/flux-core'
import { pack } from './main';


//Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
let svgIcon = `<path d="M475.922,229.325l-144-160c-3.072-3.392-7.36-5.312-11.904-5.312h-96c-6.304,0-12.032,3.712-14.624,9.472    c-2.56,5.792-1.504,12.544,2.72,17.216l134.368,149.312l-134.368,149.28c-4.224,4.704-5.312,11.456-2.72,17.216    c2.592,5.792,8.32,9.504,14.624,9.504h96c4.544,0,8.832-1.952,11.904-5.28l144-160    C481.394,244.653,481.394,235.373,475.922,229.325z"/>
<path d="M267.922,229.325l-144-160c-3.072-3.392-7.36-5.312-11.904-5.312h-96c-6.304,0-12.032,3.712-14.624,9.472    c-2.56,5.792-1.504,12.544,2.72,17.216l134.368,149.312L4.114,389.293c-4.224,4.704-5.312,11.456-2.72,17.216    c2.592,5.792,8.32,9.504,14.624,9.504h96c4.544,0,8.832-1.952,11.904-5.28l144-160    C273.394,244.653,273.394,235.373,267.922,229.325z"/>
`

export namespace ModuleStreamer {

    export class PersistentData {
        constructor() {}
    }

    let expectArray = expect({
        description: "Data as an 'array like'",
        when: (data) => Array.isArray(data)
    })
    @Flux({
        pack:           pack,
        namespace:      ModuleStreamer,
        id:             "Streamer",
        displayName:    "Streamer",
        description:    "Streamer"
    })
    @BuilderView({
        namespace:      ModuleStreamer,
        icon:           svgIcon
    })
    export class Module extends ModuleFlux {
        
        readonly streamed$ : Pipe<any>

        constructor(params){ 
            super(params)    

            this.streamed$ = this.addOutput()
            this.addInput({
                id:"input",
                contract: expectArray,
                onTriggered: ({data,configuration, context}: {
                    data: Array<unknown>, configuration: PersistentData, context: Context
                }) =>{
                    data.forEach( d => {
                        this.streamed$.next({data:d,context}) 
                    })
                }
            })
        }

    }
}