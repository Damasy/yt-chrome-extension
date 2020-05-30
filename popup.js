/*################### dark/light mode #######################*/
let app = document.getElementById("app");
let darkCheck = document.getElementById('colored');
let darkTheme = darkCheck.checked ? true : false;

darkCheck.addEventListener('change', toggleLighDark);

function toggleLighDark(event) {
  if ((event && event.target.checked) || !event) {
    app.classList.add('dark');
    localStorage.setItem('theme', 'dark')
  } else if (event) {
    app.classList.remove('dark');
    localStorage.removeItem('theme')
  }
}

if (localStorage.getItem('theme')) {
  darkCheck.checked = true;
  toggleLighDark();
}

/*################### options messaging to content.js #######################*/

const initialOptions = {
  "enable": false,
  "like": false,
  // "refresh": false,
  // "replay": false,
  // "suggestion": false,
  "skip-ads": false,
  "low_quality": false,
  "auto-replay-off": false,
  "videos": []
}

const options = JSON.parse(localStorage.getItem('options')) || initialOptions;

let checkboxes = document.querySelectorAll('input');

function inputListeners() {

  if (localStorage.getItem('enabled')) {
    document.getElementById('enable').checked = true;
    const event = {
      target: {
        checked: false
      }
    };
    event.target.checked = true
    disableCheckboxes(event);
  }
  checkboxes.forEach(item => {
    if (item.getAttribute('id') !== 'colored' && item.getAttribute('id') !== 'enable') {
      item.addEventListener('change', addOption)
    } else if (item.getAttribute('id') == 'enable') {
      item.addEventListener('change', enableExtension)
    }
  });
}

inputListeners();

function enableExtension(event) {
  if (event) {
    options.enable = event.target.checked;
    disableCheckboxes(event);
  }
}

function addOption(event) {
  console.log(event.target.value, event.target.checked, 'event')
  if (event) {
    switch (event.target.value) {
      // case 'refresh':
      //   options.refresh = event.target.checked;
      //   break;
      // case 'replay':
      //   options.replay = event.target.checked;
      //   break;
      // case 'suggestion':
      //   options.suggestion = event.target.checked;
      //   break;
      case 'like':
        options.like = event.target.checked;
        break;
      case 'comment':
        options.comment = event.target.checked;
        break;
      case 'skip-ads':
        options['skip-ads'] = event.target.checked;
        break;
      case 'low-quality':
        options['low-quality'] = event.target.checked;
        break;
      default:
        options['auto-replay-off'] = event.target.checked;
        //auto-replay-off
        break;
    }
  }
}


function disableCheckboxes(event) {
  disableBtn(event)
  checkboxes.forEach(item => {
    if (item.getAttribute('id') !== 'colored' && item.getAttribute('id') !== 'enable') {
      item.disabled = event.target.checked;
      if (event.target.checked) {
        localStorage.setItem('enabled', true)
      } else {
        localStorage.removeItem('enabled');
      }
    }
  })
}

const runBtn = document.getElementById('execute');
const stopBtn = document.getElementById('stop');

function disableBtn(event) {
  if (event) {
    btn.disabled = event.target.checked;
  }
}

runBtn.addEventListener('click', startScript);
stopBtn.addEventListener('click', stopScript);

function toggleBtn(type) {
  if (type === 'run') {
    runBtn.style.display = 'none';
    stopBtn.style.display = 'block';
  } else {
    runBtn.style.display = 'block';
    stopBtn.style.display = 'none';
  }
}

function getVideos() {
  const channelId = document.getElementById('channelId').value || 'UCLLQBg52ZcRCy8DqoxAC3nQ';
  const apiKey = 'AIzaSyARH6PnePP0l_qJ1ZWUec4ckFzcnma_mJw';
  const apiUr = `https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=${channelId}&maxResults=25&key=${apiKey}`
  // let videoId, detailsURL;
  return fetch(apiUr)
}

const params = {
  active: true,
  currentWindow: true
}

function startScript() {
  options.enable = true;
  // get channel videos
  getVideos()
  .then(response => response.json())
  .then(data => {
    console.log(data, 'videos');
    videos = data.items;
    options.videos = videos;
    //save data
    localStorage.setItem('script_running', JSON.stringify(true));
    localStorage.setItem('options', JSON.stringify(options));
    // toggle button
    toggleBtn('run');
    // send data to tabs
    chrome.tabs.query(params, getTabs);
    function getTabs(tabs) {
      console.log(tabs, options, 'start');
      chrome.tabs.sendMessage(tabs[0].id, options);
    }
  });


}

function stopScript() {
  // const state = JSON.parse(localStorage['options'])
  options.enable = false;
  console.log(this, options, 'stop script')
  localStorage.setItem('script_running', JSON.stringify(false));
  localStorage.setItem('options', JSON.stringify(options));
  toggleBtn('stop');

  chrome.tabs.query(params, getTabs)

  function getTabs(tabs) {
    console.log(tabs, options, 'stop');
    chrome.tabs.sendMessage(tabs[0].id, options);
  }
}

(function setState() {
  const savedOptions = localStorage['options'] ? JSON.parse(localStorage['options']) : {};

  // checkboxes state
  // document.getElementById('refresh').checked = savedOptions.refresh;
  // document.getElementById('replay').checked = savedOptions.replay;
  // document.getElementById('suggestion').checked = savedOptions.suggestion;
  document.getElementById('like').checked = savedOptions.like;
  document.getElementById('comment').checked = savedOptions.comment;
  document.getElementById('low-quality').checked = savedOptions['low-quality'];
  document.getElementById('skip-ads').checked = savedOptions['skip-ads'];
  document.getElementById('auto-replay-off').checked = savedOptions['auto-replay-off'];

  // button state
  const script_running = localStorage['script_running'] ? JSON.parse(localStorage['script_running']) : false;
  if (script_running) toggleBtn('run');
  if (!script_running) toggleBtn('stop')
})();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message, sendResponse, 'content message');
  sendResponse({
    data: "I am fine, thank you. How is life in the background?"
  });
});