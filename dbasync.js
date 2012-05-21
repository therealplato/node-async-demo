var async    = require('async');

// defaultInit() is called at EOF. we use async.series/waterfall/parallel
// to perform different steps of a database initialization in order

initDefault = function() {
// We set up an async.series function that looks like .series([fn1,fn2...],cb);
// They will be called sequentially. cb is passed an ordered results array.
  console.log('We will call four functions in order using async.series:');
  console.log(' test_connection   : one async fn');
  console.log(' destroy_whole_db  : three fns in a waterfall');
  console.log(' create_new_db     : three fns in parallel');
  console.log(' reset_design_docs : three fns in series');
  async.series(
  [ 
    //this is an array of functions - the first argument of async.series
    //inside these we are calling asynchronous test_connection(cb); etc
    function(fn) {  test_connection(function(err, results) {
    //fn is the callback to move to the next async.* function.
                      if (!err){fn(null,results)}  else {fn(err)};
                    });             
    },
    function(fn) {  destroy_whole_db(function(err, results) {
                      if (!err){fn(null,results)}  else {fn(err)};
                    });             
    },
    function(fn) {  create_new_db(function(err, results) {
                      if (!err){fn(null,results)}  else {fn(err)};
                    });             
    },
    function(fn) {  reset_design_docs(function(err, results) {
                      if (!err){fn(null,results)}  else {fn(err)};
                    });             
    },], 
        function(err, results) {
        //this is called when the last fn in the above array callsback fn(_)
          if(!err) {
            console.log('\nSuccess! Results were:');
            console.log(' test_connection   :\n'+results[0]);
            console.log(' destroy_whole_db  :\n'+JSON.stringify(results[1]));
            console.log(' create_new_db     :\n'+results[2]);
            console.log(' reset_design_docs :\n'+results[3]);
          }
          else {console.log('Error in async demo!\n'+err)};
        }   // end of async.series callback declaration
  );   // end of async.series(); call 
};   // end of defaultInit() declaration

// Functions:
//  Here we will define a few functions to call above
//  All take a callback argument and call callback(null, results) upon success
//
//   test_connection     Single 2 second timeout, 
//   destroy_whole_db    3 functions in an async waterfall
//   create_new_db       3 functions in an async parallel
//   reset_design_docs   3 functions in an async series

//
// test_connection
//
test_connection = function(callback) {
  console.log('\ntest_connection called: one async function');
  setTimeout(function() {
                          console.log(' test_connection done after 2s');
                          callback(null, "tc_ok");
                        }, 2000);
};

//
// destroy_whole_db
// 
destroy_whole_db = function(callback) {
  console.log('\ndestroy_whole_db called: one async.waterfall');
  async.waterfall(
  [
    function(fn){
      start=new Date().toJSON();
      console.log(' '+start+' - destroy_whole_db fn1 called')
      fn(null, start);
    },
    function(start, fn){
      console.log(' fn2 passed '+start+' by fn1');
      setTimeout(function(){
            startD = new Date(start);
            now1=new Date();
            deltams=now1.getTime() - startD.getTime();
            console.log(' destroy_whole_db fn2 calling back to fn3; elapsed time: '
                        +deltams+' ms');
            fn(null, start, now1.toJSON());
          }, 2000);
    },
    function(start, now1, fn) {
      console.log(' fn3 passed '+start+' and '+now1);
      setTimeout(function(){
            now2=new Date().toJSON();
            console.log(' fn3 calling final waterfall callback with start, now1, now2');
            fn(null, start, now1, now2);
      } , 1000)
    }],
       function(err, start, now1, now2) {
         console.log(' we\'ve passed the results of each fn down the cascade '+
                     'to this final callback:');
         console.log(' start: '+start);
         console.log(' now1 : '+now1);
         console.log(' now2 : '+now2);
         console.log(' now  : '+(new Date()).toJSON());
         callback(null, {t0:start, t1: now1, t2: now2});
    });  //end of async.waterfall( [fn1...] , cb(){} );
};


//
// create_new_db
//
create_new_db = function(callback) {
  console.log('\ncreate_new_db called: one async.parallel chain');
  async.parallel(
  [ function(fn){
      console.log(' in async.parallel fn1');
      setTimeout(function() {
                              console.log(' async.parallel fn1 done after 2.1s');
                              fn(null, "cndb.fn1_ok");
                            }, 2100);
  },function(fn){
      console.log(' in async.parallel fn2');
      setTimeout(function() {
                              console.log(' async.parallel fn2 done after 2.3s');
                              fn(null, "cndb.fn2_ok");
                            }, 2300);
  },function(fn){
      console.log(' in async.parallel fn3');
      setTimeout(function() {
                              console.log(' async.parallel fn3 done after 1.5s');
                              fn(null, "cndb.fn3_ok");
                            }, 1500);
  } ],
      function(err, results) {
        console.log(' reached final callback to async.parallel() in create_new_db ');
        console.log(' passing async.parallel\'s results to create_new_db\'s callback');
        console.log(' Look, results is ordered properly:\n'+results);
        callback(null, results);
      } ); //end of async.parallel([fn1,fn2],cb);
}; //end of create_new_db declaration

//
// reset_design_docs
//
reset_design_docs = function(callback) {
  console.log('\nreset_design_docs called, starting an async.series');
  async.series(
    [   
      function(fn) {
        console.log(' reset_design_docs: async.series fn1 called');
        fn(null, "rdd.fn1_ok");
      } ,   //next function in series' array!
      function(fn) {
        console.log(' reset_design_docs: async.series fn2 called');
        setTimeout(function(){  
                         console.log(' reset_design_docs: fn2 done after 3s');
                         fn(null,"rdd.fn2_ok");
                       }, 3000);
      }
    ],    // async.series() 2nd arg is a final callback
    function(err, resultsArr) { 
      if(!err) {         // the series had no errors, signal whatever called
        console.log(' final callback of reset_design_docs async.series chain');
        console.log(' calling back to whatever called reset_design_docs...');
        callback(null, resultsArr);  // we're calling the cb passed into reset_design_docs
      } else {
        console.log('there was a problem in reset_design_docs:\n'+err);
        callback(err);
      };
    }     // end of async.series' callback
  );      // finish calling async.series([fns],cb);
};        // end of function reset_design_docs(callback) {...};


//
//// Fire it up!
//

initDefault(); 


