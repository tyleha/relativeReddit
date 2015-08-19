///////////////
// Constants //
///////////////
//https://vis4.net/labs/multihue/#colors=white, yellow, deeppink, darkred|steps=25|bez=1|coL=1
var POSSIBLE_COLORS = ['#ffffff', '#fff8c6', '#ffedac', '#ffe29b', '#ffd88f', '#ffcb86', '#ffbf7f', '#ffb379', '#fda873', '#fa9c6f', '#f6916a', '#f28666', '#ed7b62', '#e86f5e', '#e26459', '#dc5954', '#d64e4f', '#ce4349', '#c63842', '#bf2d3a', '#b52232', '#ac1729', '#a20c1f', '#970311', '#8b0000'];
var ASSUMED_RATIO = 0.6;
var MAX_RATIO_POSSIBLE = 4;

var pointRegex = new RegExp(/(\d+)/);

var hoverDescriptions = [
  {value: -Infinity, text: 'Either boring or new'},
  {value: 0.3, text: 'An ordinary comment'},
  {value: ASSUMED_RATIO, text: 'Above average and worth reading'},
  {value: 1, text: 'Better than its parent comment'},
  {value: 1.5, text: 'A real zinger'},
  {value: 2, text: 'Brilliant stuff'},
  {value: 2.5, text: 'Transcendent. Call your Mom.'},
  {value: Infinity, text: ''},
];

///////////////
// Functions //
///////////////
function hoverText (ratio) {
  var idx = 0;
  var current = hoverDescriptions[0].value;
  var text = hoverDescriptions[0].text;
  while (ratio > current) {
    text = hoverDescriptions[idx].text;

    idx += 1;
    current = hoverDescriptions[idx].value;
  }
  return text;
}

/** Convert a number [0 1] to a color in  an array */
function fractionToColor (properFraction) {
  if (properFraction <= 0) {
    return '#ffffff'; //white
  } else if (properFraction > 1) {
    return POSSIBLE_COLORS[POSSIBLE_COLORS.length-1]; //last element
  }
  var idx = Math.floor(POSSIBLE_COLORS.length*properFraction);
  return POSSIBLE_COLORS[idx];
}

function parseScore(text) {
  return pointRegex.exec(text)[1]; //first match
}

function logMe(val) {
  return Math.log(val) / ASSUMED_LOG;
}

function getRatioColor(ratio, rawScore) {
  var decreasePowerBelow = 12;
  if (rawScore < decreasePowerBelow) {
    ratio = ratio * rawScore/decreasePowerBelow;
  }
  // map to 0 to 1 (expected to be in -MAX_RATIO_POSSIBLE to MAX_RATIO_POSSIBLE range)
  // number of times over expected ratio norm'd
  var normScore = (ratio - ASSUMED_RATIO) / MAX_RATIO_POSSIBLE;

  return fractionToColor(normScore);
}

function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16);}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16);}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16);}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h;}

function whiteOrBlackText(backgroundColorInHex) {
  var r = hexToR(backgroundColorInHex);
  var g = hexToG(backgroundColorInHex);
  var b = hexToB(backgroundColorInHex);

  var o = Math.round(((r * 299) + (g * 587) + (b * 114)) /1000);
  var color;
  if (o > 125) {
    color = 'black';
  } else {
    color = 'white';
  }
  return color;
}

//////////////////////
// Application Code //
//////////////////////
var allParentChains = $('.sitetable.nestedlisting').first().find('> .comment');

// For each top-level comment
allParentChains.each(function() {

  // For each subcomment for this top-level comment
  $(this).find('.score.unvoted').each(function(elem) {
    var t = $(this);
    // Find this comment's parent
    var parent = $(this).parents('.comment').eq(1).find('.score.unvoted').first();
    var thisScore = parseScore(t.text());

    // If we can find a parent score (i.e. aren't the first in a chain)
    if (parent.text()) {
      var parentScore = parseScore(parent.text());
      if (parentScore < 1) {
        parentScore = 1; //roughly handle really low vote counts
      }
      // Compute our ratio
      var ratio = thisScore/parentScore;
      // Deterime what color, if any, to show
      var backgroundColor = getRatioColor(ratio, thisScore);
      // Inject our badge.
      var lastScoreSpan = t.parent().find('.score.likes').first();
      $('<span>'+ ratio.toFixed(1) +'x</span>').insertAfter(lastScoreSpan).css({
        'background-color': backgroundColor,
        'cursor': 'default',
        'color': whiteOrBlackText(backgroundColor),
      }).addClass('relative-tag').attr('title', hoverText(ratio));
    }
  });
});
