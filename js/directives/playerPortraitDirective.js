const { loadSvgIntoDiv, objectsAreEqual } = require('./../helpers');

class PlayerPortraitDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            avatar: '&avatar',
            target: '&target',
            small: '&small',
            loading: '&loading'
        }
    }

    link(scope, elem, attr) {
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
            if (target) {
                target = `#${target.value}`;
            }
            var id = portraitBox.id;

            if (!avatar) {
                return;
            }

            if (avatar && avatar.customCharacter) {
                portraitBox.style.backgroundImage = '';

                const targetSelector = target ? target : `#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom`;

                if (loading) {
                    $(`#${loading.value}`).show();
                    $(`${targetSelector}`).hide();
                }

                loadSvgIntoDiv('assets/avatarSvg/custom.svg', targetSelector, () => {
                    $(`${targetSelector} svg g[category="hat"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="head"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="eyes"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="eyebrows"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="nose"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="mouth"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="torso"] > g`).css('visibility', 'hidden');
                    $(`${targetSelector} svg g[category="legs"] > g`).css('visibility', 'hidden');

                    $(`${targetSelector} svg g[category="hat"] > g[name="${avatar.hat}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="head"] > g[name="${avatar.head}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="eyebrows"] > g[name="${avatar.eyebrows}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="eyes"] > g[name="${avatar.eyes}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="nose"] > g[name="${avatar.nose}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="mouth"] > g[name="${avatar.mouth}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="torso"] > g[name="${avatar.torso}"]`).css('visibility', 'visible');
                    $(`${targetSelector} svg g[category="legs"] > g[name="${avatar.legs}"]`).css('visibility', 'visible');

                    $(`${targetSelector} svg .skinTone`).css('fill', avatar.skinTone);

                    if (small) {
                        $(`${targetSelector} svg`).css('width', '207%');
                        $(`${targetSelector} svg`).css('margin-left', '-39px');
                        $(`${targetSelector} svg`).css('margin-top', '-40px');
                    }

                    if (loading) {
                        $(`#${loading.value}`).hide();
                        $(`${targetSelector}`).show();
                    }
                });
            } else if (avatar.svg) {
                if (loading) {
                    $(`#${loading.value}`).show();
                    $(`${targetSelector}`).hide();
                }
                portraitBox.style.backgroundImage = '';

                const targetSelector = target ? target : `#${id} .setupBoxAvatarsContainer__item__portrait__svg`;

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
                        $(`${targetSelector}`).show();
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
        }

        setTimeout(() => {
            setPortrait();
        }, 100);
    }
}

module.exports = PlayerPortraitDirective;