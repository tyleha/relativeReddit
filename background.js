console.log('background.js')
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // read changeInfo data and do something with it
  // like send the new url to contentscripts.js
  console.log({changeInfo})
  if (changeInfo.url) {
    console.log('You went to a new tab called', changeInfo.url)
    chrome.tabs.sendMessage( tabId, {
      message: 'hello!',
      url: changeInfo.url
    })
  }
});