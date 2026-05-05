// when you create a service, register its route:
await fetch("http://localhost:2019/config/apps/http/servers/srv0/routes/...", {
  method: "POST",
  body: JSON.stringify({
    match: [{ host: [`${subdomain}.yourdomain.com`] }],
    handle: [{
      handler: "reverse_proxy",
      upstreams: [{ dial: `localhost:${port}` }],
    }],
  }),
});
