(function(app){
    'use strict';

    var Duck = app.Duck;

    app.game = {
        // free : [],
        // used : [],
        ducks : [],
        total : app.State.totalDucks,

        init: function() {
            app.$body.addClass('is-game-on');
            app.$cube.addClass('inactive');
            app.$gameArea.show();
            this.makeDucks();
            this.setScoreBoard();
            this.resetGame();
            if(app.$body.hasClass('is-paused')){
                app.$body.removeClass('is-paused');
            }
        },

        setScoreBoard: function(){
            app.$roundsNode.text('1');
            app.$kensShotNode.text('0');
            app.$shotsNode.text('0');
            app.$totalScore.text('0');
            app.$endMessage.text('');
        },

        makeDucks: function(){
            var totalDucks = this.total,
                totalInit  = this.total,
                frag       = document.createDocumentFragment(),
                duck       = null;

            while(totalDucks--) {
                duck = this.createDuck();

                this.ducks.push(duck);
                // this.free.push(duck);

                frag.appendChild(duck.el);
            }
            app.gameArea.appendChild(frag);

            while(totalInit--){
                this.launchDucks();
            }
        },

        createDuck: function() {
            var div  = document.createElement('div'),
                child = document.createElement('div'),
                duck = new Duck(div);

            div.setAttribute('class', 'duck');
            child.setAttribute('class', 'head');
            div.appendChild(child);

            return duck;
        },

        launchDucks: function(){
            var duck = this.ducks.shift();

            if (duck !== undefined){
                duck.init();
            } else {
                console.log('Allocated non duck');
                console.trace();
            }
        },

        duckComplete: function(){
            app.State.finishedDucks++;
            if(app.State.finishedDucks === app.State.totalDucks) {
                app.State.finishedDucks = 0;
                this.nextRound();
            }
        },

        updateRounds: function(){
            app.State.round++;
            app.$roundsNode.text(app.State.round);
        },

        nextRound: function(){
            if(app.State.round < 5) {
                this.makeDucks();
                this.updateRounds();
            } else {
                this.gameOver();
            }
        },

        gameOver: function(){
            app.State.isStarted = false;
            app.$replayScreen.addClass('is-active');
            app.$cube.removeClass('inactive');
            app.$body.addClass('is-paused');
            this.getEndMessage();
            // ga('send', 'event', 'category', 'action', 'label');
            ga('send', 'event', 'kenHunt', 'score', app.State.ducksKilled);
            ga('send', 'event', 'kenHunt', 'shots', app.State.shots);
            ga('send', 'event', 'kenHunt', 'ratio', (app.State.shots / app.State.ducksKilled));
        },

        getEndMessage: function(){
            var message;

            switch(true) {
                case app.State.ducksKilled === app.Constants.PERFECT_TOTAL && app.State.shots === app.Constants.PERFECT_TOTAL:
                    message = app.Constants.END_MESSAGES.TRULY_PERFECT;
                    break;
                case app.State.ducksKilled === app.Constants.PERFECT_TOTAL:
                    message = app.Constants.END_MESSAGES.PERFECT;
                    break;
                case app.State.ducksKilled >= app.Constants.WINNING_TOTAL:
                    message = app.Constants.END_MESSAGES.GREAT;
                    break;
                case app.State.ducksKilled >= app.Constants.LOSING_TOTAL:
                    message = app.Constants.END_MESSAGES.OK;
                    break;
                default:
                    message = app.Constants.END_MESSAGES.LOSE;
                    break;
            }
            this.displayMessage(message);
        },

        displayMessage: function(message){
            app.$endMessage.text(message);
        },

        resetGame: function(){
            app.State.totalDucks    = 2;
            app.State.finishedDucks = 0;
            app.State.shots         = 0;
            app.State.ducksKilled   = 0;
            app.State.round         = 1;
            app.State.score         = 0;

        },

        addPoints: function(){
            app.State.score += Math.floor(Math.random() * 100000);
            app.$totalScore.text(app.State.score);
        },

        onKillDuck: function(duck) {
            TweenLite.killTweensOf(duck.el);

            app.State.ducksKilled++;
            app.$kensShotNode.text(app.State.ducksKilled);
            duck.$el.addClass('is-shot').css('pointer-events', 'none');

            this.animateDeadDuck(duck.el);
        },

        animateDeadDuck: function(el){
            TweenLite.to(el, 1,{
                y               : '+=200',
                scale           : 0.2,
                onComplete      : this.removeDuck,
                onCompleteScope : el
            });
        },

        removeDuck: function(){
            var $el = $(this);

            $el.remove();
            app.game.duckComplete();
        }
    };

})((window.__scope__ || window).app);