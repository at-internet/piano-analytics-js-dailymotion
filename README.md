# Dailymotion - Piano Analytics plugin

The `Dailymotion` plugin enables you to track Dailymotion videos on your website with the Piano Analytics SDK. The plugin makes the tracking as simple as possible, while keeping all the flexibility of the AV Insights module.

By installing the JS library on your website and following the documentation below, you will be able to fully track Dailymotion videos. The plugin will automatically send contextual and technical events according to the media information provided.

It also includes a function enabling you to add your own properties to the events.

## Table of content

- Get started
- Install the plugin
- Reference our functions in the Dailymotion code
- Add properties to your events
- Complete tagging example

## Getting Started

- Load the `dailymotion-pa-connector.js` plugin in your project just after the `piano-analytics.js` library
- Read the documentation for an overview of the functionalities and examples
- Collect AV Insights events from your Dailymotion videos

## Install the plugin

Download the `dailymotion-pa-connector.js` plugin directly from [this repo](dailymotion-pa-connector.js) and install it along with the `piano-analytics.js` library.

```html
<script src="piano-analytics.js"></script>
<script type="text/javascript">
  pa.setConfigurations({
    // Basic configuration to send events
    site: 123456789,
    collectDomain: "https://xxxxxxx.pa-cd.com",
  });
</script>
<script src="dailymotion-pa-connector.js"></script>
```

## Reference our functions in the Dailymotion code

Dailymotion provides the following code to embed its video player on an HTML page ([Dailymotion Player API Reference](https://developers.dailymotion.com/player/))

```html
<script src="https://geo.dailymotion.com/libs/player/x1234.js"></script>
<div id="player-daily"></div>
<script type="text/javascript">
  if (window.dailymotion === undefined) {
    window.dailymotion = {
      onScriptLoaded: () => {
        dailymotion
          .createPlayer("player-daily", {
            video: "x730nnd",
          })
          .then((player) => {
            // Setup PA connector
          })
          .catch((e) => console.error(e));
      },
    };
  } else {
    window.dailymotion
      .createPlayer("player-daily", {
        video: "x730nnd",
      })
      .then((player) => {
        // Setup PA connector
      })
      .catch((e) => console.error(e));
  }
</script>
```

## Add properties to your events

The plugin supports the following events:

`av.play` / `av.start` / `av.heartbeat` / `av.pause` / `av.resume` / `av.stop `

The following properties are automatically set by the plugin.

| Property key        | Type    | Mandatory | Description                                              | Source                                                                          |
| ------------------- | ------- | --------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| av_content_id       | string  | yes       | Audio/Video content identifier                           | [`playerState.videoId`](https://developers.dailymotion.com/player/#state)       |
| av_content          | string  | -         | Title of the Audio/Video content                         | [`playerState.videoTitle`](https://developers.dailymotion.com/player/#state)    |
| av_content_duration | integer | -         | Total duration of the Audio/Video content (milliseconds) | [`playerState.videoDuration`](https://developers.dailymotion.com/player/#state) |

You can set additional properties using the `paDailymotionConnector.params` method:

Method: `paDailymotionConnector.params = <propertiesObject>`

| Parameter          | Type   | Mandatory                                  |
| ------------------ | ------ | ------------------------------------------ |
| `propertiesObject` | object | Pairs of `propertyKey` and `propertyValue` |

```html
<script>
  paDailymotionConnector.media = new pa.avInsights.Media(5, 5);
  paDailymotionConnector.params = {
    av_content_type: "TV show",
    av_content_genre: ["Crime", "Drama", "Mystery"],
    av_show: "Dark",
    av_publication_date: 15010656730,
  };
</script>
```

## Complete tagging example

```html
<html>
  <head>
    <title>My Page</title>
    <script src="piano-analytics.js"></script>
    <script type="text/javascript">
      pa.setConfigurations({
        // Basic configuration to send events
        site: 123456789,
        collectDomain: "https://xxxxxxx.pa-cd.com",
      });
    </script>
    <script src="dailymotion-pa-connector.js"></script>
  </head>
  <body>
    <script src="https://geo.dailymotion.com/libs/player/x1234.js"></script>
    <div id="player-daily"></div>
    <script type="text/javascript">
      function setupPaConnector(player) {
        paDailymotionConnector.media = new pa.avInsights.Media(5, 5);
        paDailymotionConnector.onPlayerReady(player);
        paDailymotionConnector.params = {
          av_content_type: "Video clip",
          av_content_genre: ["Medieval", "Rap", "Bardcore", "Tavernware"],
          av_author: "Eminem",
          av_publication_date: 1613516400,
        };
      }

      if (window.dailymotion === undefined) {
        window.dailymotion = {
          onScriptLoaded: () => {
            dailymotion
              .createPlayer("player-daily", {
                video: "x730nnd",
              })
              .then((player) => {
                setupPaConnector(player);
              })
              .catch((e) => console.error(e));
          },
        };
      } else {
        window.dailymotion
          .createPlayer("player-daily", {
            video: "x730nnd",
          })
          .then((player) => {
            setupPaConnector(player);
          })
          .catch((e) => console.error(e));
      }
    </script>
  </body>
</html>
```
