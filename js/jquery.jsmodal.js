/**
 * Shows a element as a modal dialog
 * 
 * Usage: $('#selector').modal({settings:value});
 *
 * Options:
 * - closeButton string          Css selector to be used to close the dialog. Defaults to '.close'
 * - escClose    boolean         Whether the dialog should be closed when pressing the ESC key. Defaults to true.
 * - onCloseFn   function        Callback function when the dialog has been closed
 * - onOpenFn    function        Callback function when the dialog has been opened
 * - modal       boolean         Whether or not this is a modal dialog. Defaults to true.
 * - effect      string          The effect to use when opening a modal: scale, slide-right, slide-right, slide-bottom, newspaper, fall, slide-fall, sticky-top, flip-horizontal, flip-vertical, sign, super-scaled, just-me, slit
 * - title       string          The title of the dialog. Defaults to an empty string
 * - callback    function        Callback function when the options.doneButton has been clicked. Form fields will be supplied as data argument, as well as the modal itself. Callback returns true when the modal should be closed, null or false when it shoudl stay open.
 */
$.fn.modal = function(options) {
    var defaults = {
      closeButton : '.close,.cancel',
      escClose    : true,
      onCloseFn   : null,
      onOpenFn    : null,
      modal       : true,
      immutable   : false,
      effect      : null,
      title       : '',
      callback    : null,
      doneButton  : '.done,.ok'
    };
    options = $.extend(defaults, options);

    return this.each(function() {
      var o = options,
      modal = o.immutable ? $(this) : decorate($(this), o);
      o.id = createGUID(); // GUID for identifying modal & event handlers
    
      // immutable
      if (o.immutable){
       $(this).addClass("immutable"); 
      }

      // show overlay
      if ( $('.modal-overlay').length < 1){
        modal.parent().append($("<div class='modal-overlay'></div>"));
      }

      // add close event handler to overlay
      $(".modal-overlay").click(function(e) {
        e.preventDefault();
        closeModal(modal, o);
      });

      // add close event handler to close buttons
      $(o.closeButton).click(function(e) {
        e.preventDefault();
        closeModal(modal, o)
      });
      
      if (o.escClose){
        // add close event handler to ESC key. Event is namespaced, so we can remove it after we've closed the modal
        $(window).on('keydown.'+o.id, function(event) {
            if (event.which === 27){
                closeModal(modal, o);
            }
        });
      };

      $(o.doneButton, modal).on('click.callback', function(e){
        e.preventDefault();
        if (typeof o.callback === "function"){
          var data = {};
          $(":input", modal ).each(function(i, element){
            data[$(element).attr('name')] = $(element).val();
          });
          var result = o.callback( data, modal );
          if (result === true){
            closeModal(modal, o);
          }
        }
      });

      if (typeof o.effect === 'string'){
        modal.addClass(o.effect, modal);
      }

      // start with a delay to allow the effect to kick in
      setTimeout(function(){modal.addClass('modal-show');}, 150);
      
      // initialize
      if (typeof o.onOpenFn === 'function'){
        o.onOpenFn(modal);
      }

    });

    /**
     * Decorate the modal provided. When only supplying the modal body, decorate it with additional modal elements (content, head, titile, close button)
     *
     * @param jquery the modal element
     * @param object options the modal options
     */
    function decorate(modal, options){
      if (modal.find('.body').length === 0){
        var body =  $('<div class="body"></div>'), footer, content;

        modal.children().each(function(i,e){
          if ($(e).is(".footer")){
            footer = $(e);
          }else{
            body.append(e);
          }
        });

        content = $('<div class="content"></div>');
        content.append(
            '<div class="head">\
               <h4 class="title"></h4>\
               <a class="close" href="#">&times;</a>\
             </div>');
        content.append(body);
        content.append(footer);
        modal.append(content);

        // add the title from options
        content.find('.title').html(options.title);
      }
      return modal;
    }

    function createGUID(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
      }
    
    /*
     * Close the model
     */
    function closeModal(modal, options) {
      modal.removeClass('modal-show');

      // clean up effect
      if (typeof options.effect === 'string'){
        setTimeout(function(){
          modal.removeClass(options.effect);
        }, 500);
      }

      if (typeof options.onCloseFn === 'function'){
        options.onCloseFn(modal);
      }
      
      // immutable
      if (options.immutable){
       $(modal).removeClass("immutable"); 
      }

      // remove event handlers
      $(window).off('keydown.'+options.id);

      if (typeof options.callback === "function"){
        $(options.doneButton, modal).off('click.callback');
      }
    }

  }