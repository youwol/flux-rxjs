import { freeContract, BuilderView, Flux, Property, ModuleFlux, 
    Pipe, Schema, Context, SideEffects } from '@youwol/flux-core'
import { Subject, Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { renderFilterBuilderView } from './builder-views'

import{pack} from './main'

/**
  ## Presentation

Re-emits incoming messages from the input only after a particular time span has passed without another incoming message.

 ## Resources

 Various resources:
 -    [rxjs debounceTime](https://rxjs-dev.firebaseapp.com/api/operators/debounceTime):
 RxJs documentation for debounceTime operator
 */
export namespace ModuleDebounceTime{

    let svgIcon = `<g xmlns="http://www.w3.org/2000/svg"><path d="m332 91.571v-30.571h30v-30h-90v30h30v30.571c-49.184 3.759-93.317 25.85-125.576 59.429h-116.424v29.99h92.746c-6.077 9.483-11.349 19.517-15.738 30.01h-107.008v29.99h97.251c-2.31 9.751-3.897 19.77-4.679 30.01h-122.572v30h122.571c.783 10.24 2.369 20.259 4.679 30h-97.25v30h107.008c4.388 10.493 9.661 20.527 15.738 30h-92.746v30h116.424c35.507 36.959 85.399 60 140.576 60 107.523 0 195-87.477 195-195 0-102.477-79.458-186.744-180-194.429zm149.311 209.429c-7.157 79.035-70.276 142.154-149.311 149.311v-29.311h-30v29.311c-79.035-7.157-142.154-70.276-149.311-149.311h29.311v-30h-29.311c7.157-79.035 70.276-142.154 149.311-149.311v29.311h30v-29.311c79.035 7.157 142.154 70.276 149.311 149.311h-29.311v30z"/><path d="m272 286c0 24.813 20.187 45 45 45 17.66 0 33.766-10.403 41.03-26.502l48.962-108.49-108.492 48.962c-16.098 7.266-26.5 23.371-26.5 41.03zm38.842-13.686 36.166-16.322-16.322 36.166c-2.424 5.371-7.796 8.842-13.686 8.842-8.271 0-15-6.729-15-15 0-5.89 3.471-11.262 8.842-13.686z"/></g>`

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
         * Debounce period in ms, 100ms as default.
         * 
         * Update at run time are discarded.
         */
         @Property({ 
            description: "Debounce period in ms",
            type: "duration",
            updatableRunTime: false
        })
        readonly period: number

        constructor( { period } : {period?:number } = {}) {
            this.period = period || 100
        }
    }


    /** ## Module
     *
     * 
     * See the global description [[ModuleFilter | here]]
     */
    @Flux({
        pack: pack,
        namespace: ModuleDebounceTime,
        id: "ModuleDebounceTime",
        displayName: "Debounce",
        description: "Re-emits incoming messages from the input only after a particular time span has passed without another incoming message.",
        resources: {
            'technical doc': `${pack.urlCDN}/dist/docs/modules/lib_debounce_time_module.moduledebouncetime.html`
        }
    })
    @BuilderView({
        namespace: ModuleDebounceTime,
        render :   (mdle) =>  renderFilterBuilderView( mdle ),
        icon: svgIcon
    })
    export class Module extends ModuleFlux implements SideEffects{

        /**
         * Output of the module, emit an incoming message if the provided 
         * [[PersistentData.implementation | filter implementation]] returns true.
         */
        output$ : Pipe<unknown>

        /**
        * Subscription of the inner debounced observable
        */
        private subscription: Subscription

        /**
         * Used to debounced incoming messages
         */
        private readonly debounced$ = new Subject<{data:unknown, context: Context}>()

        constructor( params ){
            super(params)

            this.addInput({
                id:`input`,
                description: 'Re-emits incoming messages from the input only after a particular time span has passed without another incoming message.',
                contract: freeContract(),
                onTriggered: ({data, context}) => 
                    this.debounced$.next({data,context})
            })
            this.output$ = this.addOutput({id:"output"})
        }


        apply(){
            let period = this.getPersistentData<PersistentData>().period
            this.subscription = this.debounced$.pipe(
                debounceTime(period)
            ).subscribe( ({data,context}) => {
                this.output$.next({data,context}) 
                context.terminate()
            })
        }
        /**
         * Unsubscribe the [[subscription | inner rxjs.debounced]]
         */
         dispose(){
            this.subscription.unsubscribe()
        }
    }
}