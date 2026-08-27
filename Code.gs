function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('YouTube Streaming Player')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}
