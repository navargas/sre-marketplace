var account = new Vue({
  el: '#account',
  ready: function() {
    var key = getCookie('cloudant_key');
    if (!key) return;
    Vue.http.headers.common['Authorization'] = "Basic " + btoa(key);
    Vue.http.get(buildQuery('/_all_docs?limit=1', DATABASE)).then(function (res) {
      /* Admin key is valid, authentication was successful */
      this.shared.admin = true;
    }, function (res) {
      if (res.status == 401) {
        /* Admin key is not valid */
        eraseCookie('cloudant_key');
        alert('Authentication Failure');
        location.reload();
      } else {
        console.error(res);
      }
    });
  },
  methods: {
    signout: function() {
      eraseCookie('cloudant_key');
      location.reload();
    },
    changeLayout: index.changeLayout,
    toggleAdmin: function() {
      this.adminToggle = true;
      this.shared.admin = !this.shared.admin;
    },
    importKey: function() {
      console.log('import');
      var key = prompt('Paste admin key here:');
      if (!key) return;
      if (key.split(':').length != 2) {
        alert('Invalid admin key format');
        return;
      }
      setCookie('cloudant_key', key, 100);
      location.reload();
    }
  },
  data: {
    shared: shared,     /* Data shared by all Vue Modules */
    adminToggle: false, /* Show toggle button */
  }
});
