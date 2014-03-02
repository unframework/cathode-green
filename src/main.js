
require.config({
    shim: {
        'stats': {
            exports: 'Stats'
        }
    }
});

require([ 'stats', './Input', './Bike' ], function (Stats, Input, Bike) {
    var stage = $('<div class="stage"></div>').appendTo('body'),
        wall = $('<div class="wall"></div>').appendTo(stage);

    var M_TO_PX = 16;

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }());

    var stats = new Stats();
    document.body.appendChild(stats.domElement);

    var input = new Input({
        32: 'BRAKE',
        38: 'FORWARD',
        40: 'BACKWARD'
    });

    var canvas = document.getElementById("box2dDebugDraw");
    var ctx = canvas.getContext("2d");
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    var world;

    var timer = {};

    function createTerrain(world, blockList) {
        var baseX = 20, baseY = 30;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = baseX;
        bodyDef.position.y = baseY;

        var body = world.CreateBody(bodyDef);

        var fixDef = new b2FixtureDef();
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.2;
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(20, 0.1);

        body.CreateFixture(fixDef);

        blockList.forEach(function (b) {
            fixDef.shape.SetAsOrientedBox(b[0], b[1], new b2Vec2(b[2], b[3]), b[4]);
            body.CreateFixture(fixDef);

            var box = $('<div class="terrainBlock"><div class="_body"></div></div>').appendTo(stage);
            box.css('width', b[0] * 2 * M_TO_PX + 'px');
            box.css('height', b[1] * 2 * M_TO_PX + 'px');
            box.css('transform', 'translate3d(' + (b[2] + baseX) * M_TO_PX + 'px,' + (b[3] + baseY) * M_TO_PX + 'px,0) rotate(' + b[4] + 'rad)');
        });
    }

    function init() {
        world = new b2World(new b2Vec2(0, 10), true);

        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(ctx);
        debugDraw.SetDrawScale(M_TO_PX);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        world.SetDebugDraw(debugDraw);

        createTerrain(world, [
            [ 2, 0.25, 5, -4.0, -1.0 ],
            [ 2, 0.25, 5.5, -7.0, -1.9 ],
            [ 4, 0.25, 1, -1.50, -0.4 ]
        ]);
        createBikeRenderer(new Bike(input, timer, world, 2, 25));
    }

    var lastTime = performance.now(),
        physicsStepAccumulator = 0,
        physicsStepDuration = 1 / 60.0;

    function update() {
        var time = performance.now(),
            elapsed = time - lastTime;

        lastTime = time;

        physicsStepAccumulator = Math.min(physicsStepDuration, physicsStepAccumulator + elapsed);

        if (physicsStepAccumulator < physicsStepDuration) {
            return;
        }

        physicsStepAccumulator = Math.max(0, physicsStepAccumulator - physicsStepDuration);

        world.Step(physicsStepDuration, 10, 10);
        $(timer).trigger('elapsed', [ physicsStepDuration ]);

        world.DrawDebugData();
        stats.update();

        requestAnimFrame(update);
    }

    init();
    requestAnimFrame(update);

    function createBikeRenderer(bike) {
        var w1 = $('<div class="bikeWheel"><div class="_body"></div></div>').appendTo(stage),
            w2 = $('<div class="bikeWheel"><div class="_body"></div></div>').appendTo(stage),
            body = $('<div class="bikeBody"><div class="_body"></div></div>').appendTo(stage);

        $(bike).on('moved', function () {
            w1.css('transform', 'translate3d(' + bike.w1x * M_TO_PX + 'px,' + bike.w1y * M_TO_PX + 'px,0) rotate(' + bike.w1a + 'rad)');
            w2.css('transform', 'translate3d(' + bike.w2x * M_TO_PX + 'px,' + bike.w2y * M_TO_PX + 'px,0) rotate(' + bike.w2a + 'rad)');
            body.css('transform', 'translate3d(' + bike.bx * M_TO_PX + 'px,' + bike.by * M_TO_PX + 'px,0) rotate(' + bike.ba + 'rad)');
        });
    }
});
