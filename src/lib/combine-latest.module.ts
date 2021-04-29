import { Context, freeContract, BuilderView, Flux, Property, RenderView, Schema, ModuleFlux, 
    Pipe, SideEffects
} from '@youwol/flux-core'
import { attr$, render } from "@youwol/flux-view"
import { combineLatest, Subject, Subscription } from 'rxjs'
import { renderCombineBuilderView } from './builder-views'

import{pack} from './main'

/**
  ## Presentation

This module combines the latest values seen by its multiple inputs.

Each time a data reach one input, this value is combined with the latest value seen
by all the other inputs. The combined values are send in the module's output as array.

The order of the element in the array match the order of the inputs.

 ## Resources

 Various resources:
 -    [rxjs combine-latest](https://rxjs-dev.firebaseapp.com/api/index/function/combineLatest):
 RxJs documentation for combine latest
 */
export namespace ModuleCombineLatest{

    let svgIcon =  `<path xmlns="http://www.w3.org/2000/svg" d="M453.948,280.421h-20.501v20.088c0,13.785-11.215,25-25,25h-5.953c-2.039,5.51-7.329,9.441-13.546,9.441   c-7.98,0-14.45-6.471-14.45-14.451s6.47-14.449,14.45-14.449c6.225,0,11.521,3.939,13.555,9.459h5.944c8.271,0,15-6.729,15-15   v-20.088h-20.951c-2.037,5.513-7.327,9.448-13.547,9.448c-7.98,0-14.45-6.47-14.45-14.45s6.47-14.45,14.45-14.45   c6.222,0,11.515,3.938,13.551,9.452h20.948v-20.09c0-8.271-6.729-15-15-15h-5.95c-2.036,5.515-7.327,9.452-13.549,9.452   c-7.98,0-14.45-6.47-14.45-14.45s6.47-14.45,14.45-14.45c6.222,0,11.521,3.934,13.557,9.448h5.942c13.785,0,25,11.215,25,25v20.09   h20.501v-15.787c0-1.89,1.065-3.618,2.753-4.467c1.688-0.85,3.711-0.674,5.227,0.452l28,20.785c1.271,0.943,2.02,2.432,2.02,4.015   s-0.748,3.071-2.02,4.015l-27.999,20.785c-0.879,0.652-1.927,0.986-2.981,0.986c-0.766,0-1.535-0.176-2.246-0.533   c-1.688-0.85-2.753-2.578-2.753-4.467V280.421z"/>`


    /**
     * ## Persistent Data  🔧
     *
     * Only the number of inputs is persisted for this module. 
     * Although part of the configuration, this parameter can not be changed at run time using adaptor.
     */
    @Schema({
        pack
    })
    export class PersistentData {

        /**
         * Number of inputs of the module, default to 2.
         * 
         * Can not be changed at run time.
         */
        @Property({ description: "number of inputs" })
        readonly inputsCount : number

        constructor( { inputsCount } : { inputsCount?:number } = {} ) {
            this.inputsCount = inputsCount || 2 
        }
    }


    /** ## Module
     *
     * The module's definition:
     * -    the logic is defined in [[do]]
     * -    the view in the *builder-panel* is defined using the decorator
     * [@BuilderView](/api/assets-gateway/raw/package/QHlvdXdvbC9mbHV4LWNvcmU=/latest/dist/docs/modules/lib_models_decorators.html#builderview)
     * -    the view in the *rendering-panel* is defined using the decorator
     * [@RenderView](/api/assets-gateway/raw/package/QHlvdXdvbC9mbHV4LWNvcmU=/latest/dist/docs/modules/lib_models_decorators.html#renderview)
     *
     * Module needs to derive from [ModuleFlux](/api/assets-gateway/raw/package/QHlvdXdvbC9mbHV4LWNvcmU=/latest/dist/docs/classes/core_concepts.moduleflux.html)
     */
    @Flux({
        pack: pack,
        namespace: ModuleCombineLatest,
        id: "ModuleCombineLatest",
        displayName: "Latest",
        description: "A module that combine the latest values seen by its output",
        resources: {
            'technical doc': `${pack.urlCDN}/dist/docs/modules/lib_combine_latest_module.modulecombinelatest.html`
        }
    })
    @BuilderView({
        namespace: ModuleCombineLatest,
        render :        (mdle) => renderCombineBuilderView( mdle , ModuleCombineLatest),
        icon: svgIcon
    })
    export class Module extends ModuleFlux implements SideEffects{

        /**
         * Output of the module, emit the latest values seen by the inputs each time
         * one data reach an input.
         *
         * Ordering of the output's array match the ordering of the inputs.
         */
        combined$ : Pipe<Array<unknown>>

        /**
         * Each one of the RxJs.Subject element of this array emit a data when the associated input of the module 
         * receives one.
         */
        public readonly inputs$ = new Array<Subject<unknown>>()

        /**
         * Subscription of the inner rxjs.combineLatest
         */
        private subscription: Subscription

        constructor( params ){
            super(params)

            let persistentData = this.getPersistentData<PersistentData>()

            for(let i =0 ; i<persistentData.inputsCount; i++){
                let subject = new Subject<any>()
                this.inputs$.push(subject)
                this.addInput({
                    id:`input_${i}`,
                    description: 'An incoming data will be combine with the latest data seen by the other inputs and the result sent to the output.',
                    contract: freeContract(),
                    onTriggered: ({data, configuration, context}) => 
                        subject.next({data, configuration, context})
                })
            }
            this.combined$ = this.addOutput({id:"combined$"})
        }

        /**
         * Subscribe the [[subscription | inner rxjs.combineLatest]]
         */
        apply(){
            this.subscription = combineLatest(this.inputs$)
            .subscribe( (d: Array<{data,context}>) => {
                let out = { 
                    data: d.map( e => e.data),
                    configuration:{}, 
                    context: d.reduce( (acc:any,e)=> { Object.assign(acc.context,e.context); return acc} , {context:{}}).context
                }
                this.combined$.next(out)
            })
        }
        /**
         * Unsubscribe the [[subscription | inner rxjs.combineLatest]]
         */
        dispose(){
            this.subscription.unsubscribe()
        }
    }
}