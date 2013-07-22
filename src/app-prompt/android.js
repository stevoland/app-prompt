/*global define: false, localStorage: false, sessionStorage: false */
/*jslint browser: true */

define([
  'mout/object/mixIn',
  './base',
  'css!./android'
], function (mixin, AppPromptBase) {
  'use strict';

  var AppPromptAndroid = function (options, i18n, appPrompt) {
    var defaultI18n = {
          price: 'FREE',
          inTheStore: 'In Google Play',
          button: 'VIEW'
        };

    options = mixin({}, defaultI18n, options);

    AppPromptBase.apply(this, [options, i18n, appPrompt]);
  };

  AppPromptAndroid.prototype = mixin({}, AppPromptBase.prototype);

  AppPromptAndroid.hasNativePrompt = function (userAgent) {
    return false;
  };

  AppPromptAndroid.prototype.key = AppPromptAndroid.key = 'android';

  AppPromptAndroid.versionPattern = /Android ([\d\.]+)/;

  AppPromptAndroid.prototype.url = 'https://play.google.com/store/apps/details?id={{id}}';



  return AppPromptAndroid;
});