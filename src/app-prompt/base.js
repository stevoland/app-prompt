/*global define: false, localStorage: false, sessionStorage: false */
/*jslint browser: true, nomen: true */

define([
  'mout/object/mixIn',
  'mout/string/interpolate',
  'mout/function/bind',
  'domReady',
  'css!./base'
], function (mixin, interpolate, bind, domReady) {
  'use strict';

  var AppPromptBase = function (options, i18n, appPrompt) {
    this.options = mixin({}, options);
    this.i18n = mixin({}, i18n);
    this.appPrompt = appPrompt;
  };

  AppPromptBase.prototype = {
    template:
      '<button class="ap__close"><span>Close</span></button>' +
      '<span class="ap__icon"></span>' +
      '<div class="ap__info">' +
        '<strong>{{appName}}</strong>' +
        '<span>{{author}}</span><span>{{price}} - {{inTheStore}}</span>' +
      '</div>' +
      '<a href="{{url}}" class="ap__button"><span>{{button}}</span></a>',

    render: function () {
      var args = mixin({
            url: interpolate(this.url, this.options)
          }, this.options, this.i18n),
          html = interpolate(this.template, args);

      this.div = document.createElement('div');
      this.div.className = 'app-prompt ap--' + this.key;
      this.div.innerHTML = html;

      domReady(bind(this._appendToDocument, this, this.div));
    },

    close: function () {
      this.div.className = 'app-prompt ap--' + this.key;
      this.appPrompt.markAsSeen();
      this.div.addEventListener('webkitTransitionEnd', bind(this._onClosed, this));
    },

    _appendToDocument: function (div) {
      document.body.insertBefore(div, document.body.firstChild);
      this.closeButton = this.div.querySelector('.ap__close');
      this.button = this.div.querySelector('.ap__button');

      div.addEventListener('click', bind(this._onClicked, this));

      setTimeout(function() {
        div.className += ' ap--shown';
      }, 0);
    },

    _onClicked: function (e) {
      var target = e.target;

      while (target !== this.closeButton && target !== this.button && target !== this.div) {
        target = target.parentNode;
      }

      if (target !== this.div) {
        this.close();
      }
    },

    _onClosed: function () {
      this.div.remove();
    }

  };


  return AppPromptBase;
});