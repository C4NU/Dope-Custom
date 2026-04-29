(function (window, document) {
    'use strict';

    var defaultPatterns = {
        success: {pattern: [{duration: 30, intensity: 0.5}, {delay: 60, duration: 40, intensity: 1}]},
        warning: {pattern: [{duration: 40, intensity: 0.8}, {delay: 100, duration: 40, intensity: 0.6}]},
        error: {pattern: [{duration: 40, intensity: 0.9}, {delay: 40, duration: 40, intensity: 0.9}, {delay: 40, duration: 40, intensity: 0.9}]},
        light: {pattern: [{duration: 15, intensity: 0.4}]},
        medium: {pattern: [{duration: 25, intensity: 0.7}]},
        heavy: {pattern: [{duration: 35, intensity: 1}]},
        soft: {pattern: [{duration: 40, intensity: 0.5}]},
        rigid: {pattern: [{duration: 10, intensity: 1}]},
        selection: {pattern: [{duration: 8, intensity: 0.3}]},
        nudge: {pattern: [{duration: 80, intensity: 0.8}, {delay: 80, duration: 50, intensity: 0.3}]},
        buzz: {pattern: [{duration: 1000, intensity: 1}]}
    };

    var minInterval = 16;
    var maxInterval = 184;
    var maxDuration = 1000;
    var pulseUnit = 20;
    var instanceCount = 0;

    function cloneVibration(vibration) {
        return {
            delay: vibration.delay,
            duration: vibration.duration,
            intensity: vibration.intensity
        };
    }

    function normalize(input) {
        var index;
        var pattern;
        var vibrations = [];

        if (typeof input === 'number') {
            return {vibrations: [{duration: input}]};
        }

        if (typeof input === 'string') {
            pattern = defaultPatterns[input];
            if (!pattern) return null;
            return normalize(pattern);
        }

        if (Array.isArray(input)) {
            if (!input.length) return {vibrations: []};
            if (typeof input[0] === 'number') {
                for (index = 0; index < input.length; index += 2) {
                    vibrations.push({
                        delay: index > 0 ? input[index - 1] : undefined,
                        duration: input[index]
                    });
                }
                return {vibrations: vibrations};
            }
            return {vibrations: input.map(cloneVibration)};
        }

        if (input && input.pattern) {
            return {vibrations: input.pattern.map(cloneVibration)};
        }

        return null;
    }

    function intensityToPattern(duration, intensity) {
        var on;
        var off;
        var pattern = [];

        if (intensity >= 1) return [duration];
        if (intensity <= 0) return [];

        on = Math.max(1, Math.round(pulseUnit * intensity));
        off = pulseUnit - on;

        while (duration >= pulseUnit) {
            pattern.push(on);
            pattern.push(off);
            duration -= pulseUnit;
        }

        if (duration > 0) {
            pattern.push(Math.max(1, Math.round(duration * intensity)));
            off = duration - pattern[pattern.length - 1];
            if (off > 0) pattern.push(off);
        }

        return pattern;
    }

    function toNativePattern(vibrations, defaultIntensity) {
        var output = [];

        vibrations.forEach(function (vibration) {
            var delay = vibration.delay || 0;
            var intensity = Math.max(0, Math.min(1, vibration.intensity == null ? defaultIntensity : vibration.intensity));
            var pulsePattern;

            if (delay > 0) {
                if (output.length > 0 && output.length % 2 === 0) {
                    output[output.length - 1] += delay;
                } else {
                    if (output.length === 0) output.push(0);
                    output.push(delay);
                }
            }

            pulsePattern = intensityToPattern(vibration.duration, intensity);
            if (pulsePattern.length) {
                pulsePattern.forEach(function (duration) {
                    output.push(duration);
                });
            }
        });

        return output;
    }

    function WebHaptics(options) {
        this.instanceId = ++instanceCount;
        this.showSwitch = options && options.showSwitch || false;
        this.hapticLabel = null;
        this.domInitialized = false;
        this.rafId = null;
    }

    WebHaptics.isSupported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

    WebHaptics.prototype.ensureDOM = function () {
        var id;
        var input;

        if (this.domInitialized || !document) return;

        id = 'web-haptics-' + this.instanceId;
        this.hapticLabel = document.createElement('label');
        this.hapticLabel.setAttribute('for', id);
        this.hapticLabel.textContent = 'Haptic feedback';
        this.hapticLabel.style.position = 'fixed';
        this.hapticLabel.style.bottom = '10px';
        this.hapticLabel.style.left = '10px';
        this.hapticLabel.style.padding = '5px 10px';
        this.hapticLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.hapticLabel.style.color = 'white';
        this.hapticLabel.style.fontFamily = 'sans-serif';
        this.hapticLabel.style.fontSize = '14px';
        this.hapticLabel.style.borderRadius = '4px';
        this.hapticLabel.style.zIndex = '9999';
        this.hapticLabel.style.userSelect = 'none';

        input = document.createElement('input');
        input.type = 'checkbox';
        input.setAttribute('switch', '');
        input.id = id;
        input.style.all = 'initial';
        input.style.appearance = 'auto';

        if (!this.showSwitch) {
            this.hapticLabel.style.display = 'none';
            input.style.display = 'none';
        }

        this.hapticLabel.appendChild(input);
        document.body.appendChild(this.hapticLabel);
        this.domInitialized = true;
    };

    WebHaptics.prototype.stopPattern = function () {
        if (this.rafId !== null) {
            window.cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    };

    WebHaptics.prototype.runPattern = function (vibrations, defaultIntensity, alreadyClicked) {
        var timeline = [];
        var total = 0;
        var start = 0;
        var lastClick = -1;
        var self = this;

        vibrations.forEach(function (vibration) {
            var intensity = Math.max(0, Math.min(1, vibration.intensity == null ? defaultIntensity : vibration.intensity));
            var delay = vibration.delay || 0;

            if (delay > 0) {
                total += delay;
                timeline.push({end: total, isOn: false, intensity: 0});
            }

            total += vibration.duration;
            timeline.push({end: total, isOn: true, intensity: intensity});
        });

        function frame(timestamp) {
            var elapsed;
            var segment = timeline[0];
            var interval;
            var index;

            if (!start) start = timestamp;
            elapsed = timestamp - start;

            if (elapsed >= total) {
                self.rafId = null;
                return;
            }

            for (index = 0; index < timeline.length; index += 1) {
                if (elapsed < timeline[index].end) {
                    segment = timeline[index];
                    break;
                }
            }

            if (segment.isOn) {
                interval = minInterval + (1 - segment.intensity) * maxInterval;
                if (lastClick === -1) {
                    lastClick = timestamp;
                    if (!alreadyClicked) {
                        self.hapticLabel.click();
                        alreadyClicked = true;
                    }
                } else if (timestamp - lastClick >= interval) {
                    self.hapticLabel.click();
                    lastClick = timestamp;
                }
            }

            self.rafId = window.requestAnimationFrame(frame);
        }

        this.rafId = window.requestAnimationFrame(frame);
    };

    WebHaptics.prototype.trigger = function (input, options) {
        var normalized = normalize(input || [{duration: 25, intensity: 0.7}]);
        var vibrations;
        var defaultIntensity;
        var firstImmediate;

        if (!normalized || !normalized.vibrations.length) return;

        vibrations = normalized.vibrations;
        defaultIntensity = Math.max(0, Math.min(1, options && options.intensity == null ? 0.5 : options && options.intensity || 0.5));

        vibrations.forEach(function (vibration) {
            if (vibration.duration > maxDuration) vibration.duration = maxDuration;
        });

        if (WebHaptics.isSupported) {
            navigator.vibrate(toNativePattern(vibrations, defaultIntensity));
        }

        if (!WebHaptics.isSupported) {
            this.ensureDOM();
            this.stopPattern();
            firstImmediate = (vibrations[0].delay || 0) === 0;
            if (firstImmediate) this.hapticLabel.click();
            this.runPattern(vibrations, defaultIntensity, firstImmediate);
        }
    };

    WebHaptics.prototype.cancel = function () {
        this.stopPattern();
        if (WebHaptics.isSupported) navigator.vibrate(0);
    };

    window.WebHaptics = WebHaptics;
    window.webHapticsDefaultPatterns = defaultPatterns;
}(window, document));
