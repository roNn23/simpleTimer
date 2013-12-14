/*jslint browser: true, continue: true, nomen: true */
var SimpleTimer = (function() {
  'use strict';

  var self, timers, intervals, formElement, titleInput, submit, runningTimersMsg;

  self = SimpleTimer || {};

  intervals        = [];
  formElement      = {};
  titleInput       = {};
  submit           = {};
  runningTimersMsg = {};

  function stopTimer(timerID) {
    var endTime;

    clearInterval(intervals[timerID]);

    endTime = new Date().getTime();

    timers[timerID].endTime = endTime;

    writeTimers();

    updateTimers();
  }

  function deleteTimer(timerID) {
    timers.splice(timerID, 1);

    writeTimers();

    updateTimers();
  }

  function checkForStorageSupport() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      alert('browser not supported.');
      return false;
    }
  }

  function declareElements() {
    formElement = self.lib._('form', true);
    titleInput  = self.lib._('input[name="titleInput"]', true);
    submit      = self.lib._('input[type="submit"]', true);
  }

  function bindEvents() {
    self.lib.on('keyup', titleInput, function() {
      if (titleInput.value !== '') {
        submit.disabled = false;
      } else {
        submit.disabled = true;
      }
    });

    self.lib.on('click', submit, function(e) {
      e.preventDefault();
      startTimer();
    });
  }

  function resetForm() {
    titleInput = self.lib._('input[name="titleInput"]', true);
    titleInput.value = '';

    submit = self.lib._('input[type="submit"]', true);

    submit.disabled = true;
  }

  function startTimer() {
    var startTime, endTime, titleOfTimer, timerID, newTimer, timersLength;

    startTime    = new Date().getTime();
    endTime      = 0;
    titleOfTimer = getTitleOfTimer();

    newTimer = {
      'titleName': titleOfTimer,
      'startTime': startTime,
      'endTime': endTime
    };

    timers       = self.model.getTimers();
    timersLength = timers.push(newTimer);
    timerID      = timersLength - 1;

    writeTimers();
    resetForm();
    updateTimers();
  }

  function getTitleOfTimer() {
    var titleInput;

    titleInput = self.lib._('input#titleInput', true);

    return titleInput.value;
  }

  function startIntervalForTimer(timerID) {
    intervals[timerID] = setInterval(function() {
      showTimer(timerID);
    }, 20);
  }

  function showTimer(timerID) {
    var times, timerSpan;

    timerSpan = self.lib._('p#timer' + timerID + ' span', true);
    timerSpan.innerHTML = getFormatedTime(timerID);
  }

  function getFormatedTime(timerID) {
    var duration, timeString;

    duration = getDurationOfTimer(timerID);

    timeString =
      duration.hours + ':' +
      duration.minutes + ':' +
      duration.seconds + ':' +
      duration.milliseconds
    ;

    return timeString;
  }

  function getDurationOfTimer(timerID) {
    var timer, endTime, milliseconds, date, seconds, minutes, hours, duration;

    timer = timers[timerID];

    if(timer.endTime === 0)
      endTime = new Date().getTime();
    else
      endTime = timer.endTime;

    milliseconds = endTime - timer.startTime;
    date         = new Date(milliseconds);
    milliseconds = date.getMilliseconds();
    seconds      = date.getSeconds();
    minutes      = date.getMinutes();
    hours        = Math.floor(minutes / 60);

    duration = {
      'milliseconds': self.lib.twoDigits(milliseconds),
      'seconds': self.lib.twoDigits(seconds),
      'minutes': self.lib.twoDigits(minutes),
      'hours': self.lib.twoDigits(hours)
    }

    return duration;
  }

  function showRunningTimers() {
    var i, runningTimer, runningTimers;

    self.lib.empty('.runningTimers .timers');

    runningTimers = self.model.getRunningTimers();
    for (i = runningTimers.length - 1; i >= 0; i -= 1) {
      runningTimer = runningTimers[i];
      showRunningTimer(runningTimer);
    }
  }

  function showRunningTimer(runningTimer) {
    var timerHTML, timerElement, runningTimersHeadline;

    runningTimersHeadline = self.lib._('.runningTimers h3', true);

    timerHTML =
      'Timer "' + runningTimer.titleName + '": ' +
      '<span>' + getFormatedTime(runningTimer.timerID) + '</span> ' +
      '<a href="#" onclick="SimpleTimer.stop(' + runningTimer.timerID + ');">Stop</a>'
    ;

    timerElement = getTimerElement(
      runningTimer.timerID,
      timerHTML
    );

    self.lib.append('.runningTimers .timers', timerElement);
    startIntervalForTimer(runningTimer.timerID);
  }

  function showStoppedTimers() {
    var i, stoppedTimer, stoppedTimers;

    self.lib.empty('.finishedTimers .timers');

    stoppedTimers = self.model.getStoppedTimers();
    for (i = stoppedTimers.length - 1; i >= 0; i -= 1) {
      stoppedTimer = stoppedTimers[i];
      showStoppedTimer(stoppedTimer);
    }
  }

  function showStoppedTimer(stoppedTimer) {
    var timerHTML, timerElement, finishedTimersHeadline;

    finishedTimersHeadline = self.lib._('.finishedTimers h3', true);

    timerHTML =
      'Timer "' + stoppedTimer.titleName + '": ' +
      '<span>' + getFormatedTime(stoppedTimer.timerID) + '</span> ' +
      '<a href="#" onclick="SimpleTimer.delete(' + stoppedTimer.timerID + ');">Delete</a>'
    ;

    timerElement = getTimerElement(
      stoppedTimer.timerID,
      timerHTML
    );

    self.lib.append('.finishedTimers .timers', timerElement);
  }

  function clearIntervals() {
    var interval;

    for (var i = intervals.length - 1; i >= 0; i--) {
      interval = intervals[i];
      clearInterval(interval);
    };
  }

  function writeTimers() {
    self.dataHandler.set('timers', timers);
  }

  function updateTimers() {
    clearIntervals();
    timers = getTimers();

    showRunningTimers();
    showStoppedTimers();
  }

  function getTimerElement(timerID, timerHTML) {
    var timerElement;

    timerElement = document.createElement('p');
    timerElement.id = 'timer' + timerID;
    timerElement.innerHTML = timerHTML;

    return timerElement;
  }

  function getTimers() {
    var i, timers;

    timers = self.model.getTimers();

    return timers;
  }

  self.init = function() {
    if (!checkForStorageSupport())
      return;

    declareElements();

    bindEvents();

    updateTimers();
  };

  self.stop = function(timerID) {
    stopTimer(timerID);
  };

  self.delete = function(timerID) {
    deleteTimer(timerID);
  };

  return self;
}());

