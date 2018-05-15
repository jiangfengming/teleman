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

  var objectWithoutProperties = function (obj, keys) {
    var target = {};

    for (var i in obj) {
      if (keys.indexOf(i) >= 0) continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
      target[i] = obj[i];
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
          responseHandler = _ref.responseHandler;

      classCallCheck(this, HttpApi);

      this.base = base;
      this.fetchOptions = fetchOptions;
      this.beforeFetch = beforeFetch;
      this.responseHandler = responseHandler;
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

      url = this.base + url;

      if (query) {
        url = new URL(url);
        if (!(query instanceof URLSearchParams)) {
          // filter null/undefined
          if (query.constructor === Object) {
            query = Object.entries(query);
          }

          if (query instanceof Array) {
            query = query.filter(function (_ref3) {
              var value = _ref3[1];
              return value != null;
            });
          }

          query = new URLSearchParams(query);
        }

        for (var _ref4 in query.entries()) {
          var name = _ref4[0];
          var value = _ref4[1];

          url.searchParams.append(name, value);
        }

        url = url.toString();
      }

      if (this.fetchOptions.headers && headers) {
        var h = new Headers(this.fetchOptions.headers);
        for (var _iterator = new Headers(headers).entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref6;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref6 = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref6 = _i.value;
          }

          var _ref5 = _ref6;
          var _name = _ref5[0];
          var _value = _ref5[1];

          h.set(_name, _value);
        }
        headers = h;
      } else if (this.fetchOptions.headers) {
        headers = new Headers(this.fetchOptions.headers);
      } else {
        headers = new Headers();
      }

      if (type === 'json') {
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }

        body = JSON.stringify(body);
      } else if (type === 'form') {
        if (!(body instanceof FormData)) {
          var form = new FormData();

          for (var k in body) {
            form.append(k, body[k]);
          }

          body = form;
        }
      }

      var options = this.fetchOptions ? _extends({}, this.fetchOptions, { method: method, headers: headers, body: body }) : { method: method, headers: headers, body: body };

      if (this.beforeFetch) {
        var modified = this.beforeFetch(url, options);
        if (modified && modified.url && modified.options) {
          url = modified.url;
          options = modified.options;
        }
      }

      return fetch(url, options).then(function (res) {
        if (!res.ok) throw res;

        var data = void 0;
        var contentType = res.headers.get('Content-Type');
        if (contentType && contentType.includes('json')) {
          data = res.json();
        }

        if (_this.responseHandler) {
          data = data ? data.then(function (d) {
            return _this.responseHandler(res, d);
          }) : Promise.resolve(_this.responseHandler(res));
        }

        return data || res;
      });
    });

    HttpApi.prototype.get = function get$$1(url, query, options) {
      return this.fetch(url, _extends({
        method: 'GET',
        query: query
      }, options));
    };

    HttpApi.prototype.post = function post(url, body) {
      var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _ref7$type = _ref7.type,
          type = _ref7$type === undefined ? 'json' : _ref7$type,
          options = objectWithoutProperties(_ref7, ['type']);

      return this.fetch(url, _extends({
        method: 'POST',
        body: body,
        type: type
      }, options));
    };

    HttpApi.prototype.put = function put(url, body) {
      var _ref8 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _ref8$type = _ref8.type,
          type = _ref8$type === undefined ? 'json' : _ref8$type,
          options = objectWithoutProperties(_ref8, ['type']);

      return this.fetch(url, _extends({
        method: 'PUT',
        body: body,
        type: type
      }, options));
    };

    HttpApi.prototype.patch = function patch(url, body) {
      var _ref9 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _ref9$type = _ref9.type,
          type = _ref9$type === undefined ? 'json' : _ref9$type,
          options = objectWithoutProperties(_ref9, ['type']);

      return this.fetch(url, _extends({
        method: 'PATCH',
        body: body,
        type: type
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
        method: 'options',
        query: query
      }, _options));
    };

    return HttpApi;
  }();

  return HttpApi;

})));
