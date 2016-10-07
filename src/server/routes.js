'use strict';

const routes = {
    ROOT : '/',
    HOME : '/sip',
    PUBLIC : '/sip/public',
    PUBLIC_ROUTES : '/public/javascripts/routes.js',
    
    AUTHENTICATION : '/sip/authen',
    
    WORKER_A_CONTEXT: '/bousaia',
    WORKER_A_HOME : '/sip/bousaia',
    WORKER_B_CONTEXT: '/bousaib',
    WORKER_B_HOME : '/sip/bousaib',
    
    ADMIN_CONTEXT: '/admin',
    ADMIN_HOME : '/sip/admin',
    
    NEW_BOUSAI_SERVICES: '/sip/newbousai/service',
    PATTERN_SERVICES: '/sip/pattern/service',
    DISASTER_INFO_SERVICES: '/sip/disaster-info/service'
}

function getRoute ( val ) {
    var regex = /\{[_a-zA-Z][_0-9a-zA-Z]*\}/;

    if (regex.test(val)) {
        val = val.replace(/[\{\}]/g, '');
        return routes[val];
    }

    return val;
};

exports = module.exports;
exports.routes = routes;
exports.getRoute = getRoute;
