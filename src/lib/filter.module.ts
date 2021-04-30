import { freeContract, BuilderView, Flux, Property, ModuleFlux, 
    Pipe, Cache, Schema, Context, ValueKey } from '@youwol/flux-core'
import { renderFilterBuilderView } from './builder-views'

import{pack} from './main'

/**
  ## Presentation

This module filter the messages from input to output given a provided javascript function implementation.

Each time a message reach one input the provided filter function is called using this input message.
If the evaluation returns **true** the message is **propagated**, if the evaluation returns **false**,
the input is **not propagated**.

 ## Resources

 Various resources:
 -    [rxjs filter](https://rxjs-dev.firebaseapp.com/api/operators/filter):
 RxJs documentation for filter operator
 */
export namespace ModuleFilter{

    let defaultCode = `/*
This example of filter function always 'pass', you can change the implementation and return 'false'
when you don't want some messages not to be propagated.
A 'configuration' attribute is also available as argument, but not used most of the times.
*/
return ({data, context}) => true
`


    let svgIcon =  `<g xmlns="http://www.w3.org/2000/svg">
    <path d="m298,178.248h-59.517c-3.323-9.592-12.442-16.5-23.151-16.5-13.51,0-24.5,10.99-24.5,24.5 0,13.51 10.99,24.5 24.5,24.5 10.709,0 19.828-6.908 23.151-16.5h59.517v-16zm-74.168,8c0,4.687-3.814,8.5-8.5,8.5-4.687,0-8.5-3.813-8.5-8.5 0-4.686 3.813-8.5 8.5-8.5 4.686,0 8.5,3.813 8.5,8.5z"/>
    <path d="m171.014,87.252l-76.967,76.967c-3.238-1.582-6.873-2.472-10.713-2.472-10.709,0-19.828,6.908-23.151,16.5h-60.183v16h60.183c3.323,9.592 12.442,16.5 23.151,16.5 13.51,0 24.5-10.99 24.5-24.5 0-3.841-0.891-7.476-2.472-10.715l76.966-76.966-11.314-11.314zm-96.18,98.996c0-4.686 3.813-8.5 8.5-8.5s8.5,3.814 8.5,8.5c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.814-8.5-8.5z"/>
    </g>`

    /**
     * ## Persistent Data  🔧
     *
     * Only the number the javascript implementation is persisted for this module. 
     */
    @Schema({
        pack
    })
    export class PersistentData {

        /**
         * Javascript implementation of the filter function
         */
        @Property({ 
            description: "Javascript implementation of the filter function",
            type:'code' 
        })
        readonly implementation : string | CallableFunction

        parsedImplementation(): CallableFunction{
            return typeof(this.implementation)==="string" 
                ? new Function(this.implementation)() 
                : this.implementation
        }

        constructor( { implementation } : {implementation?:string | CallableFunction } = {}) {
            this.implementation = implementation || defaultCode
        }
    }


    /** ## Module
     *
     * 
     * See the global description [[ModuleFilter | here]]
     */
    @Flux({
        pack: pack,
        namespace: ModuleFilter,
        id: "ModuleFilter",
        displayName: "Filter",
        description: "A module that filter incoming message based on a provided function.",
        resources: {
            'technical doc': `${pack.urlCDN}/dist/docs/modules/lib_filter_module.modulefilter.html`
        }
    })
    @BuilderView({
        namespace: ModuleFilter,
        render :   (mdle) =>  renderFilterBuilderView( mdle ),
        icon: svgIcon
    })
    export class Module extends ModuleFlux {

        /**
         * Output of the module, emit an incoming message if the provided 
         * [[PersistentData.implementation | filter implementation]] returns true.
         */
        output$ : Pipe<unknown>


        constructor( params ){
            super(params)

            this.addInput({
                id:`input`,
                description: 'An incoming message will be propagated if the provided filter function returns true.',
                contract: freeContract(),
                onTriggered: ({data, configuration, context}, {cache}) => 
                    this.filter(data, configuration, context, cache)
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
        filter( data: unknown, configuration: PersistentData, context: Context, cache: Cache){

            let filterFct = cache.getOrCreate(
                new ValueKey("implementation", configuration.implementation),
                () => configuration.parsedImplementation(),
                context
            )
            if(filterFct({data, configuration, context})){
                this.output$.next({data, context}) 
                context.terminate()
            }
        }
    }
}