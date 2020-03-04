function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

/**
 * Expose compositor.
 */

var koaCompose = compose;
/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!');

  for (var _iterator = middleware, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var fn = _ref;
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
  }
  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */


  return function (context, next) {
    // last called middleware #
    var index = -1;
    return dispatch(0);

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      var fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

function createURLSearchParams(query) {
  if (query.constructor === String) {
    return new URLSearchParams(query);
  }

  if (query.constructor === Object) {
    query = Object.entries(query);
  }

  var q = new URLSearchParams();

  for (var _iterator = query, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var _ref2 = _ref,
        name = _ref2[0],
        value = _ref2[1];

    if (value != null) {
      q.append(name, value);
    }
  }

  return q;
}

function createFormData(data) {
  if (data.constructor === Object) {
    data = Object.entries(data);
  }

  var f = new FormData();

  for (var _iterator2 = data, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref3 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref3 = _i2.value;
    }

    var _ref4 = _ref3,
        name = _ref4[0],
        value = _ref4[1],
        filename = _ref4[2];

    if (value != null) {
      f.append(name, value, filename);
    }
  }

  return f;
}

var Teleman = /*#__PURE__*/function () {
  function Teleman(_temp) {
    var _ref5 = _temp === void 0 ? {} : _temp,
        base = _ref5.base,
        headers = _ref5.headers,
        _ref5$readBody = _ref5.readBody,
        readBody = _ref5$readBody === void 0 ? true : _ref5$readBody,
        _ref5$throwFailedResp = _ref5.throwFailedResponse,
        throwFailedResponse = _ref5$throwFailedResp === void 0 ? true : _ref5$throwFailedResp;

    if (base) {
      this.base = base;
    } else {
      try {
        // defaults to document.baseURI in browser
        this.base = document.baseURI;
      } catch (e) {// in node.js, ignore
      }
    }

    this.headers = headers;
    this.readBody = readBody;
    this.throwFailedResponse = throwFailedResponse;
    this.middleware = [];
  }

  var _proto = Teleman.prototype;

  _proto.use = function use(middleware, beginning) {
    if (beginning === void 0) {
      beginning = false;
    }

    if (beginning) {
      this.middleware.unshift(middleware);
    } else {
      this.middleware.push(middleware);
    }
  };

  _proto.fetch = function (_fetch) {
    function fetch(_x) {
      return _fetch.apply(this, arguments);
    }

    fetch.toString = function () {
      return _fetch.toString();
    };

    return fetch;
  }(function (url, _ref6) {
    var _this = this;

    if (_ref6 === void 0) {
      _ref6 = {};
    }

    var _ref7 = _ref6,
        _ref7$method = _ref7.method,
        method = _ref7$method === void 0 ? 'GET' : _ref7$method,
        _ref7$base = _ref7.base,
        base = _ref7$base === void 0 ? this.base : _ref7$base,
        headers = _ref7.headers,
        query = _ref7.query,
        _ref7$params = _ref7.params,
        params = _ref7$params === void 0 ? {} : _ref7$params,
        body = _ref7.body,
        _ref7$readBody = _ref7.readBody,
        readBody = _ref7$readBody === void 0 ? this.readBody : _ref7$readBody,
        _ref7$throwFailedResp = _ref7.throwFailedResponse,
        throwFailedResponse = _ref7$throwFailedResp === void 0 ? this.throwFailedResponse : _ref7$throwFailedResp,
        _ref7$use = _ref7.use,
        use = _ref7$use === void 0 ? this.middleware : _ref7$use,
        _ref7$useBefore = _ref7.useBefore,
        useBefore = _ref7$useBefore === void 0 ? [] : _ref7$useBefore,
        _ref7$useAfter = _ref7.useAfter,
        useAfter = _ref7$useAfter === void 0 ? [] : _ref7$useAfter,
        rest = _objectWithoutPropertiesLoose(_ref7, ["method", "base", "headers", "query", "params", "body", "readBody", "throwFailedResponse", "use", "useBefore", "useAfter"]);

    return new Promise(function (resolve) {
      method = method.toUpperCase();
      url = new URL(url.replace(/:([a-z]\w*)/ig, function (_, w) {
        return encodeURIComponent(params[w]);
      }), base);

      if (query) {
        if (!(query instanceof URLSearchParams)) {
          query = createURLSearchParams(query);
        }

        query.forEach(function (value, name) {
          return url.searchParams.append(name, value);
        });
      }

      if (_this.headers && headers) {
        var h = new Headers(_this.headers);
        new Headers(headers).forEach(function (value, name) {
          return h.set(name, value);
        });
        headers = h;
      } else {
        headers = new Headers(_this.headers || headers || {});
      }

      if (body !== undefined && !['GET', 'HEAD'].includes(method)) {
        var contentType = headers.get('Content-Type') || '';

        if (!contentType && body && body.constructor === Object || contentType.startsWith('application/json')) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }

          body = JSON.stringify(body);
        } else if (contentType.startsWith('multipart/form-data') && body && !(body instanceof FormData)) {
          body = createFormData(body);
        } else if (contentType.startsWith('application/x-www-form-urlencoded') && body && !(body instanceof URLSearchParams)) {
          body = createURLSearchParams(body);
        }
      }

      var ctx = _extends({
        url: url,
        options: {
          method: method,
          headers: headers,
          body: body
        },
        readBody: readBody
      }, rest);

      resolve(koaCompose([].concat(useBefore, use, useAfter))(ctx, function () {
        return fetch(ctx.url.href, ctx.options).then(function (response) {
          ctx.response = response;
          var body = Promise.resolve();

          if (readBody && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(ctx.options.method.toUpperCase())) {
            var responseType = response.headers.get('Content-Type');

            if (responseType) {
              if (responseType.startsWith('application/json')) {
                body = response.json();
              } else if (responseType.startsWith('text/')) {
                body = response.text();
              } else if (responseType.startsWith('multipart/form-data')) {
                body = response.formData();
              }
            }
          }

          if (response.ok || !throwFailedResponse) {
            return body;
          } else {
            return body.then(function (e) {
              throw e;
            });
          }
        });
      }));
    });
  });

  _proto.get = function get(url, query, options) {
    return this.fetch(url, _extends({
      method: 'GET',
      query: query
    }, options));
  };

  _proto.post = function post(url, body, options) {
    return this.fetch(url, _extends({
      method: 'POST',
      body: body
    }, options));
  };

  _proto.put = function put(url, body, options) {
    return this.fetch(url, _extends({
      method: 'PUT',
      body: body
    }, options));
  };

  _proto.patch = function patch(url, body, options) {
    return this.fetch(url, _extends({
      method: 'PATCH',
      body: body
    }, options));
  };

  _proto["delete"] = function _delete(url, query, options) {
    return this.fetch(url, _extends({
      method: 'DELETE',
      query: query
    }, options));
  };

  _proto.head = function head(url, query, options) {
    return this.fetch(url, _extends({
      method: 'HEAD',
      query: query
    }, options));
  };

  return Teleman;
}();

var singleton = Teleman.singleton = new Teleman();
Teleman.use = singleton.use.bind(singleton);
Teleman.fetch = singleton.fetch.bind(singleton);
Teleman.get = singleton.get.bind(singleton);
Teleman.post = singleton.post.bind(singleton);
Teleman.put = singleton.put.bind(singleton);
Teleman.patch = singleton.patch.bind(singleton);
Teleman["delete"] = singleton["delete"].bind(singleton);
Teleman.head = singleton.head.bind(singleton);

export default Teleman;
//# sourceMappingURL=Teleman.mjs.map
