
require.config({
    shim: {
        'stats': {
            exports: 'Stats'
        }
    }
});

require([ 'stats', './Input', './Bike' ], function (Stats, Input, Bike) {
    var stageWindow = $('<div class="stageWindow"></div>').appendTo('body'),
        stage = $('<div class="stage"></div>').appendTo(stageWindow),
        wall = $('<div class="wall"></div>').appendTo(stage);

    var M_TO_PX = 16;

    var RADIUS = 300 / M_TO_PX,
        FULL_ARC_LENGTH = RADIUS * Math.PI;

    function positionOnStage(e, x, y, a) {
        e.css('transform', 'rotateY(' + (4 *x / FULL_ARC_LENGTH) + 'rad) translate3d(0,' + y * M_TO_PX + 'px,' + RADIUS * M_TO_PX + 'px) rotate(' + a + 'rad)');
    }

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
    ctx.translate(canvas.width / 2, canvas.height);
    ctx.scale(1, -1);

    var world;

    var timer = {};

    function createTerrain(world, blockList) {
        var baseX = 0, baseY = 30;

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
        fixDef.shape.SetAsBox(200, 0.1);

        body.CreateFixture(fixDef);

        blockList.forEach(function (b) {
            fixDef.shape.SetAsOrientedBox(b[0], b[1], new b2Vec2(b[2], b[3]), b[4]);
            body.CreateFixture(fixDef);

            var box = $('<div class="terrainBlock"><div class="_body"></div></div>').appendTo(stage);
            box.css('width', b[0] * 2 * M_TO_PX + 'px');
            box.css('height', b[1] * 2 * M_TO_PX + 'px');

            positionOnStage(box, (b[2] + baseX), (b[3] + baseY), b[4]);
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
            positionOnStage(w1, bike.w1x, bike.w1y, bike.w1a);
            positionOnStage(w2, bike.w2x, bike.w2y, bike.w2a);
            positionOnStage(body, bike.bx, bike.by, bike.ba);
        });
    }
});
