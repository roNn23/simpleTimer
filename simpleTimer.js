simpleTimer = {

  timerID: 0,

  timers: [],
  intervals: [],

  formElement: {},
  titleInput: {},
  submit: {},

  init: function() {
    var self = this;

    if(!self.checkForStorageSupport())
      return;

    self.declareElements();

    self.bindEvents();
  },

  declareElements: function() {
    var self = this;

    self.formElement = self.lib._('form', true);
    self.titleInput  = self.lib._('input[name="titleInput"]', true);
    self.submit      = self.lib._('input[type="submit"]', true);
  },

  bindEvents: function() {
    var self = this;

    self.lib.on('keyup', self.titleInput, function() {
      if(self.titleInput.value != '')
        self.submit.disabled = false;
      else
        self.submit.disabled = true;
    });

    self.lib.on('click', self.submit, function(e) {
      e.preventDefault();
      self.startNewTimer();
    });
  },

  resetForm: function() {
    var self = this;

    self.titleInput = self.lib._('input[name="titleInput"]', true);
    self.titleInput.value = '';

    self.submit = self.lib._('input[type="submit"]', true);

    self.submit.disabled = true;
  },

  getTitleOfTimer: function() {
    var self = this;

    var titleInput;

    titleInput = self.lib._('input#titleInput', true);

    return titleInput.value;
  },

  startNewTimer: function() {
    var self = this;

    var startTime, titleOfTimer, timerID, newTimer;

    startTime = new Date().getTime();
    titleOfTimer = self.getTitleOfTimer();
    timerID = self.timerID++;

    newTimer = {
      'id': timerID,
      'titleName': titleOfTimer,
      'startTime': startTime,
      'endTime': 0
    };

    self.timers.push(newTimer);

    self.createNewTimer(timerID);

    self.startIntervalForTimer(timerID);

    self.resetForm();
  },

  createNewTimer: function(timerID) {
    var self = this;

    var form, timerElement;

    runningTimersHeadline = self.lib._('.runningTimers h3', true);
    runningTimersMsg = self.lib._('.runningTimers .emptyMessage', true);
    self.lib.addClass('hidden', runningTimersMsg);

    timerElement = document.createElement('p');
    timerElement.id = 'timer' + timerID;
    timerElement.innerHTML =
      'Timer "' + self.timers[timerID].titleName + '": ' +
      '<span>00:00:00:000</span> ' +
      '<a href="#" onclick="simpleTimer.stop(' + timerID + ');">Stop</a>'
    ;

    self.lib.insertAfter(runningTimersHeadline, timerElement);
  },

  startIntervalForTimer: function(timerID) {
    var self = this;

    self.intervals[timerID] = setInterval(function() {
      self.showTimer(timerID);
    }, 20);
  },

  showTimer: function(timerID) {
    var self = this;

    times = self.getTimes(timerID);

    timerSpan = self.lib._('p#timer' + timerID + ' span', true);
    timerSpan.innerHTML =
      duration.hours + ':' +
      duration.minutes + ':' +
      duration.seconds + ':' +
      duration.milliseconds
    ;
  },

  stop: function(timerID) {
    var self = this;

    self.stopTimer(timerID);
  },

  stopTimer: function(timerID) {
    var self = this;

    clearInterval(self.intervals[timerID]);

    endTime = new Date().getTime();

    self.timers[timerID].endTime = endTime;

    finishedTimersHeadline = self.lib._('.finishedTimers h3', true);
    finishedTimersMsg = self.lib._('.finishedTimers .emptyMessage', true);

    timer = self.lib._('p#timer' + timerID, true);
    self.lib.insertAfter(finishedTimersHeadline, timer);

    self.lib.addClass('hidden', finishedTimersMsg);

    if(!self.isTimerRunning())
      runningTimersMsg.classList.remove('hidden');
  },

  isTimerRunning: function() {
    var self = this;

    for (var i = self.timers.length - 1; i >= 0; i--) {
      timerObj = self.timers[i];
      if(timerObj.endTime == 0)
        return true;
    };

    return false;
  },

  getTimes: function(timerID) {
    var self = this;

    endTime = new Date().getTime();

    milliseconds = endTime - self.timers[timerID].startTime;

    var date = new Date(milliseconds);
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
  },

  checkForStorageSupport: function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  },

  data: {

    add: function(key, value) {
      localStorage.setItem(key, value);
    },

    read: function(key) {
      localStorage.getItem(key);
    },

    remove: function(key) {
      localStorage.removeItem(key);
    },

    clear: function() {
      localStorage.clear();
    }

  },

  lib: {

    _: function(selector, getFirstFound) {
      if(getFirstFound == true)
        return document.querySelector(selector);
      else
        return document.querySelectorAll(selector);
    },

    on: function(event, elem, func) {
      elem.addEventListener(event, func, false);
    },

    addClass: function(className, elem) {
      elem.classList.add(className);
    },

    twoDigits: function(value) {
      if(value < 10)
       return '0' + value;

      return value;
    },

    insertAfter: function(referenceNode, newNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

  }

}

document.addEventListener('DOMContentLoaded', function() {
  simpleTimer.init();
});