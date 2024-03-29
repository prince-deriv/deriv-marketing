/*!
 * JavaScript Cookie v2.2.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
  var registeredInModuleLoader;
  if (typeof define === "function" && define.amd) {
    define(factory);
    registeredInModuleLoader = true;
  }
  if (typeof exports === "object") {
    module.exports = factory();
    registeredInModuleLoader = true;
  }
  if (!registeredInModuleLoader) {
    var OldCookies = window.Cookies;
    var api = (window.Cookies = factory());
    api.noConflict = function () {
      window.Cookies = OldCookies;
      return api;
    };
  }
})(function () {
  function extend() {
    var i = 0;
    var result = {};
    for (; i < arguments.length; i++) {
      var attributes = arguments[i];
      for (var key in attributes) {
        result[key] = attributes[key];
      }
    }
    return result;
  }

  function decode(s) {
    return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
  }

  function init(converter) {
    function api() {}

    function set(key, value, attributes) {
      if (typeof document === "undefined") {
        return;
      }

      attributes = extend(
        {
          path: "/",
        },
        api.defaults,
        attributes
      );

      if (typeof attributes.expires === "number") {
        attributes.expires = new Date(
          new Date() * 1 + attributes.expires * 864e5
        );
      }

      // We're using "expires" because "max-age" is not supported by IE
      attributes.expires = attributes.expires
        ? attributes.expires.toUTCString()
        : "";

      try {
        var result = JSON.stringify(value);
        if (/^[\{\[]/.test(result)) {
          value = result;
        }
      } catch (e) {}

      value = converter.write
        ? converter.write(value, key)
        : encodeURIComponent(String(value)).replace(
            /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
            decodeURIComponent
          );

      key = encodeURIComponent(String(key))
        .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
        .replace(/[\(\)]/g, escape);

      var stringifiedAttributes = "";
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue;
        }
        stringifiedAttributes += "; " + attributeName;
        if (attributes[attributeName] === true) {
          continue;
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
      }

      return (document.cookie = key + "=" + value + stringifiedAttributes);
    }

    function get(key, json) {
      if (typeof document === "undefined") {
        return;
      }

      var jar = {};
      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split("; ") : [];
      var i = 0;

      for (; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        var cookie = parts.slice(1).join("=");

        if (!json && cookie.charAt(0) === '"') {
          cookie = cookie.slice(1, -1);
        }

        try {
          var name = decode(parts[0]);
          cookie =
            (converter.read || converter)(cookie, name) || decode(cookie);

          if (json) {
            try {
              cookie = JSON.parse(cookie);
            } catch (e) {}
          }

          jar[name] = cookie;

          if (key === name) {
            break;
          }
        } catch (e) {}
      }

      return key ? jar[key] : jar;
    }

    api.set = set;
    api.get = function (key) {
      return get(key, false /* read as raw */);
    };
    api.getJSON = function (key) {
      return get(key, true /* read as json */);
    };
    api.remove = function (key, attributes) {
      set(
        key,
        "",
        extend(attributes, {
          expires: -1,
        })
      );
    };

    api.defaults = {};

    api.withConverter = init;

    return api;
  }

  return init(function () {});
});

const CookieStorage = function (cookie_name, cookie_domain = "") {
  const hostname = window.location.hostname;
  const is_deriv_com = String(hostname).includes("deriv.com");
  const is_binary_sx = String(hostname).includes("binary.sx");

  this.initialized = false;
  this.cookie_name = cookie_name;
  if (is_deriv_com) {
    this.domain = "deriv.com";
  } else if (is_binary_sx) {
    this.domain = "binary.sx";
  } else {
    this.domain = cookie_domain ?? String(hostname);
  }
  this.path = "/";
  this.same_site = "none";
  this.is_secure = true;
  this.expires = new Date("Thu, 1 Jan 2037 12:00:00 GMT");
  this.value = {};
};

CookieStorage.prototype = {
  initialize() {
    const cookie_value = Cookies.get(this.cookie_name);
    try {
      this.value = cookie_value ? JSON.parse(cookie_value) : {};
    } catch (e) {
      this.value = {};
    }
    this.initialized = true;
  },
  write(val, expiry_date, is_secure, sameSite) {
    if (!this.initialized) this.initialize();
    this.value = val;
    if (expiry_date) this.expires = expiry_date;
    Cookies.set(this.cookie_name, this.value, {
      expires: this.expires,
      path: this.path,
      domain: this.domain,
      secure: !!is_secure,
      sameSite: sameSite || "strict",
    });
  },
  get(key) {
    if (!this.initialized) this.initialize();
    return this.value[key];
  },
  set(key, val, options) {
    if (!this.initialized) this.initialize();
    this.value[key] = val;
    Cookies.set(this.cookie_name, this.value, {
      expires: new Date(this.expires),
      path: this.path,
      domain: this.domain,
      secure: this.is_secure,
      sameSite: this.same_site,
      ...options,
    });
  },
  remove() {
    Cookies.remove(this.cookie_name, {
      path: this.path,
      domain: this.domain,
    });
  },
};

const getCookiesFields = () => [
  "date_first_contact",
  "signup_device",
  "gclid",
  "utm_source",
  "utm_ad_id",
  "utm_adgroup_id",
  "utm_adrollclk_id",
  "utm_campaign",
  "utm_campaign_id",
  "utm_content",
  "utm_fbcl_id",
  "utm_gl_client_id",
  "utm_medium",
  "utm_msclk_id",
  "utm_term",
];

const getCookiesObject = (cookies) => {
  const cookies_objects = {};

  cookies.forEach((cookie_name) => {
    const cookie_object = new CookieStorage(
      cookie_name.includes("utm") ? "utm_data" : cookie_name
    );
    cookies_objects[cookie_name] = cookie_object;
  });

  return cookies_objects;
};

const getDataObjFromCookies = (cookies, fields) => {
  console.log({
    cookies,
  });
  const data = {};
  fields.forEach((elem) => {
    if (cookies[elem].get(elem)) {
      data[elem] = cookies[elem].get(elem);
    }
  });
  return data;
};

const getDataLink = (data) => {
  let data_link = "";

  Object.keys(data).forEach((elem) => {
    data_link += `&${elem}=${data[elem]}`;
  });

  return data_link;
};

const loginUrl = (platform) => {
  const cookies = getCookiesFields();
  const cookies_objects = getCookiesObject(cookies);
  const cookies_value = getDataObjFromCookies(cookies_objects, cookies);
  const cookies_link = getDataLink(cookies_value);

  const affiliate_tracking = Cookies.getJSON("affiliate_tracking");

  const affiliate_token_link = affiliate_tracking
    ? `&affiliate_token=${affiliate_tracking}`
    : "";

  const lang = "hi";

  return `https://oauth.deriv.com/oauth2/authorize?app_id=16929&l=${lang}&brand=deriv&${affiliate_token_link}${cookies_link}&platform=&social_signup=${platform}`;
};

window.onload = () => {
  document.querySelectorAll(".social-media-login").forEach((e) => {
    e.addEventListener("click", () => {
      const platform = e.getAttribute("data-platform");

      window.location.href = loginUrl(platform);
    });
  });
};
