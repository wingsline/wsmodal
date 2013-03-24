/*!
 * jquery.wsmodal.js v0.1.1
 * http://wingsline.com
 *
 * Copyright 2013 Arpad Olasz
 * All rights reserved.
 *
 */

(function($) {
  /**
   * Plugin namespace
   *
   * @type {String}
   */
  var __NS__ = 'wsmodal',
    /**
     * Global variables, applies to all the modals
     *
     * @type {Object}
     */
    global = {
      bg: 'wsmodal__bg',
      close : 'wsmodal__close',
      opacity: 0.7,
      speed: 200,
      /**
       * Global open function. This function is applied 
       * when the modal is opened or when tabbing
       *
       */
      open: function () {
        $('.text-input,.btn', this).first().focus();
      }
    },
    opened = [], // array of opened modals
    methods = {
      init: function(options) {
        return this.each(function() {
          var $this = $(this),
            data = $this.data(__NS__);

          // If the plugin hasn't been initialized yet
          if (!data) {
            // default options
            data = $.extend({
              global: {},
              open: global.open,
              close: function () {}
            }, options);
            $(this).data(__NS__, data);
            // extend the global
            global = $.extend(data.global, global);
            // create the modal bg
            var bg = $('.' + global.bg);
            if(bg.length === 0) {
              bg = $('<div class="' + global.bg + '"/>')
                .css('opacity', global.opacity)
                .appendTo('body')
                .on('click.' + __NS__, function () {
                  methods.close.apply(bg, [1]);
                });
            }
            // add the click event
            $(this).on('click.' + __NS__, function (e) {
              e.preventDefault();
              methods.open.apply(this);
            });
            // move the container to the end of the body
            data.container = $('#' + $this.data('wsmodalId'));
            data.container.data(__NS__ + 'Open', data.open);
            data.container.data(__NS__ + 'Close', data.close);
            $('body').append( data.container.detach());
            // add the close events to the close classes
            $('body').off('.' + __NS__, '.' + global.close).on('click.' + __NS__, '.' + global.close, function (e) {
              e.preventDefault();
              methods.close.apply(bg);
            });
            $('body').off('keyup.' + __NS__).on('keyup.' + __NS__, function (e) {
              if(e.which === 27) {
                e.preventDefault();
                methods.close.apply(bg);
              }
            });
          }
        });
      }, // end init()


      destroy: function() {

        return this.each(function() {

          var $this = $(this),
            data = $this.data(__NS__);

          $(window).unbind('.' + __NS__);
          data[__NS__].remove();
          $this.removeData(__NS__);

        });

      }, // end destroy()

      /**
       * Will open a modal window
       *
       */
      open: function() {
        return $(this).each(function() {
          var $this = $(this),
            data = $this.data(__NS__),
            pos = parseInt(data.container.css('top'), 10);
          if (undefined === data.container.data(__NS__)) {
            data.container.data(__NS__, pos);
          }
          $('.' + global.bg).fadeIn(global.speed/2);
          data.container.css({
              'top': -data.container.outerHeight(),
              'opacity' : 0,
              'visibility' : 'visible'
            }).animate({
              'top': pos,
              'opacity' : 1
            }, global.speed, function () {
              // callback on open
              data.container.data(__NS__ + 'Open').apply(data.container);
            });
          opened.push(data.container);
          // block everything behind the bg
          var bg = $('.' + global.bg);
          bg.prevAll().on('keyup.' + __NS__, function (e) {
            e.preventDefault();
            global.open.apply(data.container);
          });
        });
      }, // end open()

      /**
       * Will close a modal window
       *
       * @param  {boolean} all When set to true all modals will be closed
       *
       */
      close: function (all) {
        if (all) {
          jQuery.each(opened, resetModal);
          opened = [];
        } else if (!all && opened.length) {
          var container = opened.pop();
          container.animate({
            'top': -container.outerHeight(),
            'opacity':0
          }, global.speed/2, resetModal);
        }

        if (!opened.length) {
          $(this).fadeOut(global.speed/2);
        }
      } // end close();

    }; // end methods

  /**
   * Will reset the modal window to it's original position after the animation
   *
   */
  var resetModal = function () {
    var $this = $(this);
    $this.css({'top':$this.data(__NS__), 'opacity' : 1, 'visibility' : 'hidden'});
    // callbacks on close
    $this.data(__NS__ + 'Close').apply($this);
  };

  $.fn.wsmodal = function(method) {

    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.wsmodal');
    }

  }; // end plugin

})(jQuery);


$('a[data-wsmodal-id]').wsmodal();
