import {genericUtils} from '../../utils.js';

async function defaultPre(token) {
    await new Sequence()
        .effect()
        .file('jb2a.cast_generic.02.blue.0')
        .atLocation(token)
        .scaleToObject(2)
        .belowTokens()
        .playbackRate(0.9)
        .waitUntilFinished(-200)
        .play();
}
async function defaultPost(token) {
    await new Sequence()
        .effect()
        .delay(100)
        .file('jb2a.impact.011.blue')
        .atLocation(token, {cacheLocation: false})
        .scaleToObject(2)
        .waitUntilFinished()
        .play();
}
async function mistyStepPre(token) {
    await new Sequence()
        .effect()
        .file('jb2a.misty_step.01.blue')
        .atLocation(token)
        .scaleToObject(1.5)
        .belowTokens()
        .animation()
        .delay(300)
        .on(token)
        .opacity(0)
        .fadeIn(500)
        .waitUntilFinished()
        .play();
}
async function mistyStepPost(token) {
    /* eslint-disable indent */
    await new Sequence()
        .effect()
            .delay(100)
            .file('jb2a.misty_step.02.blue')
            .atLocation(token, {cacheLocation: false})
            .scaleToObject(1.5)
            .belowTokens()
        .animation()
            .delay(300)
            .on(token)
            .opacity(1)
            .fadeIn(500)
        .play();
}
async function vortexWarpPre(token) {
    //Animations by: eskiemoh
    /* eslint-disable indent */
    await new Sequence()
        .effect()
            .from(token)
            .duration(1500)
            .scaleOut(0, 500, {ease: 'easeInOutElastic'})
            .rotateOut(180, 300, {ease: 'easeOutCubic'})
            .animateProperty('sprite', 'position.y', {from: 0 , to: -0.25, gridUnits: true, duration: 100, delay: 1000})
            .animateProperty('sprite', 'position.y', {from: -0.25 , to: 0, gridUnits: true, duration: 100, delay: 1100})
        .animation()
            .delay(100)
            .on(token)
            .opacity(0)
        .effect()
            .file('jb2a.particles.outward.white.01.02')
            .scaleIn(0, 500, {ease: 'easeOutQuint'})
            .delay(1000)
            .fadeOut(1000)
            .atLocation(token)
            .duration(1000)
            .size(1.35, {gridUnits: true})
            .animateProperty('spriteContainer', 'position.y', {from:0 , to: -0.5, gridUnits: true, duration: 1000})
            .zIndex(1)
        .effect()
            .file('jb2a.portals.horizontal.vortex.purple')
            .atLocation(token)
            .scaleToObject(0.5)
            .rotateIn(-360, 500, {ease: 'easeOutCubic'})
            .rotateOut(360, 500, {ease: 'easeOutCubic'})
            .scaleIn(0, 600, {ease: 'easeInOutCirc'})
            .scaleOut(0, 600, {ease: 'easeOutCubic'})
            .opacity(1)
            .duration(1500)
            .belowTokens()
            .zIndex(0)
        .effect()
            .file('jb2a.extras.tmfx.outflow.circle.04')
            .atLocation(token)
            .scaleToObject(2.5)
            .rotateIn(-360, 500, {ease: 'easeOutCubic'})
            .rotateOut(360, 500, {ease: 'easeOutCubic'})
            .scaleIn(0, 600, {ease: 'easeInOutCirc'})
            .scaleOut(0, 600, {ease: 'easeOutCubic'})
            .fadeOut(1000)
            .opacity(0.2)
            .belowTokens()
            .zIndex(0)
        .effect()
            .file('jb2a.template_circle.vortex.intro.purple')
            .atLocation(token)
            .scaleToObject(1.9)
            .rotateIn(-360, 500, {ease: 'easeOutCubic'})
            .rotateOut(360, 500, {ease: 'easeOutCubic'})
            .scaleIn(0, 600, {ease: 'easeInOutCirc'})
            .scaleOut(0, 600, {ease: 'easeOutCubic'})
            .opacity(1)
            .belowTokens()
            .zIndex(1)
            .waitUntilFinished()
        .play();
}
async function vortextWarpPost(token) {
    await genericUtils.sleep(200);
    await new Sequence()
        .effect()
            .file('jb2a.portals.horizontal.vortex.purple')
            .atLocation(token)
            .scaleToObject(0.5)
            .rotateIn(-360, 500, {ease: 'easeOutCubic'})
            .rotateOut(360, 500, {ease: 'easeOutCubic'})
            .scaleIn(0, 600, {ease: 'easeInOutCirc'})
            .scaleOut(0, 600, {ease: 'easeOutCubic'})
            .opacity(1)
            .duration(1500)
            .belowTokens()
            .zIndex(0)
        .effect()
            .file('jb2a.template_circle.vortex.outro.purple')
            .atLocation(token)
            .scaleToObject(1.9)
            .rotateIn(-360, 500, {ease: 'easeOutCubic'})
            .rotateOut(360, 500, {ease: 'easeOutCubic'})
            .scaleIn(0, 500, {ease: 'easeInOutCirc'})
            .scaleOut(0, 500, {ease: 'easeOutCubic'})
            .opacity(1)
            .belowTokens()
            .zIndex(1)
        .effect()
            .file('jb2a.extras.tmfx.outflow.circle.04')
            .atLocation(token)
            .scaleToObject(2.5)
            .rotateIn(-360, 500, {ease: 'easeOutCubic'})
            .rotateOut(360, 500, {ease: 'easeOutCubic'})
            .scaleIn(0, 500, {ease: 'easeInOutCirc'})
            .scaleOut(0, 500, {ease: 'easeOutCubic'})
            .opacity(0.2)
            .fadeOut(1000)
            .belowTokens()
            .zIndex(0)
        .effect()
            .file('jb2a.particles.outward.white.01.02')
            .delay(250)
            .scaleIn(0, 500, {ease: 'easeOutQuint'})
            .fadeOut(1000)
            .atLocation(token)
            .duration(1000)
            .size(1.35, {gridUnits: true})
            .animateProperty('spriteContainer', 'position.y', {from: 0 , to: -0.5, gridUnits: true, duration: 1000})
            .zIndex(1)
        .effect()
            .from(token)
            .delay(250)
            .atLocation(token)
            .duration(1500)
            .scaleIn({x: 0.2, y: 0 }, 1000, {ease: 'easeOutElastic'})
            .rotateIn(360, 500, {ease: 'easeOutCubic'})
            .animateProperty('spriteContainer', 'position.y', {from: 0 , to: -0.5, gridUnits: true, duration: 200})
            .animateProperty('spriteContainer', 'position.y', {from: -0.5 , to: 0, gridUnits: true, duration: 200, delay: 200})
            .waitUntilFinished(-200)
        .animation()
            .on(token)
            .opacity(1)
        .play();
    /* eslint-enable indent */
}
export let teleportEffects = {
    default: {
        pre: defaultPre,
        post: defaultPost
    },
    mistyStep: {
        pre: mistyStepPre,
        post: mistyStepPost
    },
    vortexWarp: {
        pre: vortexWarpPre,
        post: vortextWarpPost
    }
};