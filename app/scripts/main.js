(function(scope){
    'use strict';

    var UA                  = navigator.userAgent,
        isDebug             = hex.url.has('debug'),
        isDev               = hex.url.has('dev'),
        isAutoPlay          = hex.url.has('autoplay'),
        isLocal             = /(localhost|127\.0\.0\.1|0\.0\.0\.0|\.(local|dev)|\.88)$/i.test(location.hostname),
        isIFrame            = window !== window.top,
        isIOS               = /ip(hone|od|ad)/i.test(UA),
        isSafari            = /(mac os x).*version\/\d(.\d)+ (mobile\/\w{5,} )?safari/i.test(UA),
        isSafari5           = /(mac os x).*version\/5[.\d]+ (mobile\/\w{5} )?safari/i.test(UA),
        isAndroid           = /android/i.test(UA),
        isAndroidBrowser    = isAndroid && !/chrome|firefox/i.test(UA),
        isAndroidBrowserOld = isAndroidBrowser && parseFloat(/android ([\d\.]+)/i.exec(UA).pop()) < 4.3,
        isAndroid2          = isAndroidBrowser && /android 2\.\d/i.test(UA),
        isAndroidChrome     = isAndroid && /chrome/i.test(UA),
        isKindleFire        = /KF[A-Z]{2,3}/.test(UA),
        isFirefox           = /firefox/i.test(UA),
        isIE                = /msie \d/i.test(UA),
        isMSTouch           = (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0),
        isMSTouchPrefix     = !!navigator.msMaxTouchPoints,
        isPhone             = (hex.url.has('phone')  || (/mobile/i.test(UA) && !/ipad|tablet/i.test(UA)) || matchMedia('only screen and (max-device-width : 767px)').matches) && !isKindleFire,
        isTablet            = hex.url.has('tablet') || (isAndroid && !isPhone) || (isIOS && !isPhone) || isKindleFire,
        isMobile            = hex.url.has('mobile') || isPhone || isTablet;

    var app = scope.app = {
        Flags : {
            /**
             *  Place useful runtime booleans here. Good for debugging and switching
             *  things on and off.
             */
            isDebug             : isDebug,
            isDev               : isDev,
            isAutoPlay          : isAutoPlay,
            isLocal             : isLocal,
            isIFrame            : isIFrame,
            isIOS               : isIOS,
            isSafari            : isSafari,
            isSafari5           : isSafari5,
            isAndroid           : isAndroid,
            isAndroidBrowser    : isAndroidBrowser,
            isAndroidBrowserOld : isAndroidBrowserOld,
            isAndroidChrome     : isAndroidChrome,
            isAndroid2          : isAndroid2,
            isKindleFire        : isKindleFire,
            isFirefox           : isFirefox,
            isIE                : isIE,
            isMSTouch           : isMSTouch,
            isPhone             : isPhone,
            isTablet            : isTablet,
            isMobile            : isMobile
        },

        Constants : {
            /**
             *  Place configurable values here, such as URLs, account IDs, timeout lengths
             *  Example:
             *  MAP_CONFIG : {
             *      MAPBOX_ID    : 'scenichudson.map-xyssjkut',
             *      CLOUDMADE_ID : 'BC9A493B41014CAABB98F0471D759707'
             *  },
             *
             *  Can use camelCase here because this is a config object being passed into a
             *  3rd party library
             *  PANZOOM_CONFIG : {
             *      disablePan: true,
             *      increment: 0.3,
             *      minScale: 0.5,
             *      maxScale: 4
             *  },
             */
            PERFECT_TOTAL: 10,
            WINNING_TOTAL: 7,
            LOSING_TOTAL: 3,
            ROUNDS: 5,

            END_MESSAGES: {
                TRULY_PERFECT: 'Truly Perfect!',
                PERFECT: 'Perfectish!',
                GREAT: 'Great job!',
                OK: 'You did ok.',
                LOSE: 'You suck.'
            }
        },

        Events : {
            // Place string event names for global events here.
            // Example:
            // PRELOAD_START     : 'preload:start',
            // PRELOAD_PROGRESS  : 'preload:progress',
            // PRELOAD_COMPLETE  : 'preload:complete',
            // MAP_SELECT_POINT  : 'map:selectpoint',
            // MAP_READY         : 'map:ready',
        },

        State : {
            isStarted     : false,
            isMuted       : false,
            firstPlay     : true,
            totalDucks    : 2,
            finishedDucks : 0,
            shots         : 0,
            ducksKilled   : 0,
            round         : 1,
            score         : 0
        },

        // REFERENCES/CONTAINERS
        // ====================================================================
        $window        : $(window),
        $document      : $(document),
        gameArea       : document.getElementById('game-area'),
        audio          : document.getElementById('theme'),
        shootSFX       : document.getElementById('audio-shoot'),
        $html          : $('html'),
        $body          : $('body'),
        $cube          : $('.cube-wrap'),
        $background    : $('.background'),
        $gameArea      : $('.game'),
        $muteBtn       : $('.mute-button'),
        $duck          : $('.duck'),
        $totalScore    : $('.total-score'),
        $roundsNode    : $('.round'),
        $shotsNode     : $('.shots-fired'),
        $kensShotNode  : $('.kens-shot'),
        $endMessage    : $('.end-message'),
        $titleScreen   : $('.title-screen-container'),
        $replayScreen  : $('.replay-screen-container'),
        buttonClickEvent: null,

        init: function(){
            _.bindAll(this,
                'onHitEnter',
                'onClickDuck',
                'startGame',
                'onShotFired',
                'onMuteBtnClick'
            );

            this.buttonClickEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

            this.shootSFX.volume = 0.4;

            if(this.Flags.isMobile) {
                this.changeTextForMobile();
                this.$body.addClass('is-mobile');
                // ga('send', 'event', 'load', 'mobile');
            }

            this.$body.on('keypress',                 this.onHitEnter)
                      .on(this.buttonClickEvent,    '.game',        this.onShotFired)
                      .on(this.buttonClickEvent,    '.duck',        this.onClickDuck)
                      .on(this.buttonClickEvent,    '.mute-button', this.onMuteBtnClick)
                      .on('touchstart',             '.cube-wrap',   this.startGame);
        },

        onHitEnter: function(e) {
            if(e.charCode === 13 || e.keyCode === 13 || e.key === 'Enter'){
                // start game
                if(!this.State.isStarted){
                    this.startGame();
                }
            }
        },

        onShotFired: function(){
            if(this.State.isStarted){
                this.State.shots++;
                this.$shotsNode.text(this.State.shots);
                if(!this.State.isMuted){
                    this.shootSFX.play();
                }
                // ga('send', 'event', 'category', 'action', 'label');
                // ga('send', 'event', 'kenHunt', 'shoot');
            }
        },

        onClickDuck: function(e){
            e.preventDefault();
            this.game.addPoints();
            this.game.onKillDuck(e.currentTarget.duck);
            // ga('send', 'event', 'kenHunt', 'shoot', 'duck');
        },

        startGame: function(){
            this.State.isStarted = true;
            console.log('Start');

            if (this.$replayScreen.hasClass('is-active')){
                this.$replayScreen.removeClass('is-active');
            }

            this.game.init();

            if(!this.State.isMuted){
                this.audio.play();
            }
            ga('send', 'event', 'kenHunt', 'start');
            if(!this.State.firstPlay) {
                ga('send', 'event', 'kenHunt', 'replay');
            }
            this.State.firstPlay = false;
        },

        onMuteBtnClick: function(){
            if(!this.$muteBtn.hasClass('is-muted')){
                this.audio.pause();
                this.$muteBtn.addClass('is-muted');
                this.State.isMuted = true;
                ga('send', 'event', 'kenHunt', 'mute');
            } else {
                this.audio.play();
                this.$muteBtn.removeClass('is-muted');
                this.State.isMuted = false;
                ga('send', 'event', 'kenHunt', 'unmute');
            }
        },

        changeTextForMobile: function(){
            $('.start').text('Tap the cube to play.');
            $('.restart').text('Tap the cube to play again.');
        }

    };

    // window.app = app;
    $(document).ready(function(){
        app.init();
    });
})(window.__scope__ || window);