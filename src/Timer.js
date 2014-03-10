define([], function () {
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }());

    function Timer() {
        var lastTime = performance.now(),
            physicsStepAccumulator = 0,
            physicsStepDuration = 1 / 60.0,
            self = this;

        function update() {
            var time = performance.now(),
                elapsed = time - lastTime;

            lastTime = time;

            physicsStepAccumulator = Math.min(physicsStepDuration, physicsStepAccumulator + elapsed);

            if (physicsStepAccumulator < physicsStepDuration) {
                return;
            }

            physicsStepAccumulator = Math.max(0, physicsStepAccumulator - physicsStepDuration);
            requestAnimFrame(update);

            $(self).trigger('elapsed', [ physicsStepDuration ]);
        }

        requestAnimFrame(update);
    }

    return Timer;
});