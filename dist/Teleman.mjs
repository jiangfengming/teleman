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

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

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

  for (var _iterator = _createForOfIteratorHelperLoose(middleware), _step; !(_step = _iterator()).done;) {
    var fn = _step.value;
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

  for (var _iterator = _createForOfIteratorHelperLoose(query), _step; !(_step = _iterator()).done;) {
    var _step$value = _step.value,
        name = _step$value[0],
        value = _step$value[1];

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

  for (var _iterator2 = _createForOfIteratorHelperLoose(data), _step2; !(_step2 = _iterator2()).done;) {
    var _step2$value = _step2.value,
        name = _step2$value[0],
        value = _step2$value[1],
        filename = _step2$value[2];

    if (value != null) {
      f.append(name, value, filename);
    }
  }

  return f;
}

var Teleman = /*#__PURE__*/function () {
  function Teleman(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        base = _ref.base,
        headers = _ref.headers,
        _ref$readBody = _ref.readBody,
        readBody = _ref$readBody === void 0 ? true : _ref$readBody,
        _ref$throwFailedRespo = _ref.throwFailedResponse,
        throwFailedResponse = _ref$throwFailedRespo === void 0 ? true : _ref$throwFailedRespo;

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
  }(function (url, _temp2) {
    var _this = this;

    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$method = _ref2.method,
        method = _ref2$method === void 0 ? 'GET' : _ref2$method,
        _ref2$base = _ref2.base,
        base = _ref2$base === void 0 ? this.base : _ref2$base,
        headers = _ref2.headers,
        query = _ref2.query,
        _ref2$params = _ref2.params,
        params = _ref2$params === void 0 ? {} : _ref2$params,
        body = _ref2.body,
        _ref2$readBody = _ref2.readBody,
        readBody = _ref2$readBody === void 0 ? this.readBody : _ref2$readBody,
        _ref2$throwFailedResp = _ref2.throwFailedResponse,
        throwFailedResponse = _ref2$throwFailedResp === void 0 ? this.throwFailedResponse : _ref2$throwFailedResp,
        _ref2$use = _ref2.use,
        use = _ref2$use === void 0 ? this.middleware : _ref2$use,
        _ref2$useBefore = _ref2.useBefore,
        useBefore = _ref2$useBefore === void 0 ? [] : _ref2$useBefore,
        _ref2$useAfter = _ref2.useAfter,
        useAfter = _ref2$useAfter === void 0 ? [] : _ref2$useAfter,
        rest = _objectWithoutPropertiesLoose(_ref2, ["method", "base", "headers", "query", "params", "body", "readBody", "throwFailedResponse", "use", "useBefore", "useAfter"]);

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

          if (readBody && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'PURGE'].includes(ctx.options.method.toUpperCase())) {
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

  _proto.purge = function purge(url, query, options) {
    return this.fetch(url, _extends({
      method: 'PURGE',
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
Teleman.purge = singleton.purge.bind(singleton);

export default Teleman;
//# sourceMappingURL=Teleman.mjs.map
