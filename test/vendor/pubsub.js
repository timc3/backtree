/*         
    jQuery pub/sub plugin by Peter Higgins      
    https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js      
     
    Modified by Tobin Bradley      
    Modified by Tim Child @ Cantemo      
    AFL/BSD Licensed      
*/      
;(function(d){      
    // the topic/subscription hash      
    var cache = {};      
     
    // Publish some data on a named topic.      
    d.publish = function(/* String */topic, /* Array? */args){      
        cache[topic] && d.each(cache[topic], function(){      
            try {      
                this.apply(d, args || []);      
            } catch(err) {      
                log(err);      
            }      
        });      
    };      
     
    // Register a callback on a named topic.      
    d.subscribe = function(/* String */topic, /* Function */callback){      
        if(!cache[topic]){      
            cache[topic] = [];      
        }      
        cache[topic].push(callback);      
        return [topic, callback]; // Array      
    };      
     
    // Disconnect a subscribed function for a topic.      
    d.unsubscribe = function(/* String */topic, /* Function */callback){         
        cache[topic] && d.each(cache[topic], function(idx){      
            if(this == callback){      
                cache[topic].splice(idx, 1);      
            }      
        });      
    };      
         
    // List Subscribers      
    d.subscribers = function(/* String */topic) {      
        l = [];      
        cache[topic] && d.each(cache[topic], function(idx){      
            l.push(this.name);      
        });      
        return l;      
    };      
     
})(jQuery);      
