const prompt = require("prompt-sync")({ sigint: true });
const fs = require("fs-extra");

let config = require("./config/configExample.json");
let passportKeys = require("./config/passportKeysExample.json");

if (process.argv[2]=="--headless") {
  // saving defaults
  fs.copySync('./config/configExample.json', './config/config.json')
  fs.copySync('./config/passportKeysExample.json', './config/passportKeys.json')
  process.exit(0);
}

console.log("Hello!");
console.log("Starting setup...");

config.self_hosted =
  prompt(
    "Use Auto-generated TLS? (will require ports 80 and 443) (y/N): ",
 false
  ).toLowerCase() == "y";

if (config.self_hosted) {
  console.log("Showing additional TLS options:");
  config.tls.email = prompt("Enter Letsencrypt email (your email): ");
  config.tls.tos =
    prompt(
      "Do you agree with the LetsEncrypt TOS? (Y/n): ",
      true
    ).toLowerCase() == "y";

  if (!config.tls.tos) {
    config.self_hosted = false;
    console.log("Reverting LetsEncrypt setup...");
  } else {
    let current = 0;
    while (true) {
      config.tls.domains[current] = prompt(
        "Please enter domain " + (current + 1) + " (ENTER to cancel): "
      );
      if (config.tls.domains[current] == "") {
        config.tls.domains.splice(current, 1);
        break;
      } else {
        current++;
      }
    }
  }
}

if (!config.self_hosted) {
  config.port = ~~prompt("Enter port (3000): ", config.port);
  config.secure_override = ~~prompt(
    "Will you use an external HTTPS/TLS provider proxy? Secure cookies will be enabled, if yes (y/N): ",
    false
  );
}

if (
  prompt(
    "Do you want to set up Google and Twitter API keys? (Y/n): ",
    "Y"
  ).toLowerCase() == "y"
) {
  console.log(
    "An external url is required for Google and Twitter auth to function."
  );
  config.url = prompt(
    "Enter your website url: (http://example.com): ",
    config.url
  );

  console.log("Showing additional API KEY information:");
  console.log(
    "Go to https://console.developers.google.com and create a new project. Then, create credentials for 'OAuth client ID'."
  );
  passportKeys.GOOGLE_ID = prompt("Paste the Client ID here:");
  passportKeys.GOOGLE_SECRET = prompt("Paste the Client secret here:");
  console.log("Great!");
  console.log(
    "Now, go to https://developer.twitter.com/en/apps and create a new twitter app. Navigate to Consumer API keys."
  );
  passportKeys.TWITTER_KEY = prompt("Paste the API key here:");
  passportKeys.TWITTER_SECRET = prompt("Paste the API secret key here:");
  console.log("Passport keys configured.");
}

console.log("Setup done. Generating session secret and exiting...");

config.session_secret = [...Array(30)]
  .map(i => (~~(Math.random() * 36)).toString(36))
  .join("");

// writing and exitting
fs.writeJsonSync("./config/config.json", config);
fs.writeJsonSync("./config/passportKeys.json", passportKeys);

process.exit(0);
