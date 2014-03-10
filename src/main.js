
require.config({
    paths: {
        text: '../bower_components/requirejs-text/text'
    },
    shim: {
        'stats': {
            exports: 'Stats'
        }
    }
});

require([ 'stats', './Input', './Timer', './Level', 'text!./map.txt' ], function (Stats, Input, Timer, Level, mapSource) {
    var timer = new Timer();

    var stats = new Stats();
    document.body.appendChild(stats.domElement);

    $(timer).on('elapsed', function (e, physicsStepDuration) {
        stats.update();
    });

    var input = new Input({
        32: 'BRAKE',
        38: 'FORWARD',
        40: 'BACKWARD'
    });

    var level = new Level(input, timer, mapSource);

    createLevelRenderer(level);

    function createLevelRenderer(level) {
        var stageWindow = $('<div class="stageWindow"></div>').appendTo('body'),
            stage = $('<div class="stage"></div>').appendTo(stageWindow),
            wall = $('<div class="wall"></div>').appendTo(stage);

        var M_TO_PX = 16;

        function positionOnStage(e, x, y, a) {
            e.css('transform', 'translate3d(' + x * M_TO_PX + 'px,' + y * M_TO_PX + 'px,100px) rotate(' + a + 'rad)');
        }

        createBikeRenderer(level.bike);

        level.map.trackerList.forEach(function (t) {
            createPlatformRenderer(t);
        });

        $(level).on('cameraMoved', function (e, physicsStepDuration) {
            // render new stage position
            stage.css('transform', 'translate3d(320px,240px,0) rotateX(-0.2rad) rotateY(0.4rad)  translate3d(' + (-level.cameraX * M_TO_PX) + 'px,' + level.cameraY * M_TO_PX + 'px, -100px) scale3d(1.2, -1.2, 1.2)');
        });

        function createBikeRenderer(bike) {
            var w1 = $('<div class="bikeWheel"><div class="_body"></div></div>').appendTo(stage),
                w2 = $('<div class="bikeWheel"><div class="_body"></div></div>').appendTo(stage),
                body = $('<div class="bikeBody"><div class="_body"></div></div>').appendTo(stage);

            $(bike).on('moved', function () {
                positionOnStage(w1, bike.w1x, bike.w1y, bike.w1a);
                positionOnStage(w2, bike.w2x, bike.w2y, bike.w2a);
                positionOnStage(body, bike.bx, bike.by, bike.ba);
            });
        }

        function createPlatformRenderer(p) {
            var body = $('<div class="platform"><div class="_body"></div></div>').appendTo(stage).css({
                width: (p.w * M_TO_PX) + 'px',
                height: (p.h * M_TO_PX) + 'px'
            }).find('._body').css({
                webkitTransform: 'translate3d(' + -(p.w * 0.5 - p.ox) * M_TO_PX + 'px,' + -(p.h * 0.5 - p.oy) * M_TO_PX + 'px,0)'
            }).end();

            positionOnStage(body, p.x, p.y, p.a);

            $(p).on('moved', function () {
                positionOnStage(body, p.x, p.y, p.a);
            });
        }
    }
});
