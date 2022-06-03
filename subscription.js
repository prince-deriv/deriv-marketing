const queryParams = {
  get: (key) => {
    const params = new URLSearchParams(location.search);
    let param_values = {};

    if (typeof key === "string") {
      return params.get(key);
    } else {
      key.forEach((k) => {
        param_values[key] = params.get(k);
      });
    }
    return param_values;
  },
  set: (objects) => {
    const url = new URL(location);

    Object.keys(objects).forEach((k) => {
      const value = objects[k];
      url.searchParams.set(k, value);
    });

    return window.history.replaceState(null, null, url);
  },
  delete: (key) => {
    const url = new URL(location);
    if (typeof key === "string") {
      url.searchParams.delete(key);
    } else {
      key.forEach((k) => {
        url.searchParams.delete(k);
      });
    }

    return history.replaceState(null, null, url);
  },
};

window.onload = (function () {
  var mySocket = new WebSocket(
    "wss://green.binaryws.com/websockets/v3?app_id=16929&l=en&brand=deriv"
  );

  mySocket.onmessage = function (msg) {
    const response = JSON.parse(msg.data);
    if (response.msg_type === "error") {
      mySocket.close();
    }
    if (response.msg_type === "verify_email") {
      window.location.href = "http://deriv.com";
    }
  };

  var form = document.getElementsByTagName("form");
  var input = document.querySelectorAll("input[type=email]")[0];
  var button = document.querySelectorAll("button[type=submit]")[0];
  var checkbox = document.querySelectorAll("input[type=checkbox]")[0];

  button.disabled = true;

  if (button.disabled) {
    button.style.opacity = "60%";
  }

  var is_checked = false;
  var is_filled = false;

  function checkEnableButton() {
    if (is_checked && is_filled) {
      button.disabled = false;
      button.style.opacity = "100%";
    }
  }

  checkbox.addEventListener("change", function (event) {
    is_checked = event.target.checked;
    checkEnableButton();
  });

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  input.addEventListener("change", function (event) {
    is_filled = validateEmail(event.target.value);
    if (is_filled) {
      checkEnableButton();
    }
  });

  var date = new Date();
  var formatted_date = date.toISOString().split("T")[0];

  form[0].addEventListener("submit", function (e) {
    mySocket.send(
      JSON.stringify({
        verify_email: input.value,
        type: "account_opening",
        url_parameters: {
          date_first_contact: formatted_date,
          signup_device: "desktop",
          utm_source: queryParams.get("utm_source"),
          utm_content: "forex-ebook",
        },
      })
    );
    e.preventDefault();
  });
})();
