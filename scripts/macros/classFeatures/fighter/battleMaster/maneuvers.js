import {actorUtils, compendiumUtils, constants, dialogUtils, effectUtils, errors, genericUtils, itemUtils, socketUtils, tokenUtils, workflowUtils} from '../../../../utils.js';

async function useBaitAndSwitch({workflow}) {
    if (workflow.targets.size !== 1) return;
    let targetToken = workflow.targets.first();
    if (targetToken.id === workflow.token.id || targetToken.document.disposition * workflow.token.document.disposition < 0) return;
    // TODO: Martial Adept, Superior Technique
    let superiorityDie = workflow.actor.system.scale?.['battle-master']?.['combat-superiority-die']?.die ?? 'd6';
    let superiorityRoll = await new Roll(superiorityDie + ' + @abilities.dex.mod', workflow.actor.getRollData()).evaluate();
    superiorityRoll.toMessage({
        rollType: 'roll',
        speaker: ChatMessage.implementation.getSpeaker({token: workflow.token}),
        flavor: workflow.item.name
    });
    let selection = await dialogUtils.buttonDialog(workflow.item.name, 'CHRISPREMADES.Macros.Maneuvers.BaitSwitchAC', [
        ['CHRISPREMADES.Generic.You', false],
        ['DND5E.Target', true]
    ]);
    if (!selection) selection = false;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        duration: {
            rounds: 1
        },
        changes: [
            {
                key: 'system.attributes.ac.bonus',
                mode: 2,
                value: superiorityRoll.total,
                priority: 20
            }
        ],
    };
    let sourceUpdate = {
        _id: workflow.token.document.id,
        x: targetToken.document.x,
        y: targetToken.document.y
    };
    let targetUpdate = {
        _id: targetToken.document.id,
        x: workflow.token.document.x,
        y: workflow.token.document.y
    };
    await genericUtils.updateEmbeddedDocuments(workflow.token.scene, 'Token', [sourceUpdate, targetUpdate]);
    await effectUtils.createEffect(selection ? targetToken.actor : workflow.actor, effectData);
}
async function useBrace({workflow}) {
    if (workflow.targets.size !== 1) return;
    let weapons = workflow.token.actor.items.filter(i => i.type === 'weapon' && i.system.equipped && i.system.actionType === 'mwak');
    if (!weapons.length) return;
    let selected;
    if (weapons.length === 1) {
        selected = weapons[0];
    } else {
        selected = await dialogUtils.selectDocumentDialog(workflow.item.name, 'CHRISPREMADES.Macros.Antagonize.SelectWeapon', weapons);
    }
    if (!selected) return;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        changes: [
            {
                key: 'system.bonuses.mwak.damage',
                mode: 2,
                value: '@scale.battle-master.combat-superiority-die',
                priority: 20
            }
        ]
    };
    let effect = await effectUtils.createEffect(workflow.actor, effectData);
    await workflowUtils.syntheticItemRoll(selected, [workflow.targets.first()]);
    if (effect) await genericUtils.remove(effect);
}
async function useCommandersStrike({workflow}) {
    let allies = workflow.token.scene.tokens.filter(i => i.disposition === workflow.token.document.disposition && i.id !== workflow.token.document.id && !actorUtils.hasUsedReaction(i.actor) && tokenUtils.canSense(i, workflow.token)).map(i => i.object);
    if (!allies.length) {
        genericUtils.notify('CHRISPREMADES.Macros.Maneuvers.NoNearby', 'info');
        return;
    }
    let selected;
    if (allies.length > 1) {
        selected = await dialogUtils.selectTargetDialog(workflow.item.name, 'CHRISPREMADES.Macros.Maneuvers.CommanderSelect', allies);
        if (!selected?.length || !selected[1]) return;
        selected = selected[0].document;
    }
    if (!selected) {
        selected = allies[0];
    }
    let willUse = await dialogUtils.confirm(workflow.item.name, 'CHRISPREMADES.Macros.Maneuvers.CommanderConfirm', {userId: socketUtils.firstOwner(selected, true)});
    if (!willUse) return;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        duration: {
            turns: 1
        },
        changes: [
            {
                key: 'system.bonuses.weapon.damage',
                mode: 2,
                value: workflow.actor.system.scale?.['battle-master']?.['combat-superiority-die'] ?? '1d8',
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: [
                    '1Attack'
                ]
            }
        }
    };
    await effectUtils.createEffect(selected.actor, effectData);
    await actorUtils.setReactionUsed(selected.actor);
}
async function useDistractingStrike({workflow}) {
    if (workflow.targets.size !== 1) return;
    let targetActor = workflow.targets.first()?.actor;
    if (!targetActor) return;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        duration: {
            rounds: 1
        },
        changes: [
            {
                key: 'flags.midi-qol.grants.advantage.attack.all',
                mode: 0,
                value: 'targetActorUuid !== "' + workflow.actor.uuid + '"',
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: [
                    'turnStartSource',
                    'isAttacked'
                ]
            }
        }
    };
    await effectUtils.createEffect(targetActor, effectData);
}
async function useGoadingAttack({workflow}) {
    if (!workflow.failedSaves.size) return;
    let targetActor = workflow.targets.first()?.actor;
    if (!targetActor) return;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        duration: {
            rounds: 1
        },
        changes: [
            {
                key: 'flags.midi-qol.disadvantage.attack.all',
                mode: 0,
                value: 'targetActorUuid !== "' + workflow.actor.uuid + '"',
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: [
                    'turnEndSource'
                ]
            }
        }
    };
    await effectUtils.createEffect(targetActor, effectData);
}
async function useGrapplingStrike({workflow}) {
    let target = workflow.targets.first();
    if (!target) return;
    let feature = itemUtils.getItemByIdentifier(workflow.actor, 'grapple');
    let featureData;
    if (!feature) {
        featureData = await compendiumUtils.getItemFromCompendium(constants.packs.actions, 'Grapple', {object: true, getDescription: true, translate: 'CHRISPREMADES.Macros.Actions.Grapple'});
        if (!featureData) {
            errors.missingPackItem();
            return;
        }
    } 
    let superiorityDie = workflow.actor.system.scale?.['battle-master']?.['combat-superiority-die']?.die ?? 'd6';
    let superiorityRoll = await new Roll(superiorityDie).evaluate();
    superiorityRoll.toMessage({
        rollType: 'roll',
        speaker: ChatMessage.implementation.getSpeaker({token: workflow.token}),
        flavor: workflow.item.name
    });
    let rollTotal = superiorityRoll.total;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        changes: [
            {
                key: 'system.skills.ath.bonuses.check',
                mode: 2,
                value: rollTotal,
                priority: 20
            }
        ],
        flags: {
            'chris-premades': {
                effect: {
                    noAnimation: true
                }
            }
        }
    };
    let effect = await effectUtils.createEffect(workflow.actor, effectData);
    if (feature) {
        await workflowUtils.syntheticItemRoll(feature, [target]);
    } else {
        await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [target]);
    }
    await genericUtils.remove(effect);
}
async function useManeuveringAttack({workflow}) {
}
async function useParry({workflow}) {
    // TODO: Martial Adept, Superior Technique
    let superiorityDie = workflow.actor.system.scale?.['battle-master']?.['combat-superiority-die']?.die ?? 'd6';
    let superiorityRoll = await new Roll(superiorityDie + ' + @abilities.dex.mod', workflow.actor.getRollData()).evaluate();
    superiorityRoll.toMessage({
        rollType: 'roll',
        speaker: ChatMessage.implementation.getSpeaker({token: workflow.token}),
        flavor: workflow.item.name
    });
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        duration: {
            turns: 1
        },
        changes: [
            {
                key: 'system.traits.dm.midi.all',
                mode: 2,
                value: '-' + superiorityRoll.total,
                priority: 20
            }
        ],
        flags: {
            dae: {
                specialDuration: [
                    '1Reaction'
                ]
            },
            'chris-premades': {
                effect: {
                    noAnimation: true
                }
            }
        }
    };
    await effectUtils.createEffect(workflow.actor, effectData);
}
async function usePushingAttack({workflow}) {
    let targetToken = workflow.targets.first();
    let targetActor = targetToken?.actor;
    if (!targetActor) return;
    if (actorUtils.getSize(targetActor) > 3) return;
    let featureData = await compendiumUtils.getItemFromCompendium(constants.featurePacks.classFeatureItems, 'Pushing Attack: Attack', {object: true, getDescription: true, translate: 'CHRISPREMADES.Macros.Maneuvers.Pushing', flatDC: itemUtils.getSaveDC(workflow.item)});
    if (!featureData) {
        errors.missingPackItem();
        return;
    }
    let pushWorkflow = await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [targetToken]);
    if (!pushWorkflow.failedSaves.size) return;
    let distance = await dialogUtils.buttonDialog(workflow.item.name, 'CHRISPREMADES.Macros.Maneuvers.PushDistance', [
        ['CHRISPREMADES.Distance.5', 5],
        ['CHRISPREMADES.Distance.10', 10],
        ['CHRISPREMADES.Distance.15', 15]
    ]);
    if (!distance) return;
    await tokenUtils.pushToken(workflow.token, targetToken, distance);
}
async function useSweepingAttack({workflow}) {
    if (!workflow.targets.size) return;
    let superiorityDie = workflow.actor.system.scale?.['battle-master']?.['combat-superiority-die']?.die ?? 'd6';
    let {currAttackRoll, currDamageType, currRange} = workflow.item.flags['chris-premades']?.sweepingAttack ?? {};
    if (!currAttackRoll) return;
    let featureData = await compendiumUtils.getItemFromCompendium(constants.featurePacks.classFeatureItems, 'Sweeping Attack: Attack', {object: true, getDescription: true, translate: 'CHRISPREMADES.Macros.Maneuvers.Sweeping', identifier: 'sweepingAttackAttack'});
    if (!featureData) {
        errors.missingPackItem();
        return;
    }
    featureData.system.damage.parts[0] = [superiorityDie, currDamageType];
    genericUtils.setProperty(featureData, 'flags.chris-premades.sweepingAttack.currAttackRoll', currAttackRoll);
    let nearbyTargets = tokenUtils.findNearby(workflow.targets.first(), 5, 'ally');
    let realNearbyTargets = tokenUtils.findNearby(workflow.token, currRange, 'enemy').filter(i => nearbyTargets.includes(i));
    if (!realNearbyTargets.length) return;
    let target;
    if (realNearbyTargets.length > 1) {
        target = await dialogUtils.selectTargetDialog(workflow.item.name, 'CHRISPREMADES.Macros.Maneuvers.SelectTarget', realNearbyTargets);
        if (!target?.length || !target[1]) return;
        target = target[0].document;
    }
    if (!target) {
        target = realNearbyTargets[0];
    }
    await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [target]);
}
async function sweepingAttackAttack({workflow}) {
    let currAttackRoll = workflow.item.flags['chris-premades']?.sweepingAttack?.currAttackRoll;
    if (!currAttackRoll) return;
    let replacementRoll = await new Roll(String(currAttackRoll)).evaluate();
    await workflow.setAttackRoll(replacementRoll);
}
async function useTripAttack({workflow}) {
    let targetToken = workflow.targets.first();
    let targetActor = targetToken?.actor;
    if (!targetActor) return;
    if (actorUtils.getSize(targetActor) > 3) return;
    let featureData = await compendiumUtils.getItemFromCompendium(constants.featurePacks.classFeatureItems, 'Trip Attack: Attack', {object: true, getDescription: true, translate: 'CHRISPREMADES.Macros.Maneuvers.Tripping', flatDC: itemUtils.getSaveDC(workflow.item)});
    if (!featureData) {
        errors.missingPackItem();
        return;
    }
    await workflowUtils.syntheticItemDataRoll(featureData, workflow.actor, [targetToken]);
}
export let maneuversAmbush = {
    name: 'Maneuvers: Ambush',
    version: '0.12.51'
};
export let maneuversBaitAndSwitch = {
    name: 'Maneuvers: Bait and Switch',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useBaitAndSwitch,
                priority: 50
            }
        ]
    }
};
export let maneuversBrace = {
    name: 'Maneuvers: Brace',
    version: '1.0.2',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useBrace,
                priority: 50
            }
        ]
    }
};
export let maneuversCommandersStrike = {
    name: 'Maneuvers: Commander\'s Strike',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useCommandersStrike,
                priority: 50
            }
        ]
    }
};
export let maneuversCommandingPresence = {
    name: 'Maneuvers: Commanding Presence',
    version: '0.12.43'
};
export let maneuversDisarmingAttack = {
    name: 'Maneuvers: Disarming Attack',
    version: '0.12.43'
};
export let maneuversDistractingStrike = {
    name: 'Maneuvers: Distracting Strike',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useDistractingStrike,
                priority: 50
            }
        ]
    }
};
export let maneuversEvasiveFootwork = {
    name: 'Maneuvers: Evasive Footwork',
    version: '0.12.43'
};
export let maneuversFeintingAttack = {
    name: 'Maneuvers: Feinting Attack',
    version: '0.12.43'
};
export let maneuversGoadingAttack = {
    name: 'Maneuvers: Goading Attack',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useGoadingAttack,
                priority: 50
            }
        ]
    }
};
export let maneuversGrapplingStrike = {
    name: 'Maneuvers: Grappling Strike',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useGrapplingStrike,
                priority: 50
            }
        ]
    }
};
export let maneuversLungingAttack = {
    name: 'Maneuvers: Lunging Attack',
    version: '0.12.43'
};
export let maneuversManeuveringAttack = {
    name: 'Maneuvers: Maneuvering Attack',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useManeuveringAttack,
                priority: 50
            }
        ]
    }
};
export let maneuversMenacingAttack = {
    name: 'Maneuvers: Menacing Attack',
    version: '0.12.43'
};
export let maneuversParry = {
    name: 'Maneuvers: Parry',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useParry,
                priority: 50
            }
        ]
    }
};
export let maneuversPrecisionAttack = {
    name: 'Maneuvers: Precision Attack',
    version: '0.12.43'
};
export let maneuversPushingAttack = {
    name: 'Maneuvers: Pushing Attack',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: usePushingAttack,
                priority: 50
            }
        ]
    }
};
export let maneuversQuickToss = {
    name: 'Maneuvers: Quick Toss',
    version: '0.12.43'
};
export let maneuversRally = {
    name: 'Maneuvers: Rally',
    version: '0.12.43'
};
export let maneuversRiposte = {
    name: 'Maneuvers: Riposte',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useBrace,
                priority: 50
            }
        ]
    }
};
export let maneuversSweepingAttack = {
    name: 'Maneuvers: Sweeping Attack',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useSweepingAttack,
                priority: 50
            }
        ]
    }
};
export let maneuversSweepingAttackAttack = {
    name: 'Sweeping Attack: Attack',
    version: maneuversSweepingAttack.version,
    midi: {
        item: [
            {
                pass: 'postAttackRoll',
                macro: sweepingAttackAttack,
                priority: 50
            }
        ]
    }
};
export let maneuversTacticalAssessment = {
    name: 'Maneuvers: Tactical Assessment',
    version: '0.12.43'
};
export let maneuversTripAttack = {
    name: 'Maneuvers: Trip Attack',
    version: '0.12.43',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: useTripAttack,
                priority: 50
            }
        ]
    }
};