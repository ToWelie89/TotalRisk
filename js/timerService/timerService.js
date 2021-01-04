class TimerService {
    constructor(soundService) {
        this.soundService = soundService;
    }

    startFlashingTimerWarning() {
        document.querySelector('#multiplayerViewCurrentTurnTimerContainer').style.animationName = 'hourglassWarning';
    };
    
    clearHourglass() {
        document.querySelector('#multiplayerViewCurrentTurnTimerContainer').style.animation = '';
    
        document.querySelector('#topGlassSand').style.animation = '';
        document.querySelector('#bottomGlassSand').style.animation = '';
        document.querySelector('#middleSand').style.animation = '';
    
        document.querySelector('#topGlassSand').style.animationDuration = '';
        document.querySelector('#bottomGlassSand').style.animationDuration = '';
        document.querySelector('#middleSand').style.animationDuration = '';
    
        document.querySelector('#middleSand').style.visibility = 'hidden';
        document.querySelector('#bottomGlassSand').style.visibility = 'hidden';
    };
    
    startTimer(time, callback) {
        setTimeout(() => {
            this.clearHourglass();
            const middleAnimationTime = time / 10;
            const sandAnimationTime = time - middleAnimationTime;
            document.querySelector('#middleSand').style.animationDelay = `${sandAnimationTime - (0.04 * sandAnimationTime)}s`;
            document.querySelector('#middleSand').style.animationDuration = `${middleAnimationTime}s`;
            document.querySelector('#bottomGlassSand').style.animationDuration = `${sandAnimationTime}s`;
            document.querySelector('#topGlassSand').style.animationDuration = `${sandAnimationTime}s`;
            // START ANIMATION
            document.querySelector('#middleSand').style.visibility = 'visible';
            document.querySelector('#bottomGlassSand').style.visibility = 'visible';
            document.querySelector('#topGlassSand').style.animationName = 'topGlassAnimate';
            document.querySelector('#bottomGlassSand').style.animationName = 'bottomGlassAnimate';
            document.querySelector('#middleSand').style.animationName = 'middleGlassAnimate';
            callback();
        }, 10);
    };
}

module.exports = TimerService;