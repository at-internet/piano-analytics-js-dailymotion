class paDailymotionPlayer {

  constructor() {
    this.paCustomParams = {}
  }

  set params(params) {
    this.paCustomParams = params
  }

  set media(media) {
    this.videoMedia = media
  }
  avataginit = (state) => {
    this.paCustomParams.av_content_id = state.videoId,
    this.paCustomParams.av_content = state.videoTitle,
    this.paCustomParams.av_content_duration = state.videoDuration,
    this.videoMedia.setProps(this.paCustomParams);
  }
  onPlayerReady = (player) => {
    this.instanciatedPlayer = player;
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_START,
      (state) => {
        this.avataginit(state)
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_VIDEOCHANGE,
      (state) => {
        this.avataginit(state)
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_PLAY,
      (state) => {
        if (this.previousPlayerStatePaused === true) {
          this.videoMedia.playbackResumed(state.videoTime*1000);
        } else {
          this.videoMedia.play(state.videoTime*1000);
          this.videoMedia.playbackStart(state.videoTime*1000);
       }}
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_PAUSE,
      (state) => {
        this.videoMedia.playbackPaused(state.videoTime*1000);
        this.previousPlayerStatePaused = true;
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_END,
      (state) => {
        this.videoMedia.playbackStopped(state.videoTime*1000);
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_BUFFERING,
      (state) => {
        if (state.playerIsBuffering) {
          this.videoMedia.bufferStart(state.videoTime*1000);
        }
      }
    );
  }
}

const paDialymotionConnector = new paDailymotionPlayer();