import { freeContract, BuilderView, Flux, Property, ModuleFlux, 
    Pipe, Cache, Schema, Context, ValueKey } from '@youwol/flux-core'

import{pack} from './main'

/**
  ## Presentation

This module map the messages from input to output given a provided javascript function implementation.

Incoming messages are provided as argument to the mapping function and the returned object is emitted in the output.

 ## Resources

 Various resources:
 -    [rxjs map](https://rxjs-dev.firebaseapp.com/api/operators/map):
 RxJs documentation for map operator
 */
export namespace ModuleMap{

    //Icons made by <a href="https://www.flaticon.com/authors/darius-dan" title="Darius Dan">Darius Dan</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
    let svgIcon = `
<path d="M47.787,266.24C21.439,266.24,0,287.677,0,314.027c0,26.349,21.439,47.787,47.787,47.787s47.787-21.437,47.787-47.787    C95.573,287.677,74.134,266.24,47.787,266.24z M47.787,348.16c-18.819,0-34.133-15.314-34.133-34.133    c0-18.819,15.314-34.133,34.133-34.133s34.133,15.314,34.133,34.133C81.92,332.846,66.606,348.16,47.787,348.16z"/>
<path d="M293.547,225.28c-37.641,0-68.267,30.623-68.267,68.267s30.626,68.267,68.267,68.267s68.267-30.623,68.267-68.267    S331.187,225.28,293.547,225.28z M293.547,348.16c-30.114,0-54.613-24.499-54.613-54.613s24.499-54.613,54.613-54.613    s54.613,24.499,54.613,54.613S323.661,348.16,293.547,348.16z"/>
<path d="M307.2,0H34.133c-3.773,0-6.827,3.057-6.827,6.827v232.146c0,11.271,9.187,20.441,20.48,20.441    c11.286,0,20.473-9.17,20.473-20.441V40.87h204.814v113.87c0,3.77,3.053,6.827,6.827,6.827s6.827-3.057,6.827-6.827V34.043    c0-3.77-3.053-6.827-6.827-6.827H61.433c-3.773,0-6.827,3.057-6.827,6.827v204.93c0,3.744-3.06,6.787-6.82,6.787    c-3.767,0-6.827-3.045-6.827-6.787V13.653h259.413v140.513c0,3.77,3.053,6.827,6.827,6.827s6.827-3.057,6.827-6.827V6.827    C314.027,3.057,310.973,0,307.2,0z"/>
<path d="M354.466,154.4c-1.053-2.55-3.546-4.214-6.306-4.214H238.933c-2.76,0-5.253,1.664-6.306,4.214    c-1.06,2.553-0.474,5.485,1.48,7.439l54.613,54.613c1.333,1.333,3.081,2,4.826,2s3.494-0.667,4.826-2l54.613-54.613    C354.939,159.887,355.526,156.954,354.466,154.4z M293.547,201.974l-38.134-38.134h76.267L293.547,201.974z"/>
`



    let defaultCode = `/*
This example of mapping function is forwarding incoming messages as they are (no transformation).
A 'configuration' attribute is also available as argument, but not used most of the times.
*/
return ({data, context}) =>{
    return {data, context}
}`


    /**
     * ## Persistent Data  🔧
     *
     * See class's attributes for the list of exposed properties.
     */
    @Schema({
        pack
    })
    export class PersistentData {

        /**
         * Javascript implementation of the map function
         */
        @Property({ 
            description: "Javascript implementation of the map function",
            type:'code' 
        })
        readonly implementation : string | CallableFunction

        /**
         * Resolve [[implementation]] to provide a callable function.
         * 
         * @returns the callable function
         */
        parsedImplementation(): CallableFunction{

            return typeof(this.implementation)==="string" 
                ? new Function(this.implementation)() 
                : this.implementation
        }

        constructor( { implementation } : {implementation?:string | CallableFunction } = {}) {
            this.implementation = implementation || defaultCode
        }
    }


    /** ## Module     *
     * 
     * See the global description [[ModuleMap | here]]
     */
    @Flux({
        pack: pack,
        namespace: ModuleMap,
        id: "ModuleMap",
        displayName: "Map",
        description: "A module that map incoming to outgoing messages using a custom function.",
        resources: {
            'technical doc': `${pack.urlCDN}/dist/docs/modules/lib_map_module.modulemap.html`
        }
    })
    @BuilderView({
        namespace: ModuleMap,
        icon: svgIcon
    })
    export class Module extends ModuleFlux {

        /**
         * Output of the module, emit the mapped message from the custom
         * [[PersistentData.implementation | implementation]].
         */
        output$ : Pipe<unknown>


        constructor( params ){
            super(params)

            this.addInput({
                id:`input`,
                description: 'Incoming messages are provided as argument to the mapping function and the returned object is emitted in the output',
                contract: freeContract(),
                onTriggered: ({data, configuration, context}, {cache}) => 
                    this.map(data, configuration, context, cache)
            })
            this.output$ = this.addOutput({id:"output"})
        }

        /**
         * 
         * @param data data part of the incoming message
         * @param configuration configuration part of the incoming message
         * @param context context part of the incoming message
         * @param cache cache store of the module
         */
         map( data: unknown, configuration: PersistentData, context: Context, cache: Cache){

            let mapFct = cache.getOrCreate(
                new ValueKey("implementation", configuration.implementation),
                () => configuration.parsedImplementation(),
                context
            )
            this.output$.next({
                data:  mapFct({data, configuration, context}), 
                context
            }) 
            context.terminate()
        }
    }
}