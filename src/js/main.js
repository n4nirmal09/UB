(function() {
  "use strict";

  var S, UB = {
    _init() {
      S = UB.settings
      this.scrollBarWidth()
      this.loaderAnimation()
      this.lazyload()
      this.resizeListener()
      this.navigationTrigger()
      this.smoothScrolls()
      this.popupGallery()
      this.accordian()
      this.progressCircleInit()
      //this.bodyScroll()
    },

    settings: {
      preloader: true,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      scrollBarWidth: 0,
      scrollClassTrigger: 0,
      fullpage: null
    },

    // Debounce function to optimize event listeners. we dont want it fire every time.
    debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      }
    },

    // Resize Function
    resizeFunctions() {
      S.windowWidth = window.innerWidth
      S.windowHeight = window.innerHeight
    },

    // ResizeListener 
    resizeListener() {
      let resize = this.debounce(this.resizeFunctions, 250)
      window.addEventListener('resize', resize)
    },

    // Scrolls
    bodyScroll() {
      let niceBody = $("body").niceScroll({
        
        scrollspeed: 300,
        autohidemode: true,
       
        hidecursordelay: 400,
        cursorfixedheight: false,
        cursorminheight: 20,
        enablekeyboard: true,
        horizrailenabled: false,
        bouncescroll: false,
        smoothscroll: true,
        iframeautoresize: true,
        touchbehavior: false,
        zindex: 999
      });
    },
    // Loader animation
    loaderAnimation() {
      let loaderWrapper = $('#main-loader'),
      mainWrapper = "#main-wrapper",
      mainHeader = "#main-header",
      logoHolder = loaderWrapper.find('.logo-holder'),
      tl = new TimelineMax({
        onComplete() {
          $('body').css("padding-right", '0')
          // $('#main-header').css("padding-right", '0')
          $('html').addClass('finished-loading-anim')
          UB.fullPageSliders()
          UB.detectAnimation()
        }
      })

      $('body').css("padding-right", S.scrollBarWidth + 'px')

      tl.to(loaderWrapper,0.5,{autoAlpha: 1, delay: 0.5})
      .staggerFrom(logoHolder.find('path'),0.5,{y: 100, autoAlpha: 0, ease: Power1.easeOut},0.1,'entry')
      .staggerTo(logoHolder.find('path'),0.5,{y: -100, autoAlpha: 0, ease: Power1.easeOut},-0.1,'entry+=1')
      .to([mainWrapper],0.5,{autoAlpha: 1},1.5)
      .to(loaderWrapper,0.5,{autoAlpha:0, display:"none"})
    },

    // ProgressCircleInit
    progressCircleInit() {
        TweenLite.set('.progress-circular__overlay',{drawSVG:"0% 0%", rotation: -90, transformOrigin:"50% 50%"})
    },

    // Scrollbar width

    scrollBarWidth() {
      var outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.width = "100px";
      outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

      document.body.appendChild(outer);

      var widthNoScroll = outer.offsetWidth;
      // force scrollbars
      outer.style.overflow = "scroll";

      // add innerdiv
      var inner = document.createElement("div");
      inner.style.width = "100%";
      outer.appendChild(inner);

      var widthWithScroll = inner.offsetWidth;

      // remove divs
      outer.parentNode.removeChild(outer);

      S.scrollBarWidth = widthNoScroll - widthWithScroll;


    },

    // Lazyload bg
    lazyload() {
      var controller = new ScrollMagic.Controller(),
        mobBreak = 1025;

      var processFigure = function(figure) {
        
        var src = $(figure).data('src'),
          mobSrc = $(figure).data('mob-src'),
          loadingSrc = "";

        if (mobSrc) {
          if (s.windowWidth < mobBreak) {
            loadingSrc = mobSrc
          } else {
            loadingSrc = src
          }
        } else {
          loadingSrc = src
        }

        if (loadingSrc) {
          var img = $("<img />").attr('src', loadingSrc)
          if (img.complete) {
            giveImage(loadingSrc);
          } else {
            img.on('load', function() {
                giveImage(loadingSrc);
              })
              .on('error', function() {
                // giveImage('assets/images/no-preview-available.png');
              })
          }
        }

        function giveImage(src) {

          $(figure).css('background-image', 'url(' + src + ')');
          $(figure).removeClass('preload-background')
          $(figure).addClass('loaded');
          //$(figure).data('src', '');
        }
      }

      var $images = $('.lazyload-bg');
      for (var i = 0; i < $images.length; i++) {
        var scene = new ScrollMagic.Scene({ triggerElement: $images[i], triggerHook: 'onEnter' })
          .on('enter', function() {
            var triggerElem = this.triggerElement();
            processFigure(triggerElem);
            window.addEventListener('resize', UB.debounce(function(){processFigure(triggerElem)}, 250))
          })
          .addTo(controller);
      }
    },

    // Image grid animation
    imageGridAnimationX(grid, dir){
      let tl = new TimelineMax(),
      speed = 0.5
      
      TweenLite.set($(grid).find('.background'),{autoAlpha: 1})
      if(dir === 'to-left'){
        tl.to($(grid).find('.mask'),speed,{scaleX: 1, ease: Power2.easeInOut, transformOrigin:'100% 50%'})
          .to($(grid).find('.mask'),speed,{scaleX: 0, ease: Power2.easeInOut, transformOrigin:'0% 50%'},speed)
          .from($(grid).find('.background'),0.5,{autoAlpha:0, x: 50},speed)
      } else if(dir === 'to-right') {
        tl.to($(grid).find('.mask'),speed,{scaleX: 1, ease: Power2.easeInOut, transformOrigin:'0% 50%'})
          .to($(grid).find('.mask'),speed,{scaleX: 0, ease: Power2.easeInOut, transformOrigin:'100% 50%'},speed)
          .from($(grid).find('.background'),0.5,{autoAlpha:0, x: -50},speed)
      }
      
      return tl
      
    },

    // CircleProgressAnimation
    circleProgressAnimation(grid) {
      let value = $(grid).data('percent'),
      tl = new TimelineMax(),
      speed = 1,
      overlay = $(grid).find('.progress-circular__overlay'),
      number = $(grid).find('.percent > .number'),
      counter = {cValue:0 }

     
      tl.from(grid,0.5,{autoAlpha: 0})
      .to(overlay,1,{drawSVG:"0% "+value+"%", ease:Power2.easeOut,})
      .to(counter,1,{cValue: value, roundProps:"cValue", onUpdate:updateHandler, ease:Linear.easeNone},0)

      function updateHandler() {
        if(counter.cValue) $(number).html(counter.cValue)
      }
      return tl
    },

    // Reveal Animations 
    detectAnimation() {
      var controller = new ScrollMagic.Controller();
      var elem = $('.detect-animate');

      elem.each(function() {

        var elem = this;
        var triggerElem = $(elem).data('top') ? $(elem).data('top') : elem;
        var elementAnimation = $(elem).data('animation');
        var delay = $(elem).data('delay') ? $(elem).data('delay') : 0;
        var speed = $(elem).data('speed') ? $(elem).data('speed') : 1;
        var hook = $(elem).data('hook') ? $(elem).data('hook') : 'onCenter';
        var offset = -200;
        var tween = '';
        var duration = 0;
        var reverse = ($(elem).data('reverse') === false) ? false : true;
        var staggerOffset = 0.1;
        var ease = $(elem).data('ease') ? $(elem).data('ease') : Power2.easeOut;

        TweenLite.set(elem, { autoAlpha: 1 })

        switch (elementAnimation) {
          case "fade-in":
            tween = TweenMax.from(elem, speed, { autoAlpha: 0, ease: Power0.easeNone, delay: delay });
            break;
          case "from-top":
            tween = TweenMax.from(elem, speed, { y: '-100px', opacity: 0, ease: ease, delay: delay });
            break;
          case "from-top-jerk":
            tween = TweenMax.from(elem, speedspeed, { y: '-100px', opacity: 0, ease: Back.easeInOut, delay: delay });
            break;
          case "from-bottom":
            tween = TweenMax.from(elem, speed, { y: '100px', opacity: 0, ease: ease, delay: delay });
            break;
          case "from-bottom-jerk":
            tween = TweenMax.from(elem, speed, { y: '100px', opacity: 0, ease: Back.easeInOut, delay: delay });
            break;
          case "from-left":
            tween = TweenMax.from(elem, speed, { x: '-100px', opacity: 0, ease: ease, delay: delay });
            break;
          case "from-left-jerk":
            tween = TweenMax.from(elem, speed, { x: '-100px', opacity: 0, ease: Back.easeInOut, delay: delay });
            break;
          case "from-right":
            tween = TweenMax.from(elem, speed, { x: '100px', opacity: 0, ease: ease, delay: delay });
            break;
          case "from-right-jerk":
            tween = TweenMax.from(elem, speed, { x: '100px', opacity: 0, ease: Back.easeInOut, delay: delay });
            break;
          case "from-bottom-elements-lazy":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { y: '100px', opacity: 0, ease: ease, delay: delay }, staggerOffset);
            break;
          case "from-bottom-elements-lazy-jerk":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { y: '100px', opacity: 0, ease: Back.easeInOut, delay: delay }, staggerOffset);
            break;
          case "from-left-elements-lazy":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { x: '-100px', opacity: 0, ease: ease, delay: delay }, staggerOffset);
            break;
          case "from-left-elements-lazy-jerk":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { x: '-100px', opacity: 0, ease: Back.easeInOut, delay: delay }, staggerOffset);
            break;
          case "from-right-elements-lazy":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { x: '100px', opacity: 0, ease: ease, delay: delay }, staggerOffset);
            break;
          case "from-right-elements-lazy-jerk":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { x: '100px', opacity: 0, ease: Back.easeInOut, delay: delay }, staggerOffset);
            break;
          case "from-top-elements-lazy":
            tween = TweenMax.staggerFrom($(elem).find('>*'), speed, { y: '-100px', opacity: 0, ease: ease, delay: delay }, staggerOffset);
            break;
          case "from-bottom-items-lazy":
            tween = TweenMax.staggerFrom($(elem).find('.animate-item'), speed, { y: '100px', opacity: 0, ease: ease, delay: delay }, staggerOffset);
            break;
          case "from-bottom-items-lazy-jerk":
            tween = TweenMax.staggerFrom($(elem).find('.animate-item'), speed, { y: '100px', opacity: 0, ease: Back.easeInOut, delay: delay }, staggerOffset);
            break;
          case "from-left-items-lazy":
            tween = TweenMax.staggerFrom($(elem).find('.animate-item'), speed, { x: '-100px', opacity: 0, ease: ease, delay: delay }, staggerOffset);
            break;
          case "from-left-items-lazy-jerk":
            tween = TweenMax.staggerFrom($(elem).find('.animate-item'), speed, { x: '-100px', opacity: 0, ease: Back.easeInOut, delay: delay }, staggerOffset);
            break;
          case "cover-anim-front":
            tween = new TimelineMax()
            tween.from($(elem), speed, {autoAlpha: 0, ease: Power0.easeNone})
            .from($(elem).find('.content-holder'), 0.5, {autoAlpha: 0, ease: Power0.easeNone})
            .from($(elem).find('.logo-holder'), 1, {autoAlpha: 0, y: -100, ease: ease},1)
            .staggerFrom($(elem).find('.title-holder span>span'), 1, {autoAlpha: 0, y: 100, ease: ease},0.1,1.2)
            .from($(elem).find('.title-holder hr'), 0.5, {scaleX: 0, transformOrigin:"left center", ease: ease},1.5)
            .from($(elem).find('.title-holder p'), 0.5, {y: 100, autoAlpha:0, ease: ease},1.4)
            .staggerFrom($(elem).find('.article-holder>*'), 0.5, {y: 100, autoAlpha:0, ease: ease},0.1,1.6)
            .from($(elem).find('.foot-note'),0.5,{autoAlpha: 0})
            .from($(elem).find('.profile-label'),0.5,{autoAlpha: 0, y: 50, ease: ease})
            .add(UB.imageGridAnimationX($(elem).find('.cover-holder'), 'to-right'),1.6)
            .add(UB.circleProgressAnimation($(elem).find('.progress-circle')),1.6)
            
            
            //.staggerFrom($(elem).find('.grid:nth-child(2),.grid:nth-child(3)'),1,{autoAlpha: 0},0.2,2.6)
            //.from($(elem).find('.ub-logo-holder'),0.5,{autoAlpha:0})
            break;
          case "article-animation-a":
            tween = new TimelineMax()
            tween.staggerFrom($(elem).find('.article-holder > *'),speed, {autoAlpha: 0, y: 100, ease: ease},staggerOffset)
            .from($(elem).find('hr'), 0.5, {scaleX: 0, transformOrigin:"left center", ease: ease},0.5)
            .from($(elem).find('.foot-note'), speed, {autoAlpha: 0}, 0.6)

            break;
          case "image-grid-animation":
            tween = new TimelineMax({delay: delay})
            tween.add(UB.imageGridAnimationX($(elem).find('.grid:nth-child(1)'), 'to-left'))
            .add(UB.imageGridAnimationX($(elem).find('.grid:nth-child(4)'), 'to-right'),0.4)
            .add(UB.imageGridAnimationX($(elem).find('.grid:nth-child(2)'), 'to-right'),0.9)
            .add(UB.imageGridAnimationX($(elem).find('.grid:nth-child(3)'), 'to-left'),1.4)
            .from($(elem).find('.ub-logo-holder'),0.5,{autoAlpha:0},0)
            tween.timeScale(1.5)
            break;
          default:
            tween = '';
        };

        new ScrollMagic.Scene({ triggerElement: triggerElem, triggerHook: hook, offset: offset, duration: duration, reverse: false })
          .setTween(tween)
          .addTo(controller);


      })
    },


    // main nav animation
    navigationTrigger () {
      let trigger = $('.hamburger-menu'),
      nav = $('#main-navigation')
      

      trigger.on('click', function(){
        
        if(!$('body').hasClass('navigation-open')) {
          UB.openNavigation()
        } else {
          UB.closeNavigation()
        }
      })
    },

    openNavigation() {
      let tl = new TimelineMax(),
      nav = $('#main-navigation')
      $('body').addClass('navigation-open')
          tl.to($(nav).find('.navigation-holder'),0.5,{scaleX:1, ease: Power2.easeOut, overwrite:'all'})
          .staggerTo($(nav).find('.nav-list li'),0.5,{x: 0, ease: Power2.easeOut, autoAlpha:1, overwrite:'all'},0.1,0.2)
    },

    closeNavigation() {
      let tl = new TimelineMax(),
      nav = $('#main-navigation')
      $('body').removeClass('navigation-open')
          tl.staggerTo($(nav).find('.nav-list li'),0.5,{x: 200, ease: Power2.easeOut, autoAlpha:0, overwrite:'all'},-0.1)
          .to($(nav).find('.navigation-holder'),0.5,{scaleX:0, ease: Power2.easeOut, overwrite:'all'},0.2)
    },

    // Smooth scrolls
    smoothScrolls() {
      $('a.anchor-link[href*="#"]:not([href="#"])').click(function() {
        if($('body').hasClass('navigation-open')){
          UB.closeNavigation() // Closing nav if opened
        }
        
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

          var offset = 0
          if($(this).data('offset-more')){
            offset = 500
          }
          if (target.length) {
            $('html, body').animate({
              scrollTop: (target.offset().top - offset)
            }, 500);
            return false;
          }
        }
      });
    },

    fullPageSliders() {
      this.settings.fullpage = new fullpage('#main-pages', {
              navigation: true,
              licenseKey: '735103E9-29F44E00-854468F3-C91D0430',
              responsiveWidth: 768,
              scrollOverflow: true,
              //anchors: ['home', 'about-us', 'contact'],
              parallax: true,
              onLeave: function(origin, destination, direction){
                  console.log("Leaving section" + origin.index);
              },
          });
    },

    popupGallery(){
      $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        callbacks: {
          elementParse: function(item) {
            // Function will fire for each target element
            // "item.el" is a target DOM element (if present)
            // "item.src" is a source that you may modify
            console.log(item.el.context.dataset.type);
            if(item.el.context.dataset.type == 'video') {
              item.type = 'iframe',
              item.iframe = {
                 patterns: {
                   youtube: {
                     index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).

                     id: 'v=', // String that splits URL in a two parts, second part should be %id%
                      // Or null - full URL will be returned
                      // Or a function that should return %id%, for example:
                      // id: function(url) { return 'parsed id'; } 

                     src: '//www.youtube.com/embed/%id%?autoplay=1' // URL that will be set as a source for iframe. 
                   },
                   vimeo: {
                     index: 'vimeo.com/',
                     id: '/',
                     src: '//player.vimeo.com/video/%id%?autoplay=1'
                   },
                   gmaps: {
                     index: '//maps.google.',
                     src: '%id%&output=embed'
                   }
                 }
              }
            } else {
               item.type = 'image',
               item.tLoading = 'Loading image #%curr%...',
               item.mainClass = 'mfp-img-mobile',
               item.image = {
                 tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
               }
            }

          }
        },
        gallery: {
          enabled: true,
          navigateByImgClick: true,
          preload: [0,1] // Will preload 0 - before current, and 1 after the current image
        }
        
      });
    },

    accordian() {
      let aTrigger = document.querySelectorAll('.accordian-trigger'),
        aPanel = document.querySelectorAll('.accordian-panel'),
        expandAll = $('.expand-all'),
        ease = 'swing',
        duration = 500,
        reset = function(wrapper) {
          let triggers = $(wrapper).find('.accordian-trigger'),
            panels = $(wrapper).find('.accordian-panel'),
            items = $(wrapper).find('.accordian-item')

          triggers.removeClass('active')
          items.removeClass('active')
          panels.removeClass('active')
          // panels.each(function() {
          //   TweenLite.to($(this), 0.8, { maxHeight: 0, ease: Power3.easeInOut })
          // })
          panels.slideUp(duration,ease)
        }
      // Searching for active panel
      aPanel.forEach(panel => {
        if (panel.classList.contains('active')) $(panel).show()
      })


      aTrigger.forEach(trigger => {
        trigger.addEventListener('click', function() {
          //reset()
          let panel = this.nextElementSibling
          if (this.classList.contains('active')) {
            this.classList.remove('active')
            $(this).closest('.accordian-item').removeClass('active')
            $(panel).removeClass('active')
            $(panel).slideUp(duration,ease)
          } else {
            reset($(this).closest('.accordian-wrapper'))
            let wrapperPanel = $(this).closest('.accordian-panel')
            this.classList.add('active')
            $(this).closest('.accordian-item').addClass('active')
            $(panel).addClass('active')
            $(panel).slideDown(duration,ease,function(){
              if($(trigger).hasClass('quick-link-title')){
                return
              }
              //$('html,body').animate({scrollTop: $(trigger).offset().top - 100},'fast')
            })
           //  TweenLite.to(panel, 0.8, { overwrite: "all", maxHeight: panel.scrollHeight, ease: Power3.easeInOut, onComplete: function(){
              
           //    if(wrapperPanel.length){
           //      console.log(wrapperPanel[0].scrollHeight)
           //      TweenLite.to(wrapperPanel,0.5,{overwrite: "all", maxHeight: wrapperPanel[0].scrollHeight})
           //    }
           //   } 
           // })
            
          }

        })
      })

      expandAll.on('click', function(e){
        e.preventDefault()

        let parentAccordianWrapper = $(this).closest('.accordian-wrapper')

        if($(this).hasClass('expand-all')){
          parentAccordianWrapper.find('.accordian-panel').slideDown(duration,ease).addClass('active')
          parentAccordianWrapper.find('.accordian-item').addClass('active')
          parentAccordianWrapper.find('.accordian-trigger').addClass('active')
          $(this).removeClass('expand-all').addClass('collapse-all').html('Collapse all')
        } else {
          parentAccordianWrapper.find('.accordian-panel').slideUp(duration,ease).removeClass('active')
          parentAccordianWrapper.find('.accordian-item').removeClass('active')
          parentAccordianWrapper.find('.accordian-trigger').removeClass('active')
          $(this).addClass('expand-all').removeClass('collapse-all').html('Expand all')
        }
        

        
      })


    }
  }

  UB._init()

  window.UB = UB

})()
