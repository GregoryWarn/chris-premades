import {chris} from '../../../../helperFunctions.js';
import {queue} from '../../../../queue.js';
export async function awakenedSpellbook({speaker, actor, token, character, item, args, scope, workflow}) {
    if (workflow.targets.size === 0 || workflow.item.type != 'spell') return;
    let spellLevel = workflow.castData?.castLevel;
    if (!spellLevel) return;
    let oldDamageRoll = workflow.damageRoll;
    let oldFlavor = [];
    for (let i = 0; oldDamageRoll.terms.length > i; i++) {
        if (oldDamageRoll.terms[i].isDeterministic === false) {
            oldFlavor.push(oldDamageRoll.terms[i].flavor);
        }
    }
    let spells = workflow.actor.items.filter(i => (i.type === 'spell') && (i.system?.level === spellLevel) && (i.system?.damage?.parts?.length > 0));
    let values = [];
    for (let i = 0; spells.length > i; i++) {
        let currentItem = spells[i];
        for (let j = 0; currentItem.system.damage.parts.length > j; j++) {
                let flavor = currentItem.system.damage.parts[j][1];
                if (values.includes(flavor.toLowerCase()) === false && flavor != 'healing') values.push(flavor);
            }

    }
    if (values.length === 0) return;
    function valuesToOptions(arr){
        let optionsPush = [];
        for (let i = 0; arr.length > i; i++) {
            if (typeof arr[i] != 'string') return;
            let firstLetter = arr[i].charAt(0);
            let firstLetterCap = firstLetter.toUpperCase();
            let remainingLetters = arr[i].slice(1);
            let capitalizedWord = firstLetterCap + remainingLetters;
            optionsPush.push([capitalizedWord, arr[i]]);
        }
        return optionsPush;
    }
    let options = valuesToOptions(values);
    options.push(['No', false]);
    let selection = await chris.dialog('Change damage type for ' + workflow.item.name + '?', options);
    if (!selection) return;
    let queueSetup = await queue.setup(workflow.item.uuid, 'awakenedSpellbook', 101);
    if (!queueSetup) return;
    let damageFormula; 
    for (let i = 0; oldFlavor.length > i; i++) {
        damageFormula = workflow.damageRoll._formula.replace(oldFlavor[i], selection);
    }
    let damageRoll = await new Roll(damageFormula).roll({async: true});
    await workflow.setDamageRoll(damageRoll);
    queue.remove(workflow.item.uuid);
}