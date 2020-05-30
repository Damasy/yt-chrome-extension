chrome.runtime.onMessage.addListener(gotMessage);

let my_interval;

window.addEventListener("load", myMain, false);

function myMain(evt) {
  console.log(evt, 'content.js loaded')

  setTimeout(() => {
    const myCHannelLink = document.querySelector('#text.ytd-channel-name a.yt-simple-endpoint');
    // console.log(myCHannelLink, myCHannelLink.innerText, myCHannelLink.innerText === 'LEGO & Magnets', 'channelName');
    const options = localStorage['options'];
    // const options = JSON.parse(localStorage['options']);
    // (myCHannelLink.innerText === 'LEGO & Magnets')
    if (options) {
      gotMessage(JSON.parse(options), null, null);
    } else {
      chrome.runtime.sendMessage({
        data: "Hello popup, how are you"
      }, function (response) {
        console.dir(response);
      });
    }
  }, 3000);
}

// if(myCHannelLink.innerText)
function gotMessage(message, sender, response) {
  console.log(message, 'received')
  if (message && message.enable) {
    const videos = message.videos || [];
    const urls = channelVideos(videos);
    message.urls = urls;
    const index = localStorage['options'] ? Number(JSON.parse(localStorage['options'])['index']) || 0 : 0;
    const url = urls[index];
    localStorage.setItem('options', JSON.stringify(message));
    // let interval = localStorage['options'] ? +JSON.parse(localStorage['options'])['duration'] || 3000 : 3000;
    handleVideos(videos, index)
      .then(response => response.json())
      .then(data => {
        console.log(data, 'details');
        // const activeVideoData = activeVideo(data);
        // interval = convertDurationToMS(activeVideoData.duration);
        if (urls.every(url => url !== window.location.href)) {
          // visitVideo(url);
          // const link = document.querySelector('a.yt-simple-endpoint.ytd-compact-video-renderer');
          const link = null;
          if (link) {
            link.href = url;
            link.click();
          } else {
            visitVideo(url);
          }
          saveIndex(message, index)
        }
        console.log(url, message);
        // const intervalTime
        my_interval = setInterval(function () {
          console.log('working')
          // click on like button
          if (message.like && !document.querySelector('ytd-toggle-button-renderer.style-default-active[is-icon-button]')) {
            document.querySelector('a.yt-simple-endpoint.style-scope.ytd-toggle-button-renderer').click();
          }

          if (message['low-quality']) {
            // click on settigns icon
            if (document.querySelector('.ytp-settings-button')) {
              document.querySelector('.ytp-settings-button').click();
            }

            // click on quality item
            const settingsItems = document.querySelectorAll('.ytp-settings-menu .ytp-menuitem:not([aria-disabled=true])');
            if (settingsItems && settingsItems[settingsItems.length - 1]) {
              settingsItems[settingsItems.length - 1].click();
            }

            // click on 144 quality (last choice)
            const qualityList = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem:not([aria-disabled=true])');
            const quality_144 = 2;
            if (qualityList && qualityList[qualityList.length - quality_144]) {
              qualityList[qualityList.length - quality_144].click();
            }
            // const qualityInt = setInterval(() => {
            // }, 500);

            // setTimeout(() => {
            //   clearInterval(qualityInt);
            // }, 1500);

          }

          // click on the first suggested video
          // const overlayHere = document.querySelector('.ytp-ce-covering-overlay').parentElement.classList.contains('ytp-ce-element-show')
          // if (overlayHere && message.suggestion) {
          //   document.querySelector('.ytp-ce-covering-overlay').click();
          // }

          // click on replay
          if (document.querySelector('.ytp-play-button[title="Replay"]')) {
            // document.querySelector('.ytp-play-button[title="Replay"]').click();
            // visitVideo(url);
            // const link = document.querySelector('a.yt-simple-endpoint.ytd-compact-video-renderer');

            saveIndex(message, index);
            visitVideo(url);
          }

          // refresh page
          // if (message.refresh && document.querySelector('.ytp-play-button[title="Replay"]')) {
          //   window.location.reload();
          // }

          // skip ads
          if (message['skip_ads'] && document.querySelector('.ytp-ad-text.ytp-ad-skip-button-text')) {
            document.querySelector('.ytp-ad-text.ytp-ad-skip-button-text').click();
          }

          // disable autoplay
          if (message['auto-replay-off']) {
            const autoReplay = document.querySelector('#toggle.ytd-compact-autoplay-renderer');
            console.log(JSON.parse(autoReplay.getAttribute('aria-pressed')), 'aria-pressed')
            if (JSON.parse(autoReplay.getAttribute('aria-pressed'))) {
              autoReplay.click();
              // localStorage.removeItem('yt.autonav::autonav_disabled');
              // const data = JSON.stringify({ data: true });
              // localStorage.setItem('yt.autonav::autonav_disabled', data);
            }
          }
        }, 5000);
      });
  } else if (!message.enable) {
    clearInterval(my_interval);
    localStorage.removeItem('options');
  }
}

function saveIndex(message, index) {
  if (message) {
    if (message['urls']) {
      if (index < message.urls.length - 1) message.index = index + 1;
      else {
        index = 0;
        message.index = index;
      }
    }
  }
  localStorage.setItem('options', JSON.stringify(message));
  return index;
}

function convertDurationToMS(ISODuration) {
  let msDuration;
  if (ISODuration) {
    const seconds = +ISODuration.split('M')[1].split('S')[0] // split by minutes to get seconds

    const mins = +ISODuration.split('M')[0].split('PT')[1];

    msDuration = seconds * 1000 + mins * 60000;
  }

  return msDuration;
}

function activeVideo(data) {
  if (!data) return;
  const video = {
    duration: 0,
    id: '',
    thumb: '',
    title: '',
    statistics: {}
  };
  video.duration = data.items[0].contentDetails.duration
  video.id = data.items[0].id;
  video.thumb = data.items[0].snippet.thumbnails.medium.url;
  video.title = data.items[0].snippet.title;
  video.statistics = data.items[0].statistics;

  return video;
}

function channelVideos(videos) {
  const urls = [];
  const basicURL = 'https://www.youtube.com/watch?v=';
  videos.forEach(video => {
    if (video.id.videoId) urls.push(basicURL + video.id.videoId)
  });

  return urls;
}

function visitVideo(url) {
  window.location = url;
}

function handleVideos(videos, i = 0) {
  const videoId = videos[i].id.videoId;
  const urls = channelVideos(videos);
  // setInterval(() => {
  return getVideoDetails(videoId);
  // }, interval);
}

function getVideoDetails(videoId) {
  const apiKey = 'AIzaSyARH6PnePP0l_qJ1ZWUec4ckFzcnma_mJw';
  detailsURL = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics,status`;

  return fetch(detailsURL);
}