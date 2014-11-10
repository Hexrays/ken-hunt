(function(app){
    'use strict';

    app.Duck = function(el) {
        this.el  = el;
        this.$el = $(el);
    };

    app.Duck.prototype = {
        el         : null,
        $el        : null,
        direction  : null,
        gameHeight : null,
        gameWidth  : null,

        init: function(){
            // Duck Starter Values
            this.direction = (Math.random() * 2) > 1 ? 'left' : 'right';

            this.el.style.visibility = 'visible';
            this.el.duck             = this;
            // The lifespan of the baloon should be between 5 and 10 seconds
            this.duration            = (Math.random() * (8 - 4)) + 4;
            // This takes a random chunk of the balloon's lifetime to use for delays
            // and tweening the 'x' position.
            this.partialDuration     = 0.3 + Math.random() * 0.3;
            // 156px is the height of the "duck" image
            this.gameHeight          = app.$gameArea.height() - 125;
            this.gameWidth           = app.$gameArea.width();

            this.start = {
                yMin : 0,
                yMax : 0,
                xMin : this.direction === 'left' ? -106 : this.gameWidth + 106,
                xMax : this.direction === 'left' ? -106 : this.gameWidth + 106
            };
            this.mid = {
                yMin : 50,
                yMax : this.gameHeight,
                xMin : this.direction === 'left' ? this.gameWidth * 0.4 : this.gameWidth * 0.6,
                xMax : this.direction === 'left' ? this.gameWidth * 0.6 : this.gameWidth * 0.4,
            };
            this.end = {
                yMin       : -100,
                yMax       : this.gameHeight,
                xMin       : this.direction === 'left' ? this.gameWidth + 106 :  -106,
                xMax       : this.direction === 'left' ? this.gameWidth + 106 :  -106
            };

            this.spawn();
        },

        spawn : function(){
            var partial         = (this.duration + 1) * this.partialDuration,
                delay           = (3 * Math.random() ) + 1;

            // Set the starting values
            TweenLite.set(this.el, {
                y          : this.range(this.start, 'y'),
                x          : this.range(this.start, 'x')
            });

            this.$el.css('pointer-events', 'auto');

            // the x tween should be continuout and smooth the whole duration
            TweenLite.to(this.el, this.duration, {
                delay : delay,
                x     : this.range(this.end, 'x'),
                ease  : Linear.easeNone
            });

            // now tween the y independently so that it looks more randomized
            TweenLite.to(this.el, partial, {
                delay : delay,
                y     : this.range(this.mid, 'y'),
                ease  : Power1.easeOut
            });

            TweenLite.to(this.el, this.duration - partial, {
                delay            : partial + delay,
                y                : this.range(this.end, 'y'),
                ease             : Power1.easeOut,
                onComplete       : this.removeElement,
                onCompleteScope  : this
            });
        },

        range : function(map, prop) {
            var min = map[prop + 'Min'],
                max = map[prop + 'Max'];

            return min + (max - min) * Math.random();
        },

        removeElement : function() {
            // BalloonPool.release(this);
            this.$el.remove();
            app.game.duckComplete();
            app.State.missed++;
        },

        reset : function() {

        }
    };
})((window.__scope__ || window).app);
