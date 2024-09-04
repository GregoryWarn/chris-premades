import {genericUtils, itemUtils, tokenUtils} from '../../../../utils.js';

async function early({workflow}) {
    if (workflow.targets.size !== 1 || !workflow.token) return;
    if (tokenUtils.getLightLevel(workflow.token) !== 'dark') return;
    let targetToken = workflow.targets.first();
    let validModes = targetToken.detectionModes.map(i => i.id).filter(j => !['lightPerception', 'basicSight', 'hearing'].includes(j));
    if (tokenUtils.canSense(targetToken, workflow.token, validModes)) return;
    let originItem = itemUtils.getItemByIdentifier(workflow.actor, 'umbralSight');
    if (!originItem) return;
    workflow.advantage = true;
    workflow.attackAdvAttribution.add(genericUtils.translate('DND5E.Advantage') + ': ' + originItem.name);
}
async function earlyTarget({workflow}) {
    if (workflow.targets.size !== 1 || !workflow.token) return;
    let targetToken = workflow.targets.first();
    if (tokenUtils.getLightLevel(targetToken) !== 'dark') return;
    let validModes = workflow.token.detectionModes.map(i => i.id).filter(j => !['lightPerception', 'basicSight', 'hearing'].includes(j));
    if (tokenUtils.canSense(workflow.token, targetToken, validModes)) return;
    let originItem = itemUtils.getItemByIdentifier(targetToken.actor, 'umbralSight');
    if (!originItem) return;
    workflow.disadvantage = true;
    workflow.attackAdvAttribution.add(genericUtils.translate('DND5E.Disadvantage') + ': ' + originItem.name);
}
export let umbralSight = {
    name: 'Umbral Sight',
    version: '0.12.54',
    midi: {
        actor: [
            {
                pass: 'preambleComplete',
                macro: early,
                priority: 50
            },
            {
                pass: 'targetPreambleComplete',
                macro: earlyTarget,
                priority: 50
            }
        ]
    }
};