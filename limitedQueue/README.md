# limitedQueue
An npm package which has a queue and a load balancing queue system.

### Installation
```sh
 $ npm install limitedQueue
```
#### Basic Usage
```javascript
    const q = require('limitedQueue');
    let limited = new q.LimitedQueue(5);
    for (var i = 0; i < 10; i ++) {
        limited.enqueue(i);
    }
    limited.size();
    => 5
    limited.toArray();
    => [ 5, 6, 7, 8, 9 ]
    limited.dequeue();
    => 5
    
```

### Another Simple Data Structure Module?
## No.

##### LimitedQueue Class:
  - Fits data to a specified number of bytes
  - Built-in Event System
  - Optimized for storage using a simple [linked List](https://www.npmjs.com/package/linkedlist)
  - Automatic Dequeing
##### AutoQueue Class:
  - Limited number of items
  - Automatically dequeues when limit is hit, using callback on each item
#### AutoQueueBalancer:
  - A load balancer for an asynchronous function
  - When an item is enqueued, it is pushed to the asynchronous function
  - Uses a Min-Heap to prioritize which queue to delegate the job to
  - Allows for simple usage of calling a lot of asynchronous functions which cannot be run on the same object

### More Usage Info


#### LimitedQueue
```javascript
    const q = require('limitedQueue');
    let limited = new q.LimitedQueue(5);
    let enqueueHook = limited.on('enqueue', () => {console.log('ok')});
    for (var i = 0; i < 10; i ++) {
        limited.enqueue(i);
        => logs OK 10 times
    };
    limited.off('enqueue', enqueueHook);
    //Enqueueing will no longer console log.
    limited.size();
    => 5
    limited.toArray();
    => [ 5, 6, 7, 8, 9 ]
    limited.dequeue();
    => 5
    limited.squelch(100); //Bytes of Storage space not including space of object
    limited.dequeueInterval(100, console.log);
    //Will log an item from the queue every 100 ms and remove it from the queue
```

#### AutoQueue
```javascript
    const q = require('limitedQueue');
    let arr = [];
    let auto = new q.AutoQueue(3, arr.push);
    auto.changeLimit(5);
    //New limit of 5 items
    auto.enqueue(1, 2, 3, 4);
    auto.dequeueAll(function Callback(item, done) => {
        setTimeout(() => {
            arr.push(item);
            if (item !== 3) {
                done();
            } else {
                done(true);
            }
        }, 1000);
    });
    //After approx. 3000 seconds, the array will have [ 1, 2, 3 ], and autoQueue will
    //have 4.
    auto.onLimit(/* callback function */);
    //Sets the default callback to use when dequeueAll is called.
```
