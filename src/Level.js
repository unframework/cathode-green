define([ './Map', './Bike' ], function (Map, Bike) {
    function createTerrain(world) {
        var baseX = 0, baseY = 0;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = baseX;
        bodyDef.position.y = baseY;

        var body = world.CreateBody(bodyDef);

        var fixDef = new b2FixtureDef();
        fixDef.density = 800.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.2;
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(200, 0.1);

        body.CreateFixture(fixDef);
    }

    function Level(input, timer, mapSource) {
        var self = this;

        this.cameraX = 5;
        this.cameraY = 20;

        var world = new b2World(new b2Vec2(0, -10), true);

        // var debugDraw = new b2DebugDraw();
        // debugDraw.SetSprite(ctx);
        // debugDraw.SetDrawScale(M_TO_PX);
        // debugDraw.SetFillAlpha(0.3);
        // debugDraw.SetLineThickness(1.0);
        // debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        // world.SetDebugDraw(debugDraw);

        createTerrain(world, []);

        var map = new Map(world, timer, mapSource);

        var bike = new Bike(input, timer, world, map.startX, map.startY);

        $(timer).on('elapsed', function (e, physicsStepDuration) {
            world.Step(physicsStepDuration, 10, 10);

            // move camera
            self.cameraX += 0.1 * (bike.bx - self.cameraX);
            self.cameraY += 0.1 * (bike.by - self.cameraY);

            // world.DrawDebugData();
        });

        this.bike = bike;
        this.map = map;
    }

    return Level;
});