(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.HttpApi = factory());
}(this, (function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var _extends = Object.assign || function (target) {
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

  var HttpApi = function () {
    function HttpApi() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$base = _ref.base,
          base = _ref$base === undefined ? '' : _ref$base,
          _ref$fetchOptions = _ref.fetchOptions,
          fetchOptions = _ref$fetchOptions === undefined ? {} : _ref$fetchOptions,
          beforeFetch = _ref.beforeFetch,
          complete = _ref.complete,
          error = _ref.error;

      classCallCheck(this, HttpApi);

      this.base = base;
      this.fetchOptions = fetchOptions || {};
      this.beforeFetch = beforeFetch;
      this.complete = complete;
      this.error = error;
    }

    HttpApi.prototype.fetch = function (_fetch) {
      function fetch(_x) {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function (url) {
      var _this = this;

      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$method = _ref2.method,
          method = _ref2$method === undefined ? 'GET' : _ref2$method,
          headers = _ref2.headers,
          query = _ref2.query,
          body = _ref2.body,
          type = _ref2.type;

      if (this.base) url = this.base + url;
      method = method.toUpperCase();

      if (query) {
        url = new URL(url);

        if (!(query instanceof URLSearchParams)) {
          // filter null/undefined
          if (query.constructor === Object) {
            query = Object.entries(query);
          }

          if (query instanceof Array) {
            var q = new URLSearchParams();
            query.forEach(function (_ref3) {
              var name = _ref3[0],
                  value = _ref3[1];

              if (value != null) q.append(name, value);
            });
            query = q;
          } else if (query.constructor === String) {
            query = new URLSearchParams(query);
          }
        }

        for (var _iterator = query.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref5;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref5 = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref5 = _i.value;
          }

          var _ref4 = _ref5;
          var name = _ref4[0];
          var value = _ref4[1];

          url.searchParams.append(name, value);
        }

        url = url.toString();
      }

      if (this.fetchOptions.headers && headers) {
        var h = new Headers(this.fetchOptions.headers);
        for (var _iterator2 = new Headers(headers).entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
          var _ref7;

          if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref7 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref7 = _i2.value;
          }

          var _ref6 = _ref7;
          var _name = _ref6[0];
          var _value = _ref6[1];

          h.set(_name, _value);
        }
        headers = h;
      } else {
        headers = new Headers(this.fetchOptions.headers || headers || undefined);
      }

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (type === 'json' || !type && body && body.constructor === Object) {
          if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
          }

          body = JSON.stringify(body);
        } else if (type === 'form' && !(body instanceof FormData)) {
          var form = new FormData();

          for (var k in body) {
            form.append(k, body[k]);
          }

          body = form;
        }
      }

      var options = _extends({}, this.fetchOptions, { method: method, headers: headers, body: body });

      if (this.beforeFetch) {
        var modified = this.beforeFetch(url, options);
        if (modified && modified.url && modified.options) {
          url = modified.url;
          options = modified.options;
        }
      }

      var request = new Request(url, options);

      return fetch(request).then(function (response) {
        var body = void 0;
        var contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('json')) {
          body = response.json();
        }

        // if complete handler is given, you should check response.ok yourself in the handler
        if (_this.complete) {
          return body ? body.then(function (body) {
            return _this.complete({ request: request, response: response, body: body });
          }) : _this.complete({ request: request, response: response, body: body });
        } else if (response.ok) {
          return body || response;
        } else {
          throw body || response;
        }
      }, function (error) {
        if (_this.error) _this.error({ request: request, error: error });else throw error;
      });
    });

    HttpApi.prototype.get = function get$$1(url, query, options) {
      return this.fetch(url, _extends({
        method: 'GET',
        query: query
      }, options));
    };

    HttpApi.prototype.post = function post(url, body, options) {
      return this.fetch(url, _extends({
        method: 'POST',
        body: body
      }, options));
    };

    HttpApi.prototype.put = function put(url, body, options) {
      return this.fetch(url, _extends({
        method: 'PUT',
        body: body
      }, options));
    };

    HttpApi.prototype.patch = function patch(url, body, options) {
      return this.fetch(url, _extends({
        method: 'PATCH',
        body: body
      }, options));
    };

    HttpApi.prototype.delete = function _delete(url, query, options) {
      return this.fetch(url, _extends({
        method: 'DELETE',
        query: query
      }, options));
    };

    HttpApi.prototype.head = function head(url, query, options) {
      return this.fetch(url, _extends({
        method: 'HEAD',
        query: query
      }, options));
    };

    HttpApi.prototype.options = function options(url, query, _options) {
      return this.fetch(url, _extends({
        method: 'OPTIONS',
        query: query
      }, _options));
    };

    return HttpApi;
  }();

  return HttpApi;

})));
//# sourceMappingURL=HttpApi.umd.js.map
