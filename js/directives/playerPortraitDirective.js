const { loadSvgIntoDiv, loadCustomCharacterSvgIntoDiv, objectsAreEqual, delay } = require('./../helpers');

class PlayerPortraitDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            avatar: '&avatar',
            target: '&target',
            small: '&small',
            loading: '&loading'
        };
    }

    link(scope, elem) {
        scope.$watch(scope.avatar, (newVal, oldVal) => {
            if (!objectsAreEqual(newVal, oldVal)) {
                setPortrait();
            }
        });

        const setPortrait = () => {
            var portraitBox = elem[0];
            var avatar = scope.avatar();
            var small = portraitBox.attributes.getNamedItem('small');
            var xsmall = portraitBox.attributes.getNamedItem('xsmall');
            var loading = portraitBox.attributes.getNamedItem('loading');
            var target = portraitBox.attributes.getNamedItem('target');
            var delayTime = portraitBox.attributes.getNamedItem('delay');
            if (target) {
                target = `#${target.value}`;
            }
            if (delayTime) {
                delayTime = Number(delayTime.value);
            }
            var id = portraitBox.id;

            if (!avatar) {
                return;
            }

            const f = () => {
                if (delayTime) {
                    return delay(delayTime);
                } else {
                    return Promise.resolve();
                }
            };

            f().then(() => {
                if (avatar && avatar.customCharacter) {
                    portraitBox.style.backgroundImage = '';
    
                    const targetSelector = target ? target : `#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom`;
    
                    if (loading) {
                        $(`#${loading.value}`).show();
                        $(`${targetSelector}`).css('opacity', '0');
                    }
    
                    loadCustomCharacterSvgIntoDiv('assets/avatarSvg/custom.svg', targetSelector, avatar, () => {    
                        if (small) {
                            $(`${targetSelector} svg`).css('width', '207%');
                            $(`${targetSelector} svg`).css('margin-left', '-39px');
                            $(`${targetSelector} svg`).css('margin-top', '-40px');
                        } else if (xsmall) {
                            $(`${targetSelector} svg`).css('width', '150%');
                            $(`${targetSelector} svg`).css('margin-left', '-20px');
                            $(`${targetSelector} svg`).css('margin-top', '-30px');
                        }
    
                        if (loading) {
                            $(`#${loading.value}`).hide();
                            setTimeout(() => {
                                $(`${targetSelector}`).animate({
                                    opacity: 1
                                }, 250);
                            }, 50);
                        }
                    });
                } else if (avatar.svg) {
                    const targetSelector = target ? target : `#${id} .setupBoxAvatarsContainer__item__portrait__svg`;
    
                    if (loading) {
                        $(`#${loading.value}`).show();
                        $(`${targetSelector}`).css('opacity', '0');
                    }
                    portraitBox.style.backgroundImage = '';
    
    
                    let attributes;
    
                    if (small) {
                        attributes = avatar.svgAttributesSmall;
                    } else if (xsmall) {
                        attributes = avatar.svgAttributesXsmall;
                    } else {
                        attributes = avatar.svgAttributesLarge;
                    }
    
                    loadSvgIntoDiv(avatar.svg, targetSelector, () => {
                        $(`${targetSelector} svg`).css('width', attributes && attributes.svgWidth ? attributes.svgWidth : '100%');
                        $(`${targetSelector} svg`).css('height', attributes && attributes.svgHeight ? attributes.svgHeight : '100%');
                        $(`${targetSelector} svg`).css('margin-left', attributes && attributes.svgMarginLeft ? attributes.svgMarginLeft : '0px');
                        $(`${targetSelector} svg`).css('margin-top', attributes && attributes.svgMarginTop ? attributes.svgMarginTop : '0px');
    
                        if (loading) {
                            $(`#${loading.value}`).hide();
                            setTimeout(() => {
                                $(`${targetSelector}`).animate({
                                    opacity: 1
                                }, 250);
                            }, 50);
                        }
                    }, 10);
                } else {
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svg svg`).remove();
                    var bgimg = `url(${avatar.picture})`;
    
                    $(document).ready(function() {
                        setTimeout(() => {
                            $(`#${id}`).css('background-image', bgimg);
                        }, 10);
                    });
                }
            });

        };

        setTimeout(() => {
            setPortrait();
        }, 100);
    }
}

module.exports = PlayerPortraitDirective;