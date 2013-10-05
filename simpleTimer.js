simpleTimer = {

  startTime: 0,
  endTime: 0,

  init: function() {
    var self = this;

    if(!self.checkForStorageSupport())
      return;

    submit = self.lib._('input[type="submit"]');

    self.lib.on('click', submit[0], function(e) {
      e.preventDefault();
      self.startTimer();
    });
  },

  startTimer: function() {
    var self = this;

    self.startTime = new Date().getTime();

    form = self.lib._('form');
    self.lib.addClass('fadeOut', form[0]);

    self.interval = setInterval(function() {
      self.showTimer();
    }, 20);
  },

  showTimer: function() {
    var self = this;

    self.endTime = new Date().getTime();

    duration = self.getDuration();

    timeP = self.lib._('p.showTimer');
    timeP[0].innerHTML = duration.hours + ':' + duration.minutes + ':' + duration.seconds + ':' + duration.milliseconds;

    milliseconds = self.endTime - self.startTime;
    console.log(milliseconds);
  },

  stop: function() {
    var self = this;

    self.stopTimer();
  },

  stopTimer: function() {
    var self = this;

    clearInterval(self.interval);

    self.endTime = new Date().getTime();

    duration = self.getDuration();

    timeP = self.lib._('p.time');
    timeP[0].innerHTML = duration.hours + ':' + duration.minutes + ':' + duration.seconds;
    self.lib.addClass('fadeIn', timeP[0]);
  },

  getDuration: function() {
    var self = this;

    milliseconds = self.endTime - self.startTime;

    var date = new Date(milliseconds);
    milliseconds = date.getMilliseconds();
    seconds = date.getSeconds();
    minutes = date.getMinutes();
    hours = Math.floor(minutes / 60);

    console.log(milliseconds);

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

    _: function(selector) {
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
    }

  }

}

document.addEventListener('DOMContentLoaded', function() {
  simpleTimer.init();
});