define([], function () {
    function Map(world, timer, mapSource) {
        var self = this;

        var bodyDef = new b2BodyDef();

        this.trackerList = [];

        var fixDef = new b2FixtureDef();
        fixDef.density = 800.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.2;
        fixDef.shape = new b2PolygonShape();

        var rjd = new b2RevoluteJointDef();
        rjd.enableMotor = false;

        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = 0;
        bodyDef.position.y = 0;
        var anchorBody = world.CreateBody(bodyDef);

        var lines = [],
            maxLineLength = 0;

        mapSource.split("\n").forEach(function (v) {
            lines.push(v.split(''));
            maxLineLength = Math.max(maxLineLength, v.length);
        });

        var scale = 0.5,
            offsetX = -maxLineLength * scale * 0.5,
            offsetY = 0;

        this.startX = 0,
        this.startY = lines.length * scale;

        function cat(x, y) {
            return (lines[y] && lines[y][x]) || ' ';
        }

        function walk(sx, sy, dx, dy) {
            var cx = sx + dx,
                cy = sy + dy,
                pivotX = null,
                pivotY = null,
                pivotDir = 0,
                c;

            if (cat(sx, sy) === '*') {
                pivotX = sx;
                pivotY = sy;
            }

            while((c = cat(cx, cy)) !== ' ') {
                if (c === '*' || c === '.' || c === 'O' || c === 'o') {
                    pivotX = cx;
                    pivotY = cy;
                }

                if (c === 'O') {
                    pivotDir = 1;
                } else if (c === 'o') {
                    pivotDir = -1;
                }

                if (c !== '+' && c !== '*') {
                    cx = cx + dx;
                    cy = cy + dy;
                    continue;
                }

                var sizeX = (cx - sx) * dx,
                    sizeY = (cy - sy) * dy,
                    ox = ((pivotDir ? sx - pivotX : 0) + sizeX * 0.5) * scale,
                    oy = -((pivotDir ? sy - pivotY : 0) + sizeY * 0.5) * scale;

                bodyDef.type = pivotX !== null ? (pivotDir ? b2Body.b2_kinematicBody : b2Body.b2_dynamicBody) : b2Body.b2_staticBody;
                bodyDef.position.x = (pivotDir ? pivotX : sx) * scale + offsetX;
                bodyDef.position.y = (lines.length - (pivotDir ? pivotY : sy)) * scale + offsetY;
                fixDef.shape.SetAsOrientedBox(
                    (sizeX + 1) * 0.5 * scale,
                    (sizeY + 1) * 0.5 * scale,
                    new b2Vec2(
                        ox,
                        oy
                    ),
                    0
                );

                var tracker = {
                    x: bodyDef.position.x,
                    y: bodyDef.position.y,
                    a: 0,
                    w: sizeX * scale,
                    h: sizeY * scale,
                    ox: ox,
                    oy: oy
                };

                console.log(tracker)

                var body = world.CreateBody(bodyDef);
                body.CreateFixture(fixDef);

                if (pivotDir) {
                    body.SetAngularVelocity(pivotDir);
                } else if (pivotX !== null) {
                    rjd.enableMotor = false;
                    rjd.Initialize(body, anchorBody, new b2Vec2(pivotX * scale + offsetX, (lines.length - pivotY) * scale + offsetY));
                    world.CreateJoint(rjd);
                }

                if (pivotX !== null) {
                    $(timer).on('elapsed', function () {
                        var bpos = body.GetPosition();

                        tracker.x = bpos.x;
                        tracker.y = bpos.y;
                        tracker.a = body.GetAngle();
                        $(tracker).trigger('moved');
                    });
                }

                self.trackerList.push(tracker);

                break;
            }
        }

        lines.forEach(function (line, y) {
            line.forEach(function (c, x) {
                if (c === '@') {
                    self.startX = x * scale + offsetX;
                    self.startY = (lines.length - y) * scale + offsetY;
                } else if (c === '+' || c === '*') {
                    walk(x, y, 1, 0);
                    walk(x, y, 0, 1);
                }
            });
        });

    }

    return Map;
});