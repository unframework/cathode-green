
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

    function createTerrain(world) {
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef;

        //create ground
        bodyDef.type = b2Body.b2_staticBody;

        // positions the center of the object (not upper left!)
        bodyDef.position.x = 6;
        bodyDef.position.y = 10;

        fixDef.shape = new b2PolygonShape;

        // half width, half height. eg actual height here is 1 unit
        fixDef.shape.SetAsBox(6, 0.1);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
    }

    function init() {
        world = new b2World(new b2Vec2(0, 10), true);

        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(ctx);
        debugDraw.SetDrawScale(50);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        world.SetDebugDraw(debugDraw);

        createTerrain(world);
        createBikeRenderer(new Bike(input, timer, world, 2, 8));
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

        //world.DrawDebugData();
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
            w1.css('transform', 'translate3d(' + bike.w1x * 50 + 'px,' + bike.w1y * 50 + 'px,0) rotate(' + bike.w1a + 'rad)');
            w2.css('transform', 'translate3d(' + bike.w2x * 50 + 'px,' + bike.w2y * 50 + 'px,0) rotate(' + bike.w2a + 'rad)');
            body.css('transform', 'translate3d(' + bike.bx * 50 + 'px,' + bike.by * 50 + 'px,0) rotate(' + bike.ba + 'rad)');
        });
    }
});
