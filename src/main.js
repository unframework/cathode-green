
require.config({
    shim: {
        'stats': {
            exports: 'Stats'
        }
    }
});

require([ 'stats' ], function (Stats) {
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

    var canvas = document.getElementById("box2dDebugDraw");
    var ctx = canvas.getContext("2d");
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    var world;

    function createBike(world, x, y) {
        var fixDef = new b2FixtureDef();
        fixDef.density = 0.2;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2CircleShape(0.5);

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = x - 0.75;
        bodyDef.position.y = y;

        var w1 = world.CreateBody(bodyDef);
        w1.CreateFixture(fixDef);

        bodyDef.position.x = x + 0.75;
        var w2 = world.CreateBody(bodyDef);
        w2.CreateFixture(fixDef);

        bodyDef.position.x = x;
        fixDef.density = 100.0;
        fixDef.shape = new b2CircleShape(0.2);
        var main = world.CreateBody(bodyDef);
        main.CreateFixture(fixDef);

        var rjd = new b2RevoluteJointDef();
        rjd.motorSpeed = 10.0 * -Math.PI;
        rjd.maxMotorTorque = 20.0;
        rjd.enableMotor = false;

        rjd.Initialize(w1, main, new b2Vec2(x - 0.75, y));
        world.CreateJoint(rjd);

        rjd.Initialize(w2, main, new b2Vec2(x + 0.75, y));
        world.CreateJoint(rjd);
    }

    function createTerrain(world) {
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.8;
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
        createBike(world, 2, 8);
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

        world.DrawDebugData();
        stats.update();

        requestAnimFrame(update);
    }

    init();
    requestAnimFrame(update);
});
