// https://carl-topham.com/theblog/post/creating-chrome-extension-uses-jquery-manipulate-dom-page/
// http://stackoverflow.com/questions/14068879/modify-html-of-loaded-pages-using-chrome-extensions

//https://vis4.net/labs/multihue/#colors=white, yellow, deeppink, darkred|steps=25|bez=1|coL=1
['#ffffff', '#fff8c6', '#ffedac', '#ffe29b', '#ffd88f', '#ffcb86', '#ffbf7f', '#ffb379', '#fda873', '#fa9c6f', '#f6916a', '#f28666', '#ed7b62', '#e86f5e', '#e26459', '#dc5954', '#d64e4f', '#ce4349', '#c63842', '#bf2d3a', '#b52232', '#ac1729', '#a20c1f', '#970311', '#8b0000']

var hsv2rgb = function(val, opacity) {
  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
  var h = Math.floor(val * 120);
  var s = val;
  var v = 1;
  var rgb, i, data = [];
  opacity = opacity || 1;

  // Ignore if below zero. (make white).
  if (s <= 0) {
    rgb = [v,v,v];
  } else {
    h = h / 120;

    data = [v*(1-s), v*(1-s*(h)), v*(1-s*(1-(h)))];
    rgb = [v, data[1], data[0]];

  }
  return 'rgba('+rgb.map(function(d) {
    return Math.round(d*255)
  }).join(', ') + ', ' + opacity + ')';
};

function whiteToRed(val) {
  var reddness = Math.floor(val * 255);
  return 'rgba(' + reddness + ', 0, 0, 1)';
}

const ASSUMED_RATIO = 0.5;
const ASSUMED_LOG = Math.log(1/ASSUMED_RATIO);

var pointRegex = new RegExp(/(\d+)/);
function parseScore(text) {
  return pointRegex.exec(text)[1]; //first match
}

function logMe(val) {
  return Math.log(val) / ASSUMED_LOG;
}

function whatColorAmI(ratio) {

  console.log('ratio', ratio)
  var numTimesOverExpected = logMe(ratio / ASSUMED_RATIO);
  // map to 0 to 1 (expected to be in -2 to 2 range)
  var _sc = numTimesOverExpected / 3;
  console.log('sc', _sc)
  return hsv2rgb(_sc, 0.5);
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


    var color = whatColorAmI(ratio);
    var newbie = t.after('<span>'+ ratio.toFixed(2) +'</span>');
    newbie.css('background-color', color);
  }

});



// var score = $('.comment').first().find('.score.unvoted').first().text()

// var $score = $('.comment').first().find('.score.unvoted').first()
// $score.append(color + ' ' + parseScore(score));
// $score.css('background-color', color);
