// https://carl-topham.com/theblog/post/creating-chrome-extension-uses-jquery-manipulate-dom-page/
// http://stackoverflow.com/questions/14068879/modify-html-of-loaded-pages-using-chrome-extensions

var hsv2rgb = function(val, opacity) {
  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
  var h = Math.floor((100 - val) * 120 / 100);
  var s = Math.abs(val - 50)/50;
  var v = 1;
  var rgb, i, data = [];
  opacity = opacity || 1;

  if (s === 0) {
    rgb = [v,v,v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
    switch(i) {
      case 0:
        rgb = [v, data[2], data[0]];
        break;
      case 1:
        rgb = [data[1], v, data[0]];
        break;
      case 2:
        rgb = [data[0], v, data[2]];
        break;
      case 3:
        rgb = [data[0], data[1], v];
        break;
      case 4:
        rgb = [data[2], data[0], v];
        break;
      default:
        rgb = [v, data[0], data[1]];
        break;
    }
  }
  return 'rgba('+rgb.map(function(d) {
    return Math.round(d*255)
  }).join(', ') + ', ' + opacity + ')';


  // return '#' + rgb.map(function(x){
  //   return ("0" + Math.round(x*255).toString(16)).slice(-2);
  // }).join('');
};


var pointRegex = new RegExp(/(\d+) points/);
function parseScore(text) {
  return pointRegex.exec(text)[1]; //first match
}



//////////////////////
// Application Code //
//////////////////////


var firstCommentGroup = $('.comment').first();

firstCommentGroup.find('.score.unvoted').each(function(elem) {
  t = $(this);
  // p = $(this).closest('.comment')
  p = $(this).parents('.comment').eq(1);
  p2 = p.find('.score.unvoted').first();

  var thisScore = parseScore(t.text());
  if (p2.text()) {
    var parentScore = parseScore(p2.text());
    var ratio = thisScore/parentScore;


    var color = hsv2rgb(20*ratio + 50, 0.5);
    var newbie = t.after('<span>'+ ratio.toFixed(2) +'</span>');
    newbie.css('background-color', color);
  }

});



// var score = $('.comment').first().find('.score.unvoted').first().text()

// var $score = $('.comment').first().find('.score.unvoted').first()
// $score.append(color + ' ' + parseScore(score));
// $score.css('background-color', color);
