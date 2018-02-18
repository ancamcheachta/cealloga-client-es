'use strict';
/**
 * @desc Cealloga rest API client for the browser.
 * @since 0.1.0
 * @author An Camchéachta <ancamcheachta@protonmail.com>
 */

import * as util from './util';

/**
 * @desc A map of endpoint constants, where key is an identifier in the code,
 * and value is the service endpoint.
 * 
 * NOTE: All service endpoints should be relative.
 * @since 0.1.0
 */
const endpoints = {
    ceallogaDev: '/cealloga/_test',
    ceallogaProd: '/cealloga',
    codeList: '/code',
    codePublish: '/code/publish',
    codeRecord: '/code',
    codeUnpublish: '/code/unpublish',
    codeValidate: '/code/validate'
};

/**
 * @desc Returns input options for `GET` request to be used by Fetch API.
 * @returns {Object} Fetch request input options.
 * @since 0.1.0
 */
const get = () => {
    return {
        method: 'GET',
        mode: 'same-origin',
        headers: new Headers({'Content-Type': 'application/json'})
    };
};

/**
 * @desc Returns input options for `POST` request to be used by Fetch API.
 * @param {Object} body Request body.
 * @returns {Object} Fetch request input options.
 * @since 0.1.0
 */
const post = body => {
    return {
        method: 'POST', 
        mode: 'same-origin', 
        body: JSON.stringify(body),
        headers: new Headers({'Content-Type': 'application/json'})
    };
};

/**
 * @desc Returns an encoded query string from a query object.
 * @param {Object} query Unencoded object to be converted to a query string.
 * @returns {string} Encoded query string.
 * @since 0.1.0
 */
const queryString = query => {
    let qs = '';
    
    Object.keys(query).forEach(param => {
        let value = encodeURIComponent(query[param]);
        
        qs += `${param}=${value}&`;
    });
    
    return qs;
};

/**
 * @desc Performs request using Fetch API.
 * @param {string} uri Request URI.
 * @param {string} method Request method. Currently supported: `GET`, `POST`.
 * @param {Object} body Request body.
 * @param {function} callback Function with params `err`, `result`, `response`.
 * @returns {Promise} Promise. This is a no-op object as the callback handles
 * the request results.
 * @since 0.1.0
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
const request = (uri, method, body, callback) => {
    let fetchHandler, res;
    
    switch (method) {
        case 'GET':
            fetchHandler = get();
            break;
        case 'POST':
            fetchHandler = post(body);
            break;
        default: /* istanbul ignore next */
            break;
    }
    
    return fetch(uri, fetchHandler)
        .then(response => {
            res = response;
            response.json()
                .then(json => responseJsonThen(res, callback)(json))
                .catch(err => callback(err, null, res));
        }).catch(err => callback(err, null, null));
};

/**
 * @desc Closure used when fetch response `json()` promise is resolved.
 * @param {Response} response Fetch API response object.
 * @param {function} callback Function with params `err`, `result`, `response`.
 * @returns {function} Closure with param `result` that, when called, executes 
 * callback.
 * @since 0.1.0
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
const responseJsonThen = (response, callback) => {
    return result => {
        let fetched = util.fetch(result);
        
        result = fetched.isMock() ? fetched.json() : result;
        
        return callback(null, result, response);
    };
};

/**
 * @desc Ceallóga rest API client class.
 * @since 0.1.0
 */
class ApiClient {
    constructor(options) {
        options = options || {};
        
        this.cealloga = new Cealloga(this);
        this.code = new Code(this);
        this.host = // eslint-disable-next-line
            'host' in options ? options.host 
                : /^((?:http:|https:)\/\/[\w\d\.\-:]*)\/?/g
                    .exec(window.location.href)[1];
    }
}

/**
 * @desc Class exposing `/cealloga` service mappings.
 * @since 0.1.0
 */
class Cealloga {
    constructor(_client) {
        this._client = _client;
    }
    
    exec(name, body, callback) {
        let endpoint, host = this._client.host;
        
        /* istanbul ignore if */
        if (typeof arguments[0] === 'object') {
            endpoint = arguments[0].endpoint;
        } else {
            endpoint = `${endpoints.ceallogaProd}/${name}`;
        }
        
        request(`${host}${endpoint}`, 'POST', body, callback);
    }
    
    _test(id, body, callback) {
        let endpoint, host = this._client.host;
        
        /* istanbul ignore if */
        if (typeof arguments[0] === 'object') {
            endpoint = arguments[0].endpoint;
        } else {
            endpoint = `${endpoints.ceallogaDev}/${id}`;
        }
        
        request(`${host}${endpoint}`, 'POST', body, callback);
    }
}

/**
 * @desc Class exposing `/code` service mappings.
 * @since 0.1.0
 */
class Code {
    constructor(_client) {
        this._client = _client;
    }
    
    list(query, callback) {
        let params = queryString(query),
            endpoint = `${endpoints.codeList}?${params}`,
            host = this._client.host;
            
        request(`${host}${endpoint}`, 'GET', null, callback);
    }
    
    publish(id, callback) {
        let endpoint = `${endpoints.codePublish}/${id}`,
            host = this._client.host;
            
        request(`${host}${endpoint}`, 'GET', null, callback);
    }
    
    record(id, callback) {
        let endpoint = `${endpoints.codeRecord}/${id}`,
            host = this._client.host;
            
        request(`${host}${endpoint}`, 'GET', null, callback);
    }
    
    unpublish(name, callback) {
        let endpoint = `${endpoints.codeUnpublish}/${name}`,
            host = this._client.host;
            
        request(`${host}${endpoint}`, 'GET', null, callback);
    }
    
    validate(body, callback) {
        let endpoint = `${endpoints.codeValidate}`,
            host = this._client.host;
        
        request(`${host}${endpoint}`, 'POST', body, callback);
    }
}

/**
 * @desc Creates and returns new instance of Ceallóga api client with options 
 * provided.
 * @param {Object} options Options for `ApiClient` constructor.
 * @returns {ApiClient}
 */
export function api(options) {
    options = options || {};
    
    if (options.Headers) global.Headers = options.Headers;
    
    return new ApiClient(options);
}
