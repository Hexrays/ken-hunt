(function(){
    'use strict';

    function namespace() {
        var args    = Array.prototype.slice.call(arguments),
            current = args.length === 3 ? args.shift() : window,
            name    = args.shift(),
            props   = args.shift() || {},
            spaces  = name ? name.split('.') : [],
            space,
            prop;

        while(space = spaces.shift()) {
            if(Object.prototype.hasOwnProperty.call(current,space)) {
                current = current[space];
            } else {
                current = current[space] = {};
            }
        }

        for(prop in props){ if(!Object.prototype.hasOwnProperty.call(current,prop)) {current[prop] = props[prop];}}

        return current;
    }

    namespace('hex.js', {
        namespace       : namespace,
    });
})();


// hex UTILS URL
(function() {
    'use strict';

    var paramsRE = /([^?=&]+)(=([^&]*))?/g,
        params   = {},
        has,
        get;

    if(window.top !== window) {
        window.top.location.search.replace(paramsRE, function($0, $1, $2, $3) {
            params[$1] = $3;
        });
    }

    window.location.search.replace(paramsRE, function($0, $1, $2, $3) {
        params[$1] = $3;
    });

    hex.js.namespace('hex.url', {
        params : params,
        has    : function(param) {
            return Object.prototype.hasOwnProperty.call(params,param);
        },
        get    : function(param) {
            return params[param];
        }
    });
})();