SimpleTimer.model = (function() {
  'use strict';

  var self = SimpleTimer || {};

  function isRunningTimer(timer) {
    if (timer.endTime === 0) {
      return true;
    }

    return false;
  }

  function isStoppedTimer(timer) {
    if (isRunningTimer(timer)) {
      return false;
    }

    return true;
  }

  self.getTimers = function() {
    var timers;

    timers = self.dataHandler.get('timers');

    if(typeof timers === 'undefined') {
      timers = [];
    }

    return timers;
  };

  self.getRunningTimers = function() {
    var timers, timer, runningTimers;

    timers = self.model.getTimers();

    runningTimers = [];
    for (var i = timers.length - 1; i >= 0; i--) {
      timer = timers[i];

      timer.timerID = i;
      if(isRunningTimer(timer)) {
        runningTimers.push(timer);
      }
    };

    return runningTimers;
  };

  self.getStoppedTimers = function() {
    var timers, timer, stoppedTimers;

    timers = self.model.getTimers();

    stoppedTimers = [];
    for (var i = timers.length - 1; i >= 0; i--) {
      timer = timers[i];
      timer.timerID = i;
      if(isStoppedTimer(timer)) {
        stoppedTimers.push(timer);
      }
    };

    return stoppedTimers;
  };

  return self;
}());

SimpleTimer.dataHandler = (function() {
  'use strict';

  var self = SimpleTimer || {};

  self.set = function(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    localStorage.setItem(key, value);
  };

  self.get = function(key) {
    var value;

    value = localStorage.getItem(key);

    if (!value) {
      return;
    }

    if (value[0] === '{' || value[0] === '[') {
      value = JSON.parse(value);
    }

    return value;
  };

  self.remove = function(key) {
    localStorage.removeItem(key);
  };

  self.clear = function() {
    localStorage.clear();
  };

  return self;
}());

SimpleTimer.lib = (function() {
  'use strict';

  var self = SimpleTimer || {};

  self._ = function(selector, getFirstFound) {
    if (getFirstFound === true)
      return document.querySelector(selector);
    else
      return document.querySelectorAll(selector);
  };

  self.on = function(event, elem, func) {
    elem.addEventListener(event, func, false);
  };

  self.addClass = function(className, elem) {
    elem.classList.add(className);
  };

  self.twoDigits = function(value) {
    if (value < 10)
     return '0' + value;

    return value;
  };

  self.insertAfter = function(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(
      newNode,
      referenceNode.nextSibling
    );
  };

  self.empty = function(selector) {
    var element;

    element = self._(selector, true);

    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  self.append = function(selector, elementToAppend) {
    var element;

    element = self._(selector, true);
    element.appendChild(elementToAppend);
  };

  return self;
}());

document.addEventListener('DOMContentLoaded', function() {
  SimpleTimer.init();
});