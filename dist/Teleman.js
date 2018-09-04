(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Teleman = factory());
}(this, (function () { 'use strict';

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

  var Teleman =
  /*#__PURE__*/
  function () {
    function Teleman(_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$base = _ref.base,
          base = _ref$base === void 0 ? '' : _ref$base,
          _ref$requestOptions = _ref.requestOptions,
          requestOptions = _ref$requestOptions === void 0 ? {} : _ref$requestOptions,
          beforeCreateRequest = _ref.beforeCreateRequest,
          complete = _ref.complete,
          error = _ref.error;

      this.base = base;
      this.requestOptions = requestOptions;
      this.beforeCreateRequest = beforeCreateRequest;
      this.complete = complete;
      this.error = error;
    }

    var _proto = Teleman.prototype;

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
          headers = _ref2.headers,
          query = _ref2.query,
          body = _ref2.body,
          type = _ref2.type;

      return new Promise(function (resolve) {
        if (_this.base && !/^http(s?):/.test(url)) {
          url = _this.base + url;
        }

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
            var _ref4;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref4 = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref4 = _i.value;
            }

            var _ref5 = _ref4,
                name = _ref5[0],
                value = _ref5[1];
            url.searchParams.append(name, value);
          }

          url = url.href;
        }

        if (_this.requestOptions.headers && headers) {
          var h = new Headers(_this.requestOptions.headers);

          for (var _iterator2 = new Headers(headers).entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref6;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref6 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref6 = _i2.value;
            }

            var _ref7 = _ref6,
                name = _ref7[0],
                value = _ref7[1];
            h.set(name, value);
          }

          headers = h;
        } else {
          headers = new Headers(_this.requestOptions.headers || headers || undefined);
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

        var options = _extends({}, _this.requestOptions, {
          method: method,
          headers: headers,
          body: body
        });

        if (_this.beforeCreateRequest) {
          var modified = _this.beforeCreateRequest(url, options);

          if (modified && modified.url && modified.options) {
            url = modified.url;
            options = modified.options;
          }
        }

        var request = new Request(url, options);
        resolve(fetch(request).then(function (response) {
          var body;

          if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            var contentType = response.headers.get('Content-Type');

            if (contentType) {
              if (contentType.startsWith('application/json')) {
                body = response.json();
              } else if (contentType.startsWith('text/')) {
                body = response.text();
              }
            }
          } // if complete handler is given, you should check response.ok yourself in the handler


          if (_this.complete) {
            return body ? body.then(function (body) {
              return _this.complete({
                request: request,
                response: response,
                body: body
              });
            }) : _this.complete({
              request: request,
              response: response,
              body: body
            });
          } else if (response.ok) {
            return body || response;
          } else {
            throw body || response;
          }
        }, function (error) {
          if (_this.error) _this.error({
            request: request,
            error: error
          });else throw error;
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

    _proto.delete = function _delete(url, query, options) {
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

  return Teleman;

})));
//# sourceMappingURL=Teleman.js.map
