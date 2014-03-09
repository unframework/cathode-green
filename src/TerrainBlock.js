define([], function () {
    function TerrainBlock(input, timer, world, x, y) {
        this.w1x = x - 0.75;
        this.w1y = y;
        this.w2x = x + 0.75;
        this.w2y = y;

        var fixDef = new b2FixtureDef();
        fixDef.density = 0.2;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.1;
        fixDef.shape = new b2CircleShape(0.5);

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = this.w1x;
        bodyDef.position.y = this.w1y;

        var w1 = world.CreateBody(bodyDef);
        w1.CreateFixture(fixDef);

        bodyDef.position.x = this.w2x;
        var w2 = world.CreateBody(bodyDef);
        w2.CreateFixture(fixDef);

        bodyDef.position.x = x;
        fixDef.density = 100.0;
        fixDef.shape = new b2CircleShape(0.2);
        var main = world.CreateBody(bodyDef);
        main.CreateFixture(fixDef);

        var rjd = new b2RevoluteJointDef();
        rjd.maxMotorTorque = 20.0;
        rjd.enableMotor = true;

        rjd.Initialize(w1, main, new b2Vec2(x - 0.75, y));
        var wj1 = world.CreateJoint(rjd);

        rjd.Initialize(w2, main, new b2Vec2(x + 0.75, y));
        var wj2 = world.CreateJoint(rjd);

        $(timer).on('elapsed', function () {
            var w1pos = w1.GetPosition(),
                w2pos = w2.GetPosition(),
                bpos = main.GetPosition();

            this.w1x = w1pos.x;
            this.w1y = w1pos.y;
            this.w1a = w1.GetAngle();

            this.w2x = w2pos.x;
            this.w2y = w2pos.y;
            this.w2a = w2.GetAngle();

            this.bx = bpos.x;
            this.by = bpos.y;
            this.ba = main.GetAngle();

            $(this).trigger('moved');
        }.bind(this));

        $(input).on('key:BRAKE key:FORWARD key:BACKWARD', function (e, value) {
            var dir = (input.status.FORWARD ? 1 : 0) + (input.status.BACKWARD ? -1 : 0)
                torque = (input.status.FORWARD || input.status.BACKWARD) ? 80.0 : (input.status.BRAKE ? 40.0 : 0);

            wj1.SetMotorSpeed(dir * 5.0 * -Math.PI);
            wj2.SetMotorSpeed(dir * 5.0 * -Math.PI);

            wj1.SetMaxMotorTorque(torque);
            wj2.SetMaxMotorTorque(torque);
        });
    }

    return Bike;
});