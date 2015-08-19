// https://carl-topham.com/theblog/post/creating-chrome-extension-uses-jquery-manipulate-dom-page/
// http://stackoverflow.com/questions/14068879/modify-html-of-loaded-pages-using-chrome-extensions

//https://vis4.net/labs/multihue/#colors=white, yellow, deeppink, darkred|steps=25|bez=1|coL=1
const POSSIBLE_COLORS = ['#ffffff', '#fff8c6', '#ffedac', '#ffe29b', '#ffd88f', '#ffcb86', '#ffbf7f', '#ffb379', '#fda873', '#fa9c6f', '#f6916a', '#f28666', '#ed7b62', '#e86f5e', '#e26459', '#dc5954', '#d64e4f', '#ce4349', '#c63842', '#bf2d3a', '#b52232', '#ac1729', '#a20c1f', '#970311', '#8b0000']


var ASSUMED_RATIO = 0.6;
var MAX_RATIO_POSSIBLE = 4;

/** Convert a number [0 1] to a color in  an array */
function fractionToColor (properFraction) {
  if (properFraction <= 0) {
    return '#FFF' //white
  } else if (properFraction > 1) {
    return POSSIBLE_COLORS[POSSIBLE_COLORS.length-1]; //last element
  }
  var idx = Math.floor(POSSIBLE_COLORS.length*properFraction);
  console.log('idx', idx)
  return POSSIBLE_COLORS[idx];
}

var pointRegex = new RegExp(/(\d+)/);
function parseScore(text) {
  return pointRegex.exec(text)[1]; //first match
}

function logMe(val) {
  return Math.log(val) / ASSUMED_LOG;
}

function getRatioColor(ratio, rawScore) {

  console.log('ratio', ratio)
  var decreasePowerBelow = 12
  if (rawScore < decreasePowerBelow) {
    ratio = ratio * rawScore/decreasePowerBelow;
    console.log('new ratio for score '+rawScore, ratio)
  }
  // map to 0 to 1 (expected to be in -MAX_RATIO_POSSIBLE to MAX_RATIO_POSSIBLE range)
  normScore = (ratio - ASSUMED_RATIO) / MAX_RATIO_POSSIBLE; // number of times over expected ratio norm'd

  console.log('normScore', normScore)
  return fractionToColor(normScore);
}

//////////////////////
// Application Code //
//////////////////////

var allParentChains = $('.sitetable.nestedlisting').first().find('> .comment');

allParentChains.each(function() {

  $(this).find('.score.unvoted').each(function(elem) {
    t = $(this);
    // p = $(this).closest('.comment')
    p = $(this).parents('.comment').eq(1);
    p2 = p.find('.score.unvoted').first();

    var thisScore = parseScore(t.text());
    if (p2.text()) {
      var parentScore = parseScore(p2.text());
      if (parentScore < 1) {
        parentScore = 1; //roughly handle really low vote counts
      }
      var ratio = thisScore/parentScore;


      var color = getRatioColor(ratio, thisScore);
      console.log('selecting color', color)

      var newbie = t.after('<span>'+ ratio.toFixed(2) +'</span>');
      newbie.css('background-color', color);
    }

  });

});
