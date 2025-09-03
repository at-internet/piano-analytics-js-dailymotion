class paDailymotionPlayer {
  // settings it true as default for first video
  isVideoEnded = true;
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
    this.paCustomParams.av_content_id = state.videoId;
    this.paCustomParams.av_content = state.videoTitle;
    this.paCustomParams.av_content_duration = state.videoDuration * 1000;
    this.videoMedia.setProps(this.paCustomParams);
    // to check pause state
    this.playbackPaused = true;
    // to control first play event
    this.firstPlayEvent = true;
    // to control first playbackStart event
    this.firstPlaybackStartEvent = true;
    // to save old Cursor Position at seek start
    this.oldCursorPosition = 0;
    // to check video end event when video change 
    this.isVideoEnded = false;
    // to check previous fullscreen on
    this.fullscreenOn = false;
    // to check volume change
    this.playerVolume = 0;
    // to check playback speed change
    this.playerPlaybackSpeed = 0;
    // to check video quality change
    this.videoQuality = "";
    // to set the value of ad end
    this.adEndTime = 0;
    // to track video time
    this.videoTime = 0;
  }
  onPlayerReady = (player) => {
    this.instanciatedPlayer = player;
    /**
     * Events related to player
     */
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_START,
      (state) => {
        this.avataginit(state);
        /*Testing :*/
        window.eventStart();
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_VIDEOCHANGE,
      (state) => {
        // Check if this is actually a new video or just a player reload
        const isNewVideo = !this.paCustomParams.av_content_id || this.paCustomParams.av_content_id !== state.videoId;

        // if video_end in case of user interaction
        if (!this.isVideoEnded && isNewVideo) {
          this.videoMedia.playbackStopped(this.videoTime * 1000);
        }

        // Only reinitialize if it's actually a new video
        if (isNewVideo) {
          this.avataginit(state);
        }
      }
    );
    /**
     * Events related to content video
     */
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_PLAY,
      (state) => {
        // if player is starting
        if (this.firstPlayEvent) {
          this.firstPlayEvent = false;
          this.videoMedia.play(state.videoTime * 1000);
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_BUFFERING,
      (state) => {
        // if ad end time and this event has same videoTime then ignore
        if (this.adEndTime && this.adEndTime === parseInt(state.videoTime)) return;
        /**
         * always send playbackPaused event before buffering start
         * before "playbackStart" no need to send playbackPaused event
         * if player is already paused state, no need to send pause event
         */
        if (!this.firstPlaybackStartEvent && !this.playbackPaused) {
          this.playbackPaused = true;
          this.videoMedia.playbackPaused(state.videoTime * 1000);
        }
        this.oldCursorPosition = state.videoTime * 1000;
        this.videoMedia.bufferStart(state.videoTime * 1000);
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_PLAYING,
      (state) => {
        // if already playing ignore it
        if (!this.playbackPaused) return;
        this.playbackPaused = false;
        if (this.firstPlaybackStartEvent) {
          // set player volume at start time
          this.playerVolume = state.playerIsMuted ? 0 : state.playerVolume.toFixed(1);
          // set playback speed at start time
          this.playerPlaybackSpeed = state.playerPlaybackSpeed;
          // set video quality at start time
          this.videoQuality = state.videoQuality;
          this.videoMedia.playbackStart(state.videoTime * 1000);
          this.firstPlaybackStartEvent = false;
        } else {
          this.videoMedia.playbackResumed(state.videoTime * 1000);
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_PAUSE,
      (state) => {
        this.playbackPaused = true;
        this.videoMedia.playbackPaused(state.videoTime * 1000);
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_END,
      (state) => {
        this.isVideoEnded = true;
        this.videoMedia.playbackStopped(state.videoTime * 1000);
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_SEEKSTART,
      (state) => {
        // if ad end time and this event has same videoTime then ignore
        if (this.adEndTime && this.adEndTime === parseInt(state.videoTime)) return;
        // if player already paused dont send pause event
        if (!this.playbackPaused) {
          this.playbackPaused = true;
          this.videoMedia.playbackPaused(state.videoTime * 1000);
        }
        this.oldCursorPosition = state.videoTime * 1000;
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_SEEKEND,
      (state) => {
        // if ad end time and this event has same videoTime then ignore
        if (this.adEndTime && this.adEndTime === parseInt(state.videoTime)) return;
        // do not send this evens before playback start event
        if (!this.firstPlaybackStartEvent) {
          this.videoMedia.seek(this.oldCursorPosition, state.videoTime * 1000);
        }
      }
    );
    // To track video time
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_TIMECHANGE,
      (state) => {
        this.videoTime = state.videoTime;
      }
    );
    /**
     * Contextual events : The following list of events is not taken 
     * into account in the calculation of media consumption times.
     * They are one-time contextual events
     */
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_PLAYBACKSPEEDCHANGE,
      (state) => {
        // do not send this evens before playback start event
        // do not send this event if playerPlaybackSpeed did not change
        if (!this.firstPlaybackStartEvent && (this.playerPlaybackSpeed !== state.playerPlaybackSpeed)) {
          this.playerPlaybackSpeed = state.playerPlaybackSpeed;
          this.videoMedia.setPlaybackSpeed(state.playerPlaybackSpeed);
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.AD_CLICK,
      (state) => {
        this.videoMedia.adClick();
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.AD_END,
      (state) => {
        this.adEndTime = parseInt(state.videoTime);
        if (state.adEndedReason === "skipped") {
          this.videoMedia.adSkip();
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_ERROR,
      (state) => {
        this.videoMedia.error(state.playerError && state.playerError.title);
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_PRESENTATIONMODECHANGE,
      (state) => {
        if (state.playerPresentationMode === "fullscreen") {
          this.fullscreenOn = true;
          this.videoMedia.fullscreenOn();
        } else if (this.fullscreenOn) {
          this.fullscreenOn = false;
          this.videoMedia.fullscreenOff();
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_QUALITYCHANGE,
      (state) => {
        // do not send this evens before playback start event
        // do not send this event if videoQuality did not change
        if (!this.firstPlaybackStartEvent && (this.videoQuality !== state.videoQuality)) {
          this.videoQuality = state.videoQuality;
          this.videoMedia.quality();
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.VIDEO_SUBTITLESCHANGE,
      (state) => {
        if (state.videoSubtitles) {
          this.videoMedia.subtitleOn();
        } else {
          this.videoMedia.subtitleOff();
        }
      }
    );
    this.instanciatedPlayer.on(dailymotion.events.PLAYER_VOLUMECHANGE,
      (state) => {
        let volume = state.playerIsMuted ? 0 : state.playerVolume.toFixed(1);
        // do not send this evens before playback start event
        // do not send this event if volume did not change
        if (!this.firstPlaybackStartEvent && (this.playerVolume !== volume)) {
          this.playerVolume = volume;
          this.videoMedia.volume();
        }
      }
    );
    /**
     * adding puase event when ad start
     */
    this.instanciatedPlayer.on(dailymotion.events.AD_START,
      (state) => {
        if (!this.playbackPaused) {
          this.playbackPaused = true;
          this.videoMedia.playbackPaused(state.videoTime * 1000);
        };
      }
    );
  }
}
const paDailymotionConnector = new paDailymotionPlayer();