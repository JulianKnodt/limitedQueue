const sizeof = require('sizeof').sizeof;
const hashSimple = require('hash-it');
const LinkedList = require('linkedlist');
const MinHeap = require('./Heap');

const hookTemplate = {enqueue:{},dequeue:{},shrink:{},expand:{},squelch:{},dequeueInterval:{}};

class LimitedQueue {
  constructor(length, limitedQueue) {
    this.length = length || 10;
    this.storage = new LinkedList();
    if (limitedQueue) {
      while(limitedQueue.storage.length > this.length) {
        limitedQueue.storage.shift();
      }
      this.storage = limitedQueue.storage;
    }
    this.hooks = Object.assign({}, hookTemplate);
  }
  enqueue(item) {
    let old;
    if (this.storage.length === this.length) {
       old = this.storage.shift();
    }
    this._runHooks('enqueue', item);
    this.storage.push(item);
    return old ? old : undefined;
  }
  dequeue() {
    if (this.storage.length) {
      let out = this.storage.shift();
      this._runHooks('dequeue', out);
      return out;
    }
  }
  shrink(length) {
    if(length <= this.length) {
      this._runHooks('shrink', this.length);
      this.length = length;
      this._fitToLength();
    } else {
      this.expand(length);
    }
  }
  expand(length) {
    if(length > this.length) {
      this._runHooks('expand', this.length);
      this.length = length
    } else {
      this.shrink(length);
    }
  }
  _fitToLength() {
    while(this.storage.length > this.length) {
      this.storage.shift();
    }
  }
  size() {
    return this.storage.length;
  }
  clear() {
    delete this.storage;
    delete this.hooks;
    this.hooks = Object.assign({}, hookTemplate);
    this.storage = new LinkedList();
  }
  _min() {
    for(var i = 0; i < Math.ceil(this.length/100); i++) {
      this.storage.next();
      this.storage.removeCurrent();
    }
  }
  squelch(bytes) {
    if(sizeof(this.storage) + sizeof(new LinkedList()) > bytes/*Bytes*/) {
      while(sizeof(this.storage) > bytes) {
        this._min(); 
      }
      this._runHooks('squelch', this);
    }
  }
  on(key, callback) {
    if(this.hooks[key]) {
      var hashed = hashSimple(callback);
      this.hooks[key][hashed] = callback;
      return hashed;
    }
    return false;
  }
  off(key, hash) {
    delete this.hooks[key][hash];
  }
  _runHooks(key, item) {
    for(var hook in this.hooks[key]) {
      hook(item);
    }
  }
  dequeueInterval(time, callback) {
    if(this.size()) {
      setTimeout(() => {
        var next = this.dequeue;
        this._runHooks('dequeueInterval', next);
        callback ? callback(next) : '';
        this.dequeueInterval(time, callback);
      }, time);
    }
  }
  toArray() {
    var array = [];
    array.push(this.storage.head);
    var next = this.storage.next();
    while(next !== undefined) {
      array.push(next);
      next = this.storage.next();
    }
    this.storage.resetCursor();
    return array;
  }
}

class AutoQueue {
  constructor(limit, callback) {
    this.limit = limit;
    this.storage = new LinkedList();
    this.dequeuing = false;
    if(callback) {
      this.callback = callback;
    }
  }
  enqueue(...items) {
    
    for(let item of items) {
      this.storage.push(item);
    }
    if (this.limit <= this.storage.length && this.callback && !this.dequeuing) {
      this.dequeueAll(this.callback);
    }
  }
  onLimit(callback) {
    this.callback = callback;
  }
  offLimit() {
    delete this.callback;
  }
  clear() {
    delete this.storage;
    this.storage = new LinkedList();
    this.offLimit();
  }
  get length() {
    return this.storage.length;
  }
  dequeueAll(callback) {
    if(!callback) {
      callback = this.callback;
    }
    var nextItem = this.storage.shift();
    if (nextItem !== undefined) {
      this.dequeuing = true;
      callback(nextItem, (stop) => {
        if(!stop) {
          this._done(callback);
        } else {
          this.dequeuing = false;
        }
      });
    } else {
      this.dequeuing = false;
    }
  }
  changeLimit(value) {
    this.limit = value;
  }
  _done(callback) {
    this.dequeueAll(callback);
  };
}

class AutoQueueBalancer {
  constructor (callback, maxJobs) {
    this.storage = new MinHeap(aq => {
      return aq.length + (aq.dequeuing ? .5 : 0);
    });
    this.maxJobs = maxJobs || 5;
    this.callback = callback;
  }
  delegate (job) {
    if(this.storage[0]) {
      this.storage.sink(0);
    }
    if (this.storage.storage.length) {
      if (this.storage.peakVal >= this.maxJobs) {
        let taskRunner = new AutoQueue(this.maxJobs);
        taskRunner.enqueue(job);
        this.storage.push(taskRunner);
        taskRunner.dequeueAll(this.callback)
      } else {
        if(this.storage.peak.dequeuing) {
          this.storage.peak.enqueue(job);
          this.storage.sink(0);
        } else {
          this.storage.peak.enqueue(job);
          this.storage.peak.dequeueAll(this.callback);
          this.storage.sink(0);
        }
      }
    } else {
      let taskRunner = new AutoQueue(this.maxJobs);
      taskRunner.enqueue(job);
      this.storage.push(taskRunner);
      taskRunner.dequeueAll(this.callback)
    }
  }
  stop() {
    this.storage.storage.forEach(aq => {
      aq.clear();
    });
  }
  get length() {
    return this.storage.storage.length;
  }
  clean() {
    while(this.storage.peakVal === 0 && this.storage.storage.length > 1) {
      this.storage.pop();
    }
  }
}

module.exports = {
  LimitedQueue,
  AutoQueue,
  AutoQueueBalancer
};