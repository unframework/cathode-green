define([ 'text!./map.txt' ], function (mapSource) {
    function Map(world) {
        var scale = 0.5, offsetX = -5, offsetY = 0;

        var bodyDef = new b2BodyDef();

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

        var lines = [];

        mapSource.split("\n").forEach(function (v) {
            lines.push(v.split(''));
        });

        function cat(x, y) {
            return (lines[y] && lines[y][x]) || ' ';
        }

        function walk(sx, sy, dx, dy) {
            var cx = sx + dx,
                cy = sy + dy,
                pivotX = null,
                pivotY = null,
                c;

            if (cat(sx, sy) === '*') {
                pivotX = sx;
                pivotY = sy;
            }

            while((c = cat(cx, cy)) !== ' ') {
                if (c === '*') {
                    pivotX = cx;
                    pivotY = cy;
                }

                if (c !== '+' && c !== '*') {
                    cx = cx + dx;
                    cy = cy + dy;
                    continue;
                }

                var sizeX = (cx - sx) * dx,
                    sizeY = (cy - sy) * dy;

                bodyDef.type = pivotX !== null ? b2Body.b2_dynamicBody : b2Body.b2_staticBody;
                bodyDef.position.x = sx * scale + offsetX;
                bodyDef.position.y = (lines.length - sy) * scale + offsetY;
                fixDef.shape.SetAsOrientedBox(
                    (sizeX + 1) * 0.5 * scale,
                    (sizeY + 1) * 0.5 * scale,
                    new b2Vec2(
                        sizeX * 0.5 * scale,
                        -sizeY * 0.5 * scale
                    ),
                    0
                );

                var body = world.CreateBody(bodyDef);
                body.CreateFixture(fixDef);

                if (pivotX !== null) {
                    rjd.Initialize(body, anchorBody, new b2Vec2(pivotX * scale + offsetX, (lines.length - pivotY) * scale + offsetY));
                    world.CreateJoint(rjd);
                }

                break;
            }
        }

        lines.forEach(function (line, y) {
            line.forEach(function (c, x) {
                if (c !== '+' && c !== '*') {
                    return;
                }

                walk(x, y, 1, 0);
                walk(x, y, 0, 1);
            });
        });

    }

    return Map;
});