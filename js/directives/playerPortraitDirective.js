import { loadSvgIntoDiv } from './../helpers';

export default class PlayerPortraitDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            avatar: '&avatar'
        }
    }

    link(scope, elem, attr) {
        scope.$watch(scope.avatar, (newVal, oldVal) => {
            setPortrait();
        });

        const setPortrait = () => {
            var portraitBox = elem[0];
            var avatar = scope.avatar();
            var id = portraitBox.id;

            console.log('SET AVATAR', avatar);

            if (avatar.customCharacter) {
                portraitBox.style.backgroundImage = '';

                loadSvgIntoDiv('assets/avatarSvg/custom.svg', `#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom`, () => {
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="hat"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="head"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="eyes"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="eyebrows"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="nose"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="mouth"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="torso"] > g`).css('visibility', 'hidden');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="legs"] > g`).css('visibility', 'hidden');

                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="hat"] > g[name="${avatar.hat}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="head"] > g[name="${avatar.head}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="eyebrows"] > g[name="${avatar.eyebrows}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="eyes"] > g[name="${avatar.eyes}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="nose"] > g[name="${avatar.nose}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="mouth"] > g[name="${avatar.mouth}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="torso"] > g[name="${avatar.torso}"]`).css('visibility', 'visible');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg g[category="legs"] > g[name="${avatar.legs}"]`).css('visibility', 'visible');

                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svgCustom svg .skinTone`).css('fill', avatar.skinTone);
                });
            } else if (avatar.svg) {
                portraitBox.style.backgroundImage = '';
                loadSvgIntoDiv(avatar.svg, `#${id} .setupBoxAvatarsContainer__item__portrait__svg`, () => {
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svg svg`).css('width', avatar.svgWidth ? avatar.svgWidth : '100%');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svg svg`).css('height', avatar.svgHeight ? avatar.svgHeight : '100%');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svg svg`).css('margin-left', avatar.svgMarginLeft ? avatar.svgMarginLeft : '0px');
                    $(`#${id} .setupBoxAvatarsContainer__item__portrait__svg svg`).css('margin-top', avatar.svgMarginTop ? avatar.svgMarginTop : '0px');
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
