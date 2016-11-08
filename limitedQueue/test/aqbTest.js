const chai = require('chai');
const q = require('../Queue');
const expect = chai.expect;
const assert = chai.assert;

describe('auto queue balancer', function() {
  //No before each because the timeout makes things really annoying
  describe('delegate', function() {
    it('should allow for enqueing', function(done) {
      let aqb = new q.AutoQueueBalancer((item, done) => {
        setTimeout(()=> {
          testArr.push(item);
          done();
        }, 500);
      });
      let testArr = [];
      aqb.delegate(10);
      expect(aqb.length).to.eql(1);
      expect(testArr).to.eql([]);
      setTimeout(() => {
        expect(testArr).to.eql([10]);
        done();
      }, 1000);
    });
    it('should create multiple AutoQueues', function(done) {
      let aqb = new q.AutoQueueBalancer((item, done) => {
        setTimeout(()=> {
          testArr.push(item);
          done();
        }, 500);
      }, 2);
      let testArr = [];
      for (var i = 0; i < 10; i ++) {
        aqb.delegate(i);
      }
      expect(aqb.length).to.eql(4);
      expect(testArr).to.eql([]);
      setTimeout(function() {
        expect(testArr).to.eql([]);
      }, 250);
      setTimeout(function() {
        expect(testArr.sort()).to.eql([0,1,2,3,4,5,6,7,8,9]);
        done();
      },1800);
    });
  });
  describe('clean', function() {
    var aqb = new q.AutoQueueBalancer((item, done) => {
      setTimeout(()=> {
        testArr.push(item);
        done();
      }, 500);
    });
    let testArr = [];
    it('should remove any empty runners except for 1', function(done) {
      for(var i = 0; i < 3; i ++) {
        aqb.delegate(i);
      }
      setTimeout(function() {
        aqb.clean();
        expect(aqb.length).to.eql(1);
        done();
      }, 1500);
    });
  });
});