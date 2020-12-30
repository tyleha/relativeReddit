///////////////
// Constants //
///////////////

// https://vis4.net/labs/multihue/#colors=white, yellow, deeppink, darkred|steps=25|bez=1|coL=1
var POSSIBLE_COLORS = ['#ffffff', '#fff8c6', '#ffedac', '#ffe29b', '#ffd88f', '#ffcb86', '#ffbf7f', '#ffb379', '#fda873', '#fa9c6f', '#f6916a', '#f28666', '#ed7b62', '#e86f5e', '#e26459', '#dc5954', '#d64e4f', '#ce4349', '#c63842', '#bf2d3a', '#b52232', '#ac1729', '#a20c1f', '#970311', '#8b0000'];
var ASSUMED_RATIO = 0.6;
var MAX_RATIO_POSSIBLE = 4;

var pointRegex = new RegExp(/([-]{0,1}\d?[\d.k]+)/);

var hoverDescriptions = [
  {value: -Infinity, text: 'An ordinary comment'},
  {value: ASSUMED_RATIO, text: 'Better than its parent comment'},
  {value: 0.8, text: 'Above average, worth reading'},
  {value: 1, text: 'Outwitted the previous comment'},
  {value: 1.25, text: 'A solid zinger'},
  {value: 1.5, text: 'A sharp wit or a useful answer'},
  {value: 1.75, text: 'Somebody thought a while about this one'},
  {value: 2, text: 'Brilliant stuff'},
  {value: 3.0, text: 'Quite a wordsmith.'},
  {value: 4.0, text: 'Transcendent. Call your Mom.'},
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
  var match = pointRegex.exec(text)[1]; //first match
  if (match.indexOf('k') > 0) {
    return parseInt(match.split('k')[0])*1000;
  } else {
    return parseInt(match);
  }
}

function getRatioColor(ratio, rawScore) {
  var decreasePowerBelow = 12;
  if (rawScore < decreasePowerBelow) {
    ratio = ratio * Math.abs(rawScore)/decreasePowerBelow;
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

////////////////
// NEW REDDIT //
////////////////
const commentLevel = '_1RIl585IYPW6cmNXwgRz0J';
const commentScore = '_1rZYMD_4xY3gRcSS3p8ODO';

function getScore(element) {
  const scoreText = element.getElementsByClassName(commentScore)[0]?.innerText;
  if (!scoreText) { return; }
  if (scoreText.indexOf('k') > 0) {
    return parseFloat(scoreText.split('k')[0])*1000;
  } else {
    return parseInt(scoreText);
  }
}

function getLevel(element) {
  const levelText = element.getElementsByClassName(commentLevel)[0].innerText;
  // Reddit indexed as level 1 is top comment, move index to 0
  return parseInt(levelText.match(/level (\d+)/)[1]) - 1;
}

function isCommentDiv(element) {
  return element.getElementsByClassName(commentLevel).length !== 0;
}

function insertIcon(ratio, score, element, overrideText) {
  // Insert icon!
  const backgroundColor = getRatioColor(ratio, score);
  // Downvote button classes are inconsistent between different subreddit styles.
  const scoreDiv = element.querySelector('[data-click-id="downvote"]');
  const newElement = document.createElement('span');
  newElement.classList.add('relative-tag');
  newElement.innerHTML = overrideText ? overrideText : ratio.toFixed(1);
  newElement.setAttribute('style', `background-color:${backgroundColor}; color:${whiteOrBlackText(backgroundColor)};`);
  newElement.setAttribute('title', hoverText(ratio));
  scoreDiv.parentNode.insertBefore(newElement, scoreDiv.nextSibling);
}

function checkInitialLoadComments() {
  // Check initial load comments
  const parentCommentScores = [];
  bodyNode.querySelectorAll('div.Comment').forEach(element => {
    if (!isCommentDiv(element)) {
      return;
    }
    const score = getScore(element);
    const level = getLevel(element);
    // Even if score is NaN, we want to store it so that we are sure we're referring to the right comment
    // when we do a comparison, and not an older comment score that wasn't overwritten.
    parentCommentScores[level] = score;
    if (isNaN(score)) {
      // Score is not yet shown (may be a •)
      return;
    }
    if (level === 0) {
      // no ratio to show, top level comment
      return;
    }

    if (isNaN(parentCommentScores[level - 1])) {
      return;
    }
    //roughly handle really low/negative vote counts
    const ratio = score / Math.max(parentCommentScores[level - 1], 1);
    const relativeTagElement = insertIcon(ratio, score, element);
  });
}



///////////////////////////////////
// Dynamic new comment detection //
///////////////////////////////////

const observeCommentSectionForNewCommentsOptions = {
  subtree: true,
  childList: true,
}
const observeCommentSectionForNewComments = new MutationObserver((mutationList, observer) => {

  for (const mutation of mutationList) {
    // For mysterious Reactivity reasons of some kind, Reddit tends to want to re-draw the DOM after load
    // (silently, without any mutationobserver trigger since the diff is typically zero)
    // Watch for the removal of our nodes and re-add them if we have to (ugh).
    for (const element of mutation.removedNodes) {
      if (element.classList.contains('relative-tag')) {
        mutation.target.insertBefore(element, mutation.previousSibling.nextSibling)
      }
    }

    for (const element of mutation.addedNodes) {
      if (element.nodeType === Node.ELEMENT_NODE && element.nodeName === 'DIV') {
        // Test that this new element node is a comment and not something else
        if (!isCommentDiv(element)) {
          continue;
        }
        const level = getLevel(element);
        // Nothing to show for top level comments
        if (level === 0) {
          continue;
        }
        const score = getScore(element);
        if (isNaN(score)) {
          continue;
        }

        // Iterate up the comment div to find the nearest comment with a level one less than we
        // currently are. That is the comment to compare against.
        let parentCommentElement;
        let currentElement = element;
        let iterations = 1;
        // Don't look backwards more than 30 divs...if you gotta go back farther than that, you aren't
        // going to be a highly rated comment with a ratio above 1/10 anyways. Also defends against
        // an infinite loop and locking up your browser tab.
        const maxIterations = 30;

        while (parentCommentElement === undefined && iterations < maxIterations) {
          if (isCommentDiv(currentElement.previousSibling) && getLevel(currentElement.previousSibling) === level - 1) {
            parentCommentElement = currentElement.previousSibling;
          }
          // Didn't find parent element, advance
          currentElement = currentElement.previousSibling;
          iterations++;
        }
        // Show *something* if we wouldn't traverse all the way back just to find out it's 17/5000 ~= 0.
        if (iterations === maxIterations) {
          insertIcon(0, 0, element, '~0.0');
        }

        if (parentCommentElement) {
          const parentSore = getScore(parentCommentElement);
          if (isNaN(parentSore)) {
            // Score is not yet shown (may be a •)
            continue;
          }
          //roughly handle really low/negative vote counts
          const ratio = score / Math.max(parentSore, 1);
          insertIcon(ratio, score, element);
        }
      }
    }
  }
});


// Use MutationObserver to detect new comments exposed wtih show more
// Additionally, it seems that new Reddit sometimes reloads all comments so this code block will
// do the majority of the work of labeling comments
const commentSectionClass = '_2M2wOqmeoPVvcSsJ6Po9-V';
const observeMyBodyForNewCommentSections = new MutationObserver((mutationList, observer) => {
  for (const mutation of mutationList) {
    for (const element of mutation.addedNodes) {
      if (element.nodeType === Node.ELEMENT_NODE && element.nodeName === 'DIV' && element.classList.contains(commentSectionClass)) {
        checkInitialLoadComments();
        observeCommentSectionForNewComments.observe(element, observeCommentSectionForNewCommentsOptions);
      }
    }
  }
});
const bodyNode = document.querySelector('body');
// On initial pageload, reddit delivers a mostly complete body DOM including a comment node.
// Start observing that right away since you'll never observe a change on the body for initial load
if (bodyNode.getElementsByClassName(commentSectionClass).length) {
  checkInitialLoadComments();
  observeCommentSectionForNewComments.observe(bodyNode.querySelector(`.${commentSectionClass}`), observeCommentSectionForNewCommentsOptions);
}

const observerOptions = {
  childList: true,
  subtree: true,
  attributes: false,
}
observeMyBodyForNewCommentSections.observe(bodyNode, observerOptions);




/////////////////
// OLD REDDIT  //
/////////////////

// If we're on a page with comment table/section
if (document.querySelector('.sitetable.nestedlisting')) {
  Array.from(
    document.querySelector('.sitetable.nestedlisting').childNodes
  ).filter(n => n.classList.contains('comment')).forEach((comment) => {

    // For each subcomment for this top-level comment
    Array.from(comment.querySelectorAll('.score.unvoted')).forEach(element => {
      // Find this comment's parent
      const thisScore = parseScore(element.innerText);
      const parentScoreElem = element.closest('.comment').parentElement.closest('.comment')?.querySelector('.score.unvoted');
      if (parentScoreElem) {
        let parentScore = parseScore(parentScoreElem.innerText);
        if (parentScore < 1) {
          parentScore = 1; //roughly handle really low vote counts
        }
        // Compute our ratio
        const ratio = thisScore/parentScore;
        // Deterime what color, if any, to show
        const backgroundColor = getRatioColor(ratio, thisScore);
        // Inject our badge
        const target = element.parentElement.querySelector('.score.likes');
        const newElement = document.createElement('span');
        newElement.classList.add('relative-tag');
        newElement.innerHTML = ratio.toFixed(1);
        newElement.setAttribute('style', `background-color:${backgroundColor}; color:${whiteOrBlackText(backgroundColor)};`);
        newElement.setAttribute('title', hoverText(ratio));
        target.parentNode.insertBefore(newElement, target.nextSibling);
      }
    })
  });
}
