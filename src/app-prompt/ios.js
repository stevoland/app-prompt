/*global define: false, localStorage: false, sessionStorage: false */
/*jslint browser: true */

define([
  'mout/object/mixIn',
  './base'
], function (mixin, AppPromptBase) {
  'use strict';

  var AppPromptIos = function (options, i18n, appPrompt) {
    var defaultI18n = {
          price: 'FREE',
          inTheStore: 'On the App Store',
          button: 'VIEW'
        };

    options = mixin({}, defaultI18n, options);

    AppPromptBase.apply(this, [options, i18n, appPrompt]);
  };

  AppPromptIos.prototype = mixin({}, AppPromptBase.prototype);

  AppPromptIos.hasNativePrompt = function (userAgent) {
    var matches = userAgent.match(AppPromptIos.versionPattern);

    if (!matches) {
      return false;
    }

    if (parseInt(matches[1], 10) < 6) {
      return false;
    }
    if (userAgent.match(/CrIOS/i)) {
      return false;
    }

    if (!document.querySelector('meta[name=apple-itunes-app]')) {
      return false;
    }

    return true;
  };

  AppPromptIos.prototype.key = AppPromptIos.key = 'ios';

  AppPromptIos.prototype.url = 'https://itunes.apple.com/us/app/id{{id}}';

  AppPromptIos.versionPattern = /i[Phone|Pad|Pod][\w\W]+OS ([\d_]+)/;





  return AppPromptIos;
});