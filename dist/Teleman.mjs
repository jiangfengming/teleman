import compose from 'koa-compose';

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
    if (value != null) q.append(name, value);
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
    if (value != null) f.append(name, value, filename);
  }

  return f;
}

var Teleman =
/*#__PURE__*/
function () {
  function Teleman(_temp) {
    var _ref5 = _temp === void 0 ? {} : _temp,
        urlPrefix = _ref5.urlPrefix,
        headers = _ref5.headers,
        _ref5$readBody = _ref5.readBody,
        readBody = _ref5$readBody === void 0 ? true : _ref5$readBody;

    this.urlPrefix = urlPrefix;
    this.headers = headers;
    this.readBody = readBody;
    this.middleware = [];
  }

  var _proto = Teleman.prototype;

  _proto.use = function use(middleware) {
    this.middleware.push(middleware);
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

    var _ref6 = _temp2 === void 0 ? {} : _temp2,
        _ref6$method = _ref6.method,
        method = _ref6$method === void 0 ? 'GET' : _ref6$method,
        _ref6$urlPrefix = _ref6.urlPrefix,
        urlPrefix = _ref6$urlPrefix === void 0 ? this.urlPrefix : _ref6$urlPrefix,
        headers = _ref6.headers,
        query = _ref6.query,
        _ref6$params = _ref6.params,
        params = _ref6$params === void 0 ? {} : _ref6$params,
        body = _ref6.body,
        _ref6$readBody = _ref6.readBody,
        readBody = _ref6$readBody === void 0 ? this.readBody : _ref6$readBody,
        _ref6$use = _ref6.use,
        use = _ref6$use === void 0 ? this.middleware : _ref6$use,
        _ref6$useBefore = _ref6.useBefore,
        useBefore = _ref6$useBefore === void 0 ? [] : _ref6$useBefore,
        _ref6$useAfter = _ref6.useAfter,
        useAfter = _ref6$useAfter === void 0 ? [] : _ref6$useAfter,
        rest = _objectWithoutPropertiesLoose(_ref6, ["method", "urlPrefix", "headers", "query", "params", "body", "readBody", "use", "useBefore", "useAfter"]);

    return new Promise(function (resolve) {
      method = method.toUpperCase();
      url = url.replace(/:([a-z]\w*)/ig, function (_, w) {
        return encodeURIComponent(params[w]);
      });
      var absURL = /^https?:\/\//;

      if (!absURL.test(url)) {
        if (urlPrefix) url = urlPrefix + url; // urlPrefix also isn't absolute

        if (!absURL.test(url)) {
          try {
            var a = document.createElement('a');
            a.href = url;
            url = a.href;
          } catch (e) {// node.js env
          }
        }
      }

      url = new URL(url);

      if (query) {
        if (!(query instanceof URLSearchParams)) {
          query = createURLSearchParams(query);
        }

        for (var _iterator3 = query.entries(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          var _ref7;

          if (_isArray3) {
            if (_i3 >= _iterator3.length) break;
            _ref7 = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done) break;
            _ref7 = _i3.value;
          }

          var _ref8 = _ref7,
              name = _ref8[0],
              value = _ref8[1];
          url.searchParams.append(name, value);
        }
      }

      url = url.href;

      if (_this.headers && headers) {
        var h = new Headers(_this.headers);

        for (var _iterator4 = new Headers(headers).entries(), _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
          var _ref9;

          if (_isArray4) {
            if (_i4 >= _iterator4.length) break;
            _ref9 = _iterator4[_i4++];
          } else {
            _i4 = _iterator4.next();
            if (_i4.done) break;
            _ref9 = _i4.value;
          }

          var _ref10 = _ref9,
              name = _ref10[0],
              value = _ref10[1];
          h.set(name, value);
        }

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

      resolve(compose([].concat(useBefore, use, useAfter))(ctx, function () {
        return fetch(ctx.url, ctx.options).then(function (response) {
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

          if (response.ok) {
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

var instance = Teleman.default = new Teleman();
Teleman.use = instance.use.bind(instance);
Teleman.fetch = instance.fetch.bind(instance);
Teleman.get = instance.get.bind(instance);
Teleman.post = instance.post.bind(instance);
Teleman.put = instance.put.bind(instance);
Teleman.patch = instance.patch.bind(instance);
Teleman.delete = instance.delete.bind(instance);
Teleman.head = instance.head.bind(instance);

export default Teleman;
//# sourceMappingURL=Teleman.mjs.map
