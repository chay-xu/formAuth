// layout page
KISSY.ready( function( S ) {
  // body...
  S.use("dom, node", function( S, Dom, Node ){
    var $ = Node.all;

    // function setHeight(){
    //  var headH = $(".head").outerHeight(),
    //    viewH = Dom.viewportHeight();

    //  $(".nav").css({height: viewH - headH});
    // }
    // setHeight();

    function subFixed( options ){
      var headH = $(".head").outerHeight(),
          scrollT = $(window).scrollTop(),
          viewH = Dom.viewportHeight();

      console.log( viewH );

      if( scrollT > headH ){
        $("#nav").addClass("navfixed");
      }else{
        $("#nav").removeClass("navfixed");
      }

      this._init( options );
    }
    subFixed.prototype = {
      _init: function( options ){
        var _self = this,
            this.options = options;

        this.$_ele = $( options.target );
      }
    }


    //$(window).on("scroll", setFixed);

    var href = document.location.href;

    //get query object
    function getQuery( url ){
      var obj = {};

      if( url.indexOf( "?" ) !== -1 ){
        var index =  url.indexOf( "?" ),
            str = index !== -1 ? url.substr( index+1 ) : url,
            strArr = str.split( "&" ),
            keyVal;

        S.each( strArr, function( item, j ){
          keyVal = item.split( "=" );
          obj[ keyVal[0] ] = keyVal[1];
        })
        // console.log(obj);
      }

      return obj;
    }
    //crumb templete
    function crumbTpl( ele ){
      var parentTxt = ele.parent('.nav-tab').first().text(),
          txt = ele.text(),
          html = '';

      html += '<li><a >首页</a><i>></i></li>';
      html += '<li><a >'+ parentTxt +'</a><i>></i></li>';
      html += '<li class="active">'+ txt +'</li>';

      //crumb
      $( ".w-breadcrumb" ).html( html );
    }

    $("#nav a").each(function( i ){
      var _self = $( this ),
          aHref = $(this).attr('href');

      if( aHref ){

        var tempHref = aHref.split( "?" );

        if( href.search( tempHref[0] ) !== -1 ){
          var urlObj = getQuery( document.location.search ),
              hrefObj = getQuery( aHref );

          // console.log(hrefObj);
          if( hrefObj[ 'prameter_type' ] ){

            /* 
             * location query
             */
            if( hrefObj[ 'prameter_type' ] == urlObj[ 'prameter_type' ] ){
              crumbTpl( _self );
              _self.addClass("nav-con-select");
            }
          }else{
            /* 
             * no location query
             */
            console.log(hrefObj);
            console.log(urlObj);
            if( hrefObj[ 'prameter_type' ] == urlObj[ 'prameter_type' ] ){
              crumbTpl( _self );
              _self.addClass("nav-con-select");
            }
          }
          
        };

      }
    })

  })
})