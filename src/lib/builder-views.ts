import{ModuleConfiguration} from '@youwol/flux-core'


export function addSvgElements(d,g){
    d.forEach( data=>{
        let elemSvg = document.createElementNS("http://www.w3.org/2000/svg", data.type)
        if(data.id)
            elemSvg.id = data.id
        if(data.classes)
            elemSvg.classList.add(...data.classes)
        if(data.attributes)
            Object.entries(data.attributes).forEach(
                ([k,v]) => elemSvg.setAttribute(k,String(v))
            )        
        if(data.textContent)
            elemSvg.textContent = data.textContent
        if(data.onclick)
            elemSvg.onclick = data.onclick
        g.appendChild( elemSvg )
    })
 }

export function renderCombineBuilderView( mdle , Factory ){
        
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    
    let vMargin         = 10
    let vStep           = 50
    let width           = 70
    let outputs         = mdle.outputSlots    
    let height          = 2 * vMargin + Math.max(0 , mdle.inputSlots.length -1,  outputs.length -1 ) * vStep    
    let vStepInput      = (height - 2 * vMargin) / Math.max(0 , mdle.inputSlots.length - 1 ) 
    let headerHeight    = 25
    addSvgElements([{
        type:"rect",
        classes:["module","flow","content"],
        attributes: {height:height + headerHeight , width:width,x:-width/2,y:-height/2 -headerHeight/2, filter:"url(#shadow)"}
        }],g)
        
    if(mdle.configuration.title != "" )
        addSvgElements([
            {type:"path",
            classes:["module","mdle-color-fill","header"],
            attributes: {
                d:`M${-width/2},${-height/2 - headerHeight/6} v${-(headerHeight-10)} q0,-10 10,-10 h${width-20} q10,0 10,10  v${headerHeight-10} z`
            }},
            {type:"path",
            classes:["module","outline","header"],
            attributes: {
                d:`M${-width/2},${-height/2 - headerHeight/6} v${-(headerHeight-10)} q0,-10 10,-10 h${width-20} q10,0 10,10  v${headerHeight-10}`
            }},
            {type:"text",
            classes:["module","title","header"],
            attributes: {x:-width/2+10,y:-height/2-headerHeight/2},
            textContent: mdle.configuration.title
            },],g)
        
    mdle.inputSlots.forEach( (input,i) =>{
        let y = vMargin -height/2 + i*vStepInput
        let x0 = -width/2
        addSvgElements([{
            type:"path",
            id:`input-line_${input.slotId +"_"+ mdle.moduleId}`,
            classes:["mdle-color-stroke","plug","input",mdle.moduleId,"fill-none"],
            attributes: {
                d:`M${x0} ${y} C ${x0+30} ${y}, -30 0, ${width/2} 0`
            }
        },{ type:"circle",
            id:`input-slot_${input.slotId+"_"+ mdle.moduleId}`,
            classes:["slot","input",input.slotId,"mdle-color-fill"],
            attributes: {cx:x0, cy: y}
        }], g)
    })
    
    addSvgElements([{ 
        type:"circle",
        id:`output-slot_${outputs[0].slotId+"_"+ mdle.moduleId}`,
        classes:["mdle-color-fill","output","slot",outputs[0].slotId],
        attributes: {cx:width/2, cy: 0}
    }], g)

    function new_conf(n){
        return {
            command:"updateModule",
            module: mdle, 
            configuration : new ModuleConfiguration(
                {title:mdle.configuration.title,
                 description:mdle.configuration.description,
                 data: new Factory.PersistentData( {inputsCount:mdle.configuration.data.inputsCount + n} )} )
        }
    }

    addSvgElements([
        { type:"rect", classes:[], attributes: {height:15 , width:15,x:-width/2,y:height/2 + 20 },
            onclick : ()=> Factory["BuilderView"].notifier$.next({type:'configurationUpdated', data:new_conf(1)})},
        { type:"text", classes:["module","title","header"], attributes: {x:-width/2 + 4 ,y:height/2 + 12 + 20 , },textContent: '+'} ], g)
    if(mdle.inputSlots.length > 2)
        addSvgElements([{ 
                type:"rect", classes:[], attributes: {height:15 , width:15,x:-width/2 + 20,y:height/2 + 20 },
                onclick : ()=> Factory["BuilderView"].notifier$.next({type:'configurationUpdated', data:new_conf(-1)})                   
            },{ 
                type:"text", classes:["module","title","header"], attributes: {x:-width/2 + 4 + 20,y:height/2 + 12 + 20 , },
                textContent: '-'
            }], g)

    return g

}

