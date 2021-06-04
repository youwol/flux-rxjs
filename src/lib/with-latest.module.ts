
import { Subject, combineLatest } from 'rxjs';
import { renderCombineBuilderView } from './builder-views';
import { withLatestFrom } from 'rxjs/operators';
import { BuilderView, Flux, freeContract, ModuleFlux, Pipe, Property, Schema } from '@youwol/flux-core';
import { pack } from './main';


export namespace WithLatest {

    @Schema({
        pack: pack
    })
    export class PersistentData {
        
        @Property({ description: "number of inputs" })
        readonly nInputs : number


        @Property({ description: "input index of the trigger" })
        readonly triggerIndex : number


        constructor( { nInputs, triggerIndex } : { nInputs?:number, triggerIndex?:number } = {} ) {
            this.nInputs     = nInputs ??  2 
            this.triggerIndex = triggerIndex ?? 0 
        }
    }

    @Flux({
        pack:           pack,
        namespace:      WithLatest,
        id:             "WithLatest",
        displayName:    "WithLatest",
        description:    "Combine with latest "
    })
    @BuilderView({
        namespace:      WithLatest,
        render :        (mdle) => renderCombineBuilderView( mdle, WithLatest ),
        icon:           `<path xmlns="http://www.w3.org/2000/svg" d="M453.948,280.421h-20.501v20.088c0,13.785-11.215,25-25,25h-5.953c-2.039,5.51-7.329,9.441-13.546,9.441   c-7.98,0-14.45-6.471-14.45-14.451s6.47-14.449,14.45-14.449c6.225,0,11.521,3.939,13.555,9.459h5.944c8.271,0,15-6.729,15-15   v-20.088h-20.951c-2.037,5.513-7.327,9.448-13.547,9.448c-7.98,0-14.45-6.47-14.45-14.45s6.47-14.45,14.45-14.45   c6.222,0,11.515,3.938,13.551,9.452h20.948v-20.09c0-8.271-6.729-15-15-15h-5.95c-2.036,5.515-7.327,9.452-13.549,9.452   c-7.98,0-14.45-6.47-14.45-14.45s6.47-14.45,14.45-14.45c6.222,0,11.521,3.934,13.557,9.448h5.942c13.785,0,25,11.215,25,25v20.09   h20.501v-15.787c0-1.89,1.065-3.618,2.753-4.467c1.688-0.85,3.711-0.674,5.227,0.452l28,20.785c1.271,0.943,2.02,2.432,2.02,4.015   s-0.748,3.071-2.02,4.015l-27.999,20.785c-0.879,0.652-1.927,0.986-2.981,0.986c-0.766,0-1.535-0.176-2.246-0.533   c-1.688-0.85-2.753-2.578-2.753-4.467V280.421z"/>`
    })
    export class Module extends ModuleFlux {
        
        readonly latestFromInputs$ = new Array<any>()
        readonly masterInput$ = new Subject()
        readonly combined$ : Pipe<any>

        constructor(params){ 
            super(params)    
            
            let staticConf = this.getPersistentData<PersistentData>()
            let j = 0
            for(let i =0 ; i<staticConf.nInputs; i++){

                if( i == staticConf.triggerIndex ){
                    this.addInput({
                        id: "trigger",
                        contract: freeContract(),
                        onTriggered:  ({data, configuration, context}) =>{ this.masterInput$.next({data,context}) }
                    }) 
                }
                else{
                    let subject = new Subject<any>()
                    this.latestFromInputs$.push(subject)
                    this.addInput({
                        id: "input"+j,
                        contract: freeContract(),
                        onTriggered:  ({data, configuration, context}) =>{subject.next({data,context}) }
                    }) 
                    j++
                }
            }
            this.combined$ = this.addOutput( {id:"combined"} )

            let latestFrom$ = combineLatest(this.latestFromInputs$)
            this.masterInput$.pipe(
                withLatestFrom(latestFrom$)
            ).subscribe( ([first, second]:[any,any]) => {
                let out = { 
                    data: second.reduce( (acc,e)=> acc.concat(e.data) , []),
                    configuration:{}, 
                    context: second.reduce( (acc:any,e)=> { Object.assign(acc.context,e.context ? e.context : {}); return acc} , {context:first.context ? first.context : {}}).context
                }
                out.data.trigger = first
                this.combined$.next(out)
            })
        }

    }


}