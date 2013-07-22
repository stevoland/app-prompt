/*global define: false, localStorage: false, sessionStorage: false */
/*jslint browser: true */

define([
  'mout/collection/some',
  'mout/collection/reduce',
  'mout/object/mixIn',
  'mout/string/underscore',
  'app-prompt/ios',
  'app-prompt/android'
], function (some, reduce, mixin, underscore, AppPromptIos, AppPromptAndroid) {
  'use strict';

  var AppPrompt = function (options, i18n) {
        var defaultOptions = {
              showAfterPreviousVisits: 0,
              appName: 'AppName'
            };

        this.options = mixin({}, defaultOptions, options);
        this.i18n = mixin({}, i18n);
      },

      platforms = [],

      storagePrefix = 'app_prompt_';


  function isRequiredVersion (version, minVersion) {
    var granularity = 0,
        calcMin = reduce(minVersion.split('.'), function (memo, n) {
          granularity += 1;
          memo *= 1000; //assume no version level has more than 1000 versions
          return memo + Number(n);
        }, 0),
        calcCurrent;

    version = version.replace('_', '.');

    calcCurrent = reduce(version.split('.'), function (memo, n) {
      if (granularity > 0) {
        granularity -= 1;
        memo *= 1000;
        return memo + Number(n);
      }
      granularity -= 1;
      return memo;
    }, 0);

    return calcCurrent >= calcMin;
  }

  function VersionUaPatternMatch (platform) {
    var pattern = platform.versionPattern,
        key = platform.key,
        minVersion,
        matches;

    if (!this.options.hasOwnProperty(key)) {
      return;
    }

    minVersion = this.options[key].hasOwnProperty('minVersion') ?
      this.options[key].minVersion : 0;
    minVersion = String(minVersion);

    matches = this.ua.match(pattern);

    if (matches) {
      if (isRequiredVersion(matches[1], minVersion)) {
        this.userAgentType = platform;
        return matches[1];
      }
    }
  }

  AppPrompt.registerPlatform = function (prompt) {
    platforms.push(prompt);
  };

  AppPrompt.registerPlatform(AppPromptIos);
  AppPrompt.registerPlatform(AppPromptAndroid);


  AppPrompt.prototype = {
    render: function (userAgent, location) {
      var Platform,
          platform,
          options,
          i18n;

      userAgent = userAgent || navigator.userAgent;
      location = location || window.location;

      if (!this.isSupported()) {
        return false;
      }

      if (!this.isOnSupportedUrl(window.location)) {
        return false;
      }

      Platform = this.getSupportedUserAgentType(userAgent);

      if (!Platform) {
        return;
      }

      if (Platform.hasNativePrompt(userAgent)) {
        return;
      }

      if (!this.canShow()) {
        return;
      }
      options = mixin({}, this.options, this.options[Platform.key]);
      delete options[Platform.key];
      i18n = this.i18n.hasOwnProperty(Platform.key) ?
        this.i18n[Platform.key] : {};

      platform = new Platform(options, i18n, this);
      platform.render();
    },

    isSupported: function () {
      var val = storagePrefix + 'Check';

      if (document.querySelector === undefined) {
        return false;
      }

      try {
        localStorage.setItem(val, val);
        localStorage.removeItem(val);
      } catch (e) {
        return false;
      }
      try {
        sessionStorage.setItem(val, val);
        sessionStorage.removeItem(val);
      } catch (e2) {
        return false;
      }

      return true;
    },

    isOnSupportedUrl: function (location) {
      if (this.options.urlBlacklistPattern) {
        if (location.match(this.options.urlBlacklistPattern)) {
          return false;
        }
      }

      if (this.options.urlWhitelistPattern) {
        if (location.match(this.options.urlWhitelistPattern)) {
          return true;
        }

        return false;
      }

      return true;
    },

    isSupportedUserAgent: function (userAgent) {
      return !!this.getSupportedUserAgentType(userAgent);
    },

    getSupportedUserAgentType: function (userAgent) {
      var context = {
            ua: userAgent,
            options: this.options,
            userAgentType: false
          };

      some(platforms, VersionUaPatternMatch, context);

      return context.userAgentType;
    },

    hasNativePrompt: function (userAgent) {
      var userAgentType = this.getSupportedUserAgentType(userAgent);

      if (userAgentType) {
        return userAgentType.hasNativePrompt(userAgent);
      }

      return false;
    },

    canShow: function () {
      var previousVisits = 0,
          firstViewInVisit = false,
          prefix = this.getStoragePrefix(),
          visitsCountKey = prefix + 'visits',
          visitedKey = prefix + 'visited';

      if (this.isAlreadySeen()) {
        return false;
      }

      if (this.options.showAfterPreviousVisits) {
        previousVisits = parseInt(localStorage.getItem(visitsCountKey), 10) || 0;
        firstViewInVisit = !sessionStorage.getItem(visitedKey);
        if (firstViewInVisit) {
          sessionStorage.setItem(visitedKey, '1');
          localStorage.setItem(visitsCountKey, previousVisits + 1);
        }
        if (previousVisits < this.options.showAfterPreviousVisits) {
          return false;
        }
      }

      return true;
    },

    isAlreadySeen: function () {
      return !!localStorage.getItem(this.getAlreadySeenKey());
    },

    markAsSeen: function () {
      return localStorage.setItem(this.getAlreadySeenKey(), '1');
    },

    getStoragePrefix: function () {
      return storagePrefix + underscore(this.options.appName) + '_';
    },

    getAlreadySeenKey: function () {
      return this.getStoragePrefix() + 'already_seen';
    }
  };

  return AppPrompt;
});