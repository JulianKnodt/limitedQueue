class MinHeap {
  constructor(scorer) {
    this.storage = [];
    if (scorer) {
      this.scorer = scorer;
    }
  }
  push(elem) {
    this.storage.push(elem);
    this.bubbleUp(this.storage.length - 1);
  }
  pop() {
    var result = this.storage[0];
    var end = this.storage.pop();
    if(this.storage.length > 0) {
      this.storage[0] = end;
      this.sink(0);
    }
    return result;
  }
  bubbleUp(index) {
    var elem = this.storage[index];
    let score;
    if(this.scorer) {
      score = this.scorer(elem);
    } else {
      score = elem;
    }
    while(index > 0) {
      var parentIndex = Math.floor((index + 1) / 2) - 1;
      var parent = this.storage[parentIndex];
      if (score >= (this.scorer ? this.scorer(parent) : parent)) 
        break;
      
      // Otherwise, swap the parent with the current element and
      // continue.
      this.storage[parentIndex] = elem;
      this.storage[index] = parent;
      index = parentIndex;
    }
  }
  sink(index) {
    var elem = this.storage[index];
    let score;
    if(this.scorer) {
      this.scorer(elem);
    } else {
      score = elem;
    }
    while(true) {
      var firstChildIndex = (index + 1) * 2;
      var secondChildIndex = firstChildIndex - 1;
      var swap = null;
      var firstChild = this.storage[firstChildIndex];
      var secondChild = this.storage[secondChildIndex];
      if (firstChild && this.scorer ? this.scorer(firstChild) : firstChild < score) {
        swap = firstChildIndex;
      } else if (secondChild && this.scorer ? this.scorer(secondChild) : secondChild < score) {
        swap = secondChildIndex;
      }
      if(swap === null) {
        return;
      } else {
        this.storage[index] = this.storage[swap];
        this.storage[swap] = elem;
        index = swap;
      }
    }
  }
  get peak() {
    return this.storage[0];
  }
  get peakVal() {
    return this.scorer ? this.scorer(this.storage[0]) : this.storage[0];
  }
  size() {
    return this.storage.length;
  }
}

module.exports = MinHeap;