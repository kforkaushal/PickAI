const https = require('https');

const data = JSON.stringify({
  host: "pickai.netlify.app",
  key: "1805cf36ce56461181d2317aa4867207",
  keyLocation: "https://pickai.netlify.app/1805cf36ce56461181d2317aa4867207.txt",
  urlList: ["https://pickai.netlify.app/articles/news/agentic-seo-2026.html"]
});

const endpoints = [
    "api.indexnow.org",
    "www.bing.com",
    "yandex.com",
    "search.naver.com"
];

endpoints.forEach(host => {
  const req = https.request({
    hostname: host,
    path: '/IndexNow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    console.log(`Successfully pinged ${host} with status ${res.statusCode}`);
  });
  req.on('error', (e) => {
    console.error(`Error pinging ${host}: ${e}`);
  });
  req.write(data);
  req.end();
});
