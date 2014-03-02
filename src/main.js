
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

    function init() {
       world = new b2World(new b2Vec2(0, 10), true);

       var SCALE = 30;

       var fixDef = new b2FixtureDef;
       fixDef.density = 1.0;
       fixDef.friction = 0.5;
       fixDef.restitution = 0.2;

       var bodyDef = new b2BodyDef;

       //create ground
       bodyDef.type = b2Body.b2_staticBody;

       // positions the center of the object (not upper left!)
       bodyDef.position.x = canvas.width / 2 / SCALE;
       bodyDef.position.y = canvas.height / SCALE;

       fixDef.shape = new b2PolygonShape;

       // half width, half height. eg actual height here is 1 unit
       fixDef.shape.SetAsBox((600 / SCALE) / 2, (10/SCALE) / 2);
       world.CreateBody(bodyDef).CreateFixture(fixDef);

       //create some objects
       bodyDef.type = b2Body.b2_dynamicBody;
       for(var i = 0; i < 150; ++i) {
          if(Math.random() > 0.5) {
             fixDef.shape = new b2PolygonShape;
             fixDef.shape.SetAsBox(
                   Math.random() + 0.1 //half width
                ,  Math.random() + 0.1 //half height
             );
          } else {
             fixDef.shape = new b2CircleShape(
                Math.random() + 0.1 //radius
             );
          }
          bodyDef.position.x = Math.random() * 25;
          bodyDef.position.y = Math.random() * 10;
          world.CreateBody(bodyDef).CreateFixture(fixDef);
       }

       //setup debug draw
       var debugDraw = new b2DebugDraw();
       debugDraw.SetSprite(ctx);
       debugDraw.SetDrawScale(SCALE);
       debugDraw.SetFillAlpha(0.3);
       debugDraw.SetLineThickness(1.0);
       debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
       world.SetDebugDraw(debugDraw);

       setTimeout(init, 6000);
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

        world.ClearForces();

        world.DrawDebugData();
        stats.update();

        requestAnimFrame(update);
    }

    init();
    requestAnimFrame(update);
});
