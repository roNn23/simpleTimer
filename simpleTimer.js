var SimpleTimer = SimpleTimer || {};

simpleTimer = (function() {
  'use strict';

  var self = SimpleTimer || {};

  var
    recentTimerID = 0,
    timers        = [],
    intervals     = [],

    formElement      = {},
    titleInput       = {},
    submit           = {},
    runningTimersMsg = {}
  ;

  function stopTimer(timerID) {
    var endTime, finishedTimersHeadline, finishedTimersMsg, timer;

    clearInterval(intervals[timerID]);

    endTime = new Date().getTime();

    timers[timerID].endTime = endTime;

    finishedTimersHeadline = self.lib._('.finishedTimers h3', true);
    finishedTimersMsg = self.lib._('.finishedTimers .emptyMessage', true);

    timer = self.lib._('p#timer' + timerID, true);
    self.lib.insertAfter(finishedTimersHeadline, timer);

    self.lib.addClass('hidden', finishedTimersMsg);

    if(!self.isTimerRunning())
      runningTimersMsg.classList.remove('hidden');
  };

  function checkForStorageSupport() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  };

  function declareElements() {
    formElement = self.lib._('form', true);
    titleInput  = self.lib._('input[name="titleInput"]', true);
    submit      = self.lib._('input[type="submit"]', true);
  };

  function bindEvents() {
    self.lib.on('keyup', titleInput, function() {
      if(titleInput.value != '')
        submit.disabled = false;
      else
        submit.disabled = true;
    });

    self.lib.on('click', submit, function(e) {
      e.preventDefault();
      startNewTimer();
    });
  };

  function resetForm() {
    titleInput = self.lib._('input[name="titleInput"]', true);
    titleInput.value = '';

    submit = self.lib._('input[type="submit"]', true);

    submit.disabled = true;
  };

  function startNewTimer() {

    var startTime, titleOfTimer, timerID, newTimer;

    startTime = new Date().getTime();
    titleOfTimer = self.getTitleOfTimer();
    timerID = timers.length;

    newTimer = {
      'id': timerID,
      'titleName': titleOfTimer,
      'startTime': startTime,
      'endTime': 0
    };

    timers.push(newTimer);

    self.createNewTimer(timerID);

    self.startIntervalForTimer(timerID);

    resetForm();
  };

  self.init = function() {
    if(!checkForStorageSupport())
      return;

    declareElements();

    bindEvents();
  };

  self.getTitleOfTimer = function() {
    var titleInput;

    titleInput = self.lib._('input#titleInput', true);

    return titleInput.value;
  };

  self.createNewTimer = function(timerID) {

    var timerElement, runningTimersHeadline;

    runningTimersHeadline = self.lib._('.runningTimers h3', true);
    runningTimersMsg = self.lib._('.runningTimers .emptyMessage', true);
    self.lib.addClass('hidden', runningTimersMsg);

    timerElement = document.createElement('p');
    timerElement.id = 'timer' + timerID;
    timerElement.innerHTML =
      'Timer "' + timers[timerID].titleName + '": ' +
      '<span>00:00:00:000</span> ' +
      '<a href="#" onclick="simpleTimer.stop(' + timerID + ');">Stop</a>'
    ;


    self.lib.insertAfter(runningTimersHeadline, timerElement);
  };

  self.startIntervalForTimer = function(timerID) {
    intervals[timerID] = setInterval(function() {
      self.showTimer(timerID);
    }, 20);
  };

  self.showTimer = function(timerID) {
    var times, timerSpan;

    times = self.getTimes(timerID);

    timerSpan = self.lib._('p#timer' + timerID + ' span', true);
    timerSpan.innerHTML =
      times.hours + ':' +
      times.minutes + ':' +
      times.seconds + ':' +
      times.milliseconds
    ;
  };

  self.stop = function(timerID) {
    stopTimer(timerID);
  };

  self.isTimerRunning = function() {
    for (var i = timers.length - 1; i >= 0; i--) {
      var timerself;

      timerself = timers[i];
      if(timerself.endTime == 0)
        return true;
    };

    return false;
  };

  self.getTimes = function(timerID) {
    var endTime, milliseconds, date, seconds, minutes, hours, duration;

    endTime = new Date().getTime();

    milliseconds = endTime - timers[timerID].startTime;

    date = new Date(milliseconds);
    milliseconds = date.getMilliseconds();
    seconds = date.getSeconds();
    minutes = date.getMinutes();
    hours = Math.floor(minutes / 60);

    duration = {
      'milliseconds': self.lib.twoDigits(milliseconds),
      'seconds': self.lib.twoDigits(seconds),
      'minutes': self.lib.twoDigits(minutes),
      'hours': self.lib.twoDigits(hours)
    }

    return duration;
  };

  return self;
}())

SimpleTimer.dataHandler = (function() {
  'use strict';

  var self = SimpleTimer || {};

  self.add = function(key, value) {
    localStorage.setItem(key, value);
  };

  self.read = function(key) {
    localStorage.getItem(key);
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
    if(getFirstFound == true)
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
    if(value < 10)
     return '0' + value;

    return value;
  };

  self.insertAfter = function(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  };

  return self;
}());

document.addEventListener('DOMContentLoaded', function() {
  simpleTimer.init();
});