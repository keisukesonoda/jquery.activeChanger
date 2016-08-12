/**
 * コントローラーで前後アクティブ変更
 * ページャーで任意のアクティブ変更
 */
$.fn.activeChanger = function(options) {

  if( this.length === 0 ) return this;
  // support multiple elements
  if(this.length > 1) {
    this.each(function(){
      $(this).activeChanger(options);
    });
    return this;
  }

  // default parameters
  // ------------------
  var defaults = {
    controler: true,
    pager: true,
    delay: 0,
    duration: 4000,
    prevText: 'prev',
    nextText: 'next',
  };
  var changer = {};
  var $tgt = this;


  /**
   * 初期設定
   */
  var init = function(){
    changer.settings = $.extend({}, defaults, options);
    changer.children = $tgt.children();
    // 表示アイテム数より要素が少なければスルー
    if (changer.children.length <= 1 ) {
      $(changer.children[0]).addClass('active');
      return;
    }

    setup();
  };



  /**
   * wrapper / loading生成
   */
  var setup = function(){
    $tgt.wrap('<div class="changer-wrap">');
    changer.loader = $('<div class="loading">');
    changer.wrapper = $('.changer-wrap');
    changer.wrapper.prepend(changer.loader);

    start();
  };



  /**
   * ループ開始
   */
  var start = function(){
    changer.params = {
      now: 0,
      max: changer.children.length,
      delay: changer.settings.delay,
      duration: changer.settings.duration,
    };

    // コントローラー生成
    if (changer.settings.controler) createController();
    // ページャー生成
    if (changer.settings.pager) createPager()
    // 最初の要素にactiveクラス付与
    changer.children.eq(0).addClass('active');
    // params.delay後にループ開始
    setTimeout(action, changer.params.delay);
  };



  /**
   * コントローラー生成
   */
  var createController = function(){
    changer.wrapper.append('<div class="controlers">');
    changer.controler = changer.wrapper.find('.controlers');

    changer.controler.append('<p class="control prev">'+changer.settings.prevText+'</p>')
                     .append('<p class="control next">'+changer.settings.nextText+'</p>');

    changer.btns = changer.controler.find('.control');
    changer.prev = changer.controler.find('.prev');
    changer.next = changer.controler.find('.next');

    changer.wrapper.css('position', 'relative');

  };



  /**
   * ページャー生成
   */
  var createPager = function() {
    changer.wrapper.append('<div class="pager">');
    changer.pager = changer.wrapper.find('.pager');

    var i = 0, len = changer.children.length;
    for (i; i < len; i++) {
      changer.pager.append('<span class="pageNum">'+i+'</span>')
    }

    changer.nums = changer.pager.find('.pageNum');

    changer.nums.first().addClass('current');
  }


  /**
   * ループ / 各ボタンをクリック時の挙動
   */
  var action = function(){

    /**
     * ループ処理
     */
    var intervalID = setInterval(loop, changer.params.duration);

    changer.loadFlg = true;
    changer.btnFlg = true; // for button change

    function changeActive(now, next) {
      var $now  = $(changer.children[changer.params.now]),
          $next = $(changer.children[next]);

      $now.removeClass('active');
      $next.addClass('active');
      $(changer.children).css('opacity', 1);

      // ページャーがある場合はcurrentクラスを付与
      if (changer.settings.pager) {
        var $pnow  = $(changer.nums[changer.params.now]),
            $pnext = $(changer.nums[next]);
        $pnow.removeClass('current');
        $pnext.addClass('current');
      }
    }




    function loop(){
      var next = changer.params.now >= changer.params.max-1 ? 0 : changer.params.now+1;

      changeActive(changer.params.now, next);

      changer.loadFlg = false;
      changer.btnFlg = true;

      if (changer.params.now >= changer.params.max-1) {
        changer.params.now = 0;
      } else {
        changer.params.now++;
      }
    }


    /**
     * コントローラークリック処理
     */
    if (changer.settings.controler) {
      changer.btns.on({
        click: function(e){
          e.preventDefault();

          if( changer.btnFlg ) {
            changer.btnFlg = false;

            // スライダを一時停止
            clearInterval(intervalID);

            var index = changer.btns.index(this);
            var next;
            switch (index) {
              case 0: // prev
                next = changer.params.now === 0 ?
                       changer.params.max-1 :
                       changer.params.now-1;
              break;

              case 1: // next
                next = changer.params.now >= changer.params.max-1 ?
                       0 :
                       changer.params.now+1;
              break;
            }

            changeActive(changer.params.now, next);

            switch (index) {
              case 0: // prev
                if (changer.params.now === 0) {
                  changer.params.now = changer.params.max-1;
                } else {
                  changer.params.now--;
                }
              break;

              case 1: // next
                if (changer.params.now >= changer.params.max-1) {
                  changer.params.now = 0;
                } else {
                  changer.params.now++;
                }
              break;
            }

            intervalID = setInterval(loop, changer.params.duration);
            changer.btnFlg = true;

          } else {
            return false;
          }
        }
      });
    }

    /**
     * ページャークリック処理
     */
    if (changer.settings.pager) {
      changer.nums.on({
        click: function(e) {
          e.preventDefault();

          if( changer.btnFlg ) {
            changer.btnFlg = false;

            // スライダを一時停止
            clearInterval(intervalID);

            var i = changer.nums.index(this);
            changeActive(changer.params.now, i);

            changer.params.now = i;

            intervalID = setInterval(loop, changer.params.duration);
            changer.btnFlg = true;

          } else {
            return false;
          }

        }
      })

    }

  };

  init();
};