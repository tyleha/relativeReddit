# Relative Reddit Comments
Relatively ranking Reddit comments.

relativereddit 1.0.0

Released 19-Aug-2015

## Introduction
Reddit comment threads are hard to read. Relative Reddit makes great comments easy to spot within a thread by adding a color-coded badge next to each comment's score. The darker the color, the better the comment!

99% of Reddit comments are responses to other comments. That's what makes a conversation in Reddit. But there are nuggets of brilliance buried in these comment threads that we skim over because they are 2 or 3 levels deep. When someone responds to another comment with

* A witty joke or brilliant comeback
* A heartfelt story
* The answer to a question

you want to know about it. Relative Reddit will highlight these comments so that you can easily spot them as you scroll through a comment list.

Relative Reddit works by comparing a comment's score to the score of the comment that came before it. Typically, comments lose about half of their upvotes for each level they are from the top. Take the following example:

* (1,000 upvotes) <comment one>
    * (500 upvotes) <comment two>
        * (1,200 upvote) <comment three>

In this example, whatever was posted in the third comment is great content because it got 1.4x the number of upvotes that its parent comment got! For whatever reason, people love this comment. Relative Reddit makes it easy to spot such a comment when it comes along.

## Installation
RelativeReddit is presently only available for Chrome. Install the extension from the Chrome web store at [https://chrome.google.com/webstore/detail/lkkanogkeefbgmcjihgjmcginkjamkfp](https://chrome.google.com/webstore/detail/lkkanogkeefbgmcjihgjmcginkjamkfp).

The extension does not require any access to any personal data and won't ask you any questions. You can inspect the source
code here if you're curious what it does do.

## Questions and Issues

Please file any issues in this repository's issue tracker.

##### Known issues
There are no known issues at this time.

## License
Relative Reddit is licensed under the [MIT](http://opensource.org/licenses/MIT) license.
