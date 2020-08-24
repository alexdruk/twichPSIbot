const tmi = require('tmi.js');
const fetch = require("node-fetch");
// Define configuration options
const options = require('./config.js')
const client = new tmi.Client(options);
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
    if(self) return;
    message = message.trim();
//    console.log('message: '+ message.toLowerCase());
    let reURL = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm;
    let Rurl = message.match(reURL);
    if (Rurl) {
//      console.log(`url ${Rurl} detected`);
      let content = message.toLowerCase().split(" ");
      let command = content[content.length-2];
//      console.log('command='+command);
      if ((command === '!m-url') || (command === '!d-url') ) {
        let strategy = 'MOBILE';
        if (command === '!d-url') { strategy = 'DESKTOP';}
        const url = setUpQuery(Rurl, strategy);
        console.log(`query: ${url}`);
        runPSItest(url,channel);
    
      }
    }
    else {
//      console.log(`no url detected`);
    }
});

function runPSItest(url,channel) {
  try{
    fetch(url)
    .then(response => {
      if (response.status >= 400) {
        client.say(channel, "Bad response from server");  
        throw new Error("Bad response from server");
      }
      return response.json();
    })
      .then(json => {
        showInitialContent(json.id,channel);
        const lighthouse = json.lighthouseResult;
        const lighthouseMetrics = {
          'First Contentful Paint': lighthouse.audits['first-contentful-paint'].displayValue,
          'Speed Index': lighthouse.audits['speed-index'].displayValue,
          'Time To Interactive': lighthouse.audits['interactive'].displayValue,
          'First Meaningful Paint': lighthouse.audits['first-meaningful-paint'].displayValue,
          'First CPU Idle': lighthouse.audits['first-cpu-idle'].displayValue,
          'Estimated Input Latency': lighthouse.audits['estimated-input-latency'].displayValue
        };
        showLighthouseContent(lighthouseMetrics,channel);
      });
  }catch (err) {
    console.error(err);
    client.say(channel, `${err}`);
  }
}

function setUpQuery(url, strategy) {
  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const parameters = {
    url: encodeURIComponent(url),
    strategy: strategy
  };
  let query = `${api}?`;
  for (key in parameters) {
    query += `&${key}=${parameters[key]}`;
  }
  return query;
}

function showInitialContent(id, channel) {
//  page.textContent = `Page tested: ${id}`;
  client.say(channel, `Page tested by PageSpeed Insights:`);
  client.say(channel, `${id}`);

}

function showLighthouseContent(lighthouseMetrics,channel) {
  client.say(channel,"Lighthouse Results:");
  for (key in lighthouseMetrics) {
    client.say(channel,`${key}: ${lighthouseMetrics[key]}`);
  }
}