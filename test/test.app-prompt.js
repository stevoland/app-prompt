/*global define: false, suite: false, setup: false, test: false, teardown: false, localStorage: false, MouseEvent: false */

define([
  'chai',
  'app-prompt'
], function (chai, AppPrompt) {
  'use strict';

  var assert = chai.assert;

  suite('AppPrompt', function () {

    suite('#isSupportedUserAgent() Android', function () {
      var prompt;

      function assertUaEqual (version, expected) {
        var ua = 'Mozilla/5.0 (Linux; Android {VERSION}; Galaxy Nexus Build/IMM76B)'.replace('{VERSION}', version);

        assert.equal(prompt.isSupportedUserAgent(ua), expected);
      }

      setup(function () {
        prompt = new AppPrompt({
          android: {
            minVersion: '2.2.1'
          }
        });
      });

      test('Major version higher', function () {
        assertUaEqual('4.0.0', true);
      });

      test('Major version lower', function () {
        assertUaEqual('1.0.0', false);
      });

      test('Minor version higher', function () {
        assertUaEqual('2.13.4', true);
      });

      test('Minor version lower', function () {
        assertUaEqual('2.1.4', false);
      });

      test('Patch version higher', function () {
        assertUaEqual('2.2.4', true);
      });

      test('Patch version lower', function () {
        assertUaEqual('2.2.0', false);
      });
    });


    suite('#isSupportedUserAgent() iOS', function () {
      var prompt;

      function assertUaEqual (version, expected) {
        var ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS {VERSION} like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25'
                  .replace('{VERSION}', version);

        assert.equal(prompt.isSupportedUserAgent(ua), expected);
      }

      setup(function () {
        prompt = new AppPrompt({
          ios: {
            minVersion: '2.2'
          }
        });
      });

      test('Major version higher', function () {
        assertUaEqual('4_0', true);
      });

      test('Major version lower', function () {
        assertUaEqual('1_0', false);
      });

      test('Minor version higher', function () {
        assertUaEqual('2_3', true);
      });

      test('Minor version lower', function () {
        assertUaEqual('2_1', false);
      });
    });


    suite('#hasNativePrompt()', function () {
      var prompt;

      setup(function () {
        prompt = new AppPrompt({
          android: {
            minVersion: '2.2.1'
          },
          ios: {
            minVersion: '5'
          }
        });
      });

      test('Android doesn\'t have native prompt', function () {
        var ua = 'Mozilla/5.0 (Linux; Android 2.1.3; Galaxy Nexus Build/IMM76B)';
        assert.equal(prompt.hasNativePrompt(ua), false);
      });

      test('iOS 5 doesn\'t have native prompt', function () {
        var ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
        assert.equal(prompt.hasNativePrompt(ua), false);
      });

      test('iOS 6 has native prompt', function () {
        var ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
        assert.equal(prompt.hasNativePrompt(ua), true);
      });

      test('iOS 6.1 has native prompt', function () {
        var ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
        assert.equal(prompt.hasNativePrompt(ua), true);
      });

      test('iOS 7 has native prompt', function () {
        var ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
        assert.equal(prompt.hasNativePrompt(ua), true);
      });

      test('iOS Chrome doesn\'t have native prompt', function () {
        var ua = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en-gb)' +
                  'AppleWebKit/534.46.0 (KHTML, like Gecko)' +
                  'CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3';
        assert.equal(prompt.hasNativePrompt(ua), false);
      });

      test('iOS without \'apple-itunes-app\' meta tag doesn\'t have native prompt', function () {
        var ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
            meta = document.querySelector('meta[name=apple-itunes-app]');

        if (meta) {
          meta.parentNode.removeChild(meta);
        }
        assert.equal(prompt.hasNativePrompt(ua), false);
      });
    });


    suite('#render()', function () {
      var prompt,
          androidUa = 'Mozilla/5.0 (Linux; Android 2.2.2; Galaxy Nexus Build/IMM76B)';

      function setupPrompt() {
        prompt = new AppPrompt({
          appName: 'BBC Weather',
          android: {
            id: '#'
          },
          ios: {
            id: '#'
          }
        });
      }

      function getPromptElement (platform, mustBeVisible) {
        var selector = '.app-prompt';
        if (platform) {
          selector += '.ap--' + platform;
        }
        if (mustBeVisible) {
          selector += '.ap--shown';
        }
        return document.querySelector(selector);
      }

      function getPromptChildElement (selector) {
        var el = getPromptElement();
        if (el) {
          return el.querySelector(selector);
        }
      }

      function promptHasRendered (platform, mustBeVisible) {
        return !!getPromptElement(platform, mustBeVisible);
      }

      function removePromptElement () {
        var el = getPromptElement();
        if (el) {
          el.parentNode.removeChild(el);
        }
      }

      function closePrompt () {
        var close = getPromptChildElement('.ap__close');
        close.dispatchEvent(new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        }));
      }


      setup(setupPrompt);

      teardown(function () {
        localStorage.removeItem('app_prompt_bbc_weather_already_seen');
        localStorage.removeItem('app_prompt_bbc_weather_visits');
        sessionStorage.removeItem('app_prompt_bbc_weather_visited');
        removePromptElement();
      });

      test('Displays prompt first visit first view', function () {
        prompt.render(androidUa);
        assert.equal(promptHasRendered('android'), true);
      });

      test('Displays prompt first visit second view', function () {
        prompt.render(androidUa);
        sessionStorage.setItem('app_prompt_bbc_weather_visited', '1');
        assert.equal(promptHasRendered('android'), true);
      });

      test('Removes after clicking close button', function (done) {
        prompt.render(androidUa);
        setTimeout(function () {
          closePrompt();
          assert.equal(promptHasRendered('android', true), false);
          done();
        }, 0);
      });

      test('Doesn\'t display after prompt has previously been closed' , function (done) {
        prompt.render(androidUa);
        setTimeout(function () {
          closePrompt();
          setupPrompt();
          prompt.render(androidUa);
          setTimeout(function () {
            assert.equal(promptHasRendered('android', true), false);
            done();
          }, 0);
        }, 0);
      });
    });
  });
});