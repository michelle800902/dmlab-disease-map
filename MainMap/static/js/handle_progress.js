function start_pg(){
    $("#overlay").show();

    // =================================================================
    // Set progress
    // ref
    //    http://progressbarjs.readthedocs.io/en/latest/api/parameters/
    //    https://jsfiddle.net/kimmobrunfeldt/72tkyn40/
    function center_pg(){
        $("#pg").css( "left", $(window).width()/2  - $("#pg").width()/2 );
        $("#pg").css( "top",  $(window).height()/2 - $("#pg").height()/2 );
    }
    center_pg();
    window.onresize = function(){
        center_pg();
    }
    if( bar !== null && bar !== undefined ){
        bar.destroy();    
    }
    // bar = new ProgressBar.Circle('#pg', {
    //   color: '#20B2AA',
    //   // This has to be the same size as the maximum width to
    //   // prevent clipping
    //   strokeWidth: 4,
    //   trailWidth: 2,
    //   easing: 'easeInOut',
    //   duration: 1400,
    //   text: {
    //     autoStyleContainer: false
    //   },
    //   from: { color: '#8FBC8F', width: 4 },
    //   to: { color: '#20B2AA', width: 4 },
    //   // Set default step function for all animate calls
    //   step: function(state, circle) {
    //     circle.path.setAttribute('stroke', state.color);
    //     circle.path.setAttribute('stroke-width', state.width);

    //     var value = Math.round(circle.value() * 100);
    //     if (value === 0) {
    //       circle.setText('');
    //     } else {
    //       circle.setText(value);
    //     }

    //   }
    // });
    bar = new ProgressBar.SemiCircle('#pg', {
      color: '#20B2AA',
      // This has to be the same size as the maximum width to
      // prevent clipping
      strokeWidth: 6,
      color: '#FFEA82',
      trailColor: '#eee',
      trailWidth: 4,
      easing: 'easeInOut',
      duration: 1400,
      svgStyle: null,

      text: {
        value: '',
        alignToBottom: false
      },
      from: {color: '#FFEA82', width: 4 },
      to: {color: '#ED6A5A', width: 4 },
      // Set default step function for all animate calls
      step: function(state, circle) {
        circle.path.setAttribute('stroke', state.color);
        circle.path.setAttribute('stroke-width', state.width);

        var value = Math.round(circle.value() * 100);
        if (value === 0) {
          circle.setText('');
        } else {
          circle.setText(value);
        }
        circle.text.style.color = state.color;
      }
    });
    
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '4rem';
    bar.set(0.0);
}


function refresh_pg(){
    var xhr = new window.XMLHttpRequest();
    // Download progress
    xhr.addEventListener("progress", function(evt){
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            // Do something with download progress
            // console.log(evt.loaded,evt.total,percentComplete);
            bar.set( percentComplete );
            if( percentComplete == 1 ){
                bar.destroy();
                bar = null;
            }
        }
    }, false);

    return xhr;
}

function stop_pg(){
    $("#overlay").hide();
}