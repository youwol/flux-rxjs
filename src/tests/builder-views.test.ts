import { instantiateModules, ModuleConfiguration } from "@youwol/flux-core"
import { skip, take } from "rxjs/operators"
import { ModuleCombineLatest } from ".."
import { renderCombineBuilderView, renderFilterBuilderView } from "../lib/builder-views"
import { ModuleFilter } from "../lib/filter.module"



test('combine latest view with count #3', (done) => {

    let modules = instantiateModules({    
        latest :       [ModuleCombineLatest, {inputsCount:3}],
    })
    
    let view = renderCombineBuilderView(modules.latest, ModuleCombineLatest)
    expect(Array.from(view.querySelectorAll(".slot.input")).length).toEqual(3)
    expect(Array.from(view.querySelectorAll(".slot.output")).length).toEqual(1)

    ModuleCombineLatest['BuilderView'].notifier$.pipe(
        take(1)
    ).subscribe( 
        ({data, type}) => {
            expect(type).toEqual('configurationUpdated')
            expect(data.configuration.data.inputsCount).toEqual(4)
        }
    )
    ModuleCombineLatest['BuilderView'].notifier$.pipe(
        skip(1),
        take(1)
    ).subscribe( 
        ({data, type}) => {
            expect(type).toEqual('configurationUpdated')
            expect(data.configuration.data.inputsCount).toEqual(2)
            done()
        }
    )

    view.querySelector(".add-input").dispatchEvent(new MouseEvent('click'))
    view.querySelector(".remove-input").dispatchEvent(new MouseEvent('click'))
})

test('combine latest view with count #2 (no remove input btn)', () => {

    let modules = instantiateModules({    
        latest :       [ModuleCombineLatest, {inputsCount:2}],
    })
    
    let view = renderCombineBuilderView(modules.latest, ModuleCombineLatest)
    expect(Array.from(view.querySelectorAll(".slot.input")).length).toEqual(2)
    expect(Array.from(view.querySelectorAll(".slot.output")).length).toEqual(1)

    let btnRemove = view.querySelector(".remove-input")
    expect(btnRemove).toBeNull()
})


test('filter view', () => {
    
    let modules = instantiateModules({    
        filter :       ModuleFilter,
    })
    
    let view = renderFilterBuilderView(modules.filter, {iconContent:"<text class='test-icon'> test </text>"})
    
    expect( Array.from(view.querySelectorAll(".slot.input")).length).toEqual(1)
    expect( Array.from(view.querySelectorAll(".slot.output")).length).toEqual(1)
    expect(view.querySelector(".test-icon")).toBeDefined()
})

