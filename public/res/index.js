var account = '24b8ec10-c7ad-4100-aa31-d23be01d2f92-bluemix.cloudant.com/';
var database = 'marketplace-prod';
var all_doc_query = '/_all_docs?include_docs=true&conflicts=true';
var PER_PAGE = 10 * 3; /* 10 rows of 3 items per column */

var colors = [
  "red", "pink", "purple", "deep-purple", "indigo",
  "blue", "light-blue", "cyan", "teal", "green",
  "light-green", "lime", "yellow", "amber", "orange",
  "deep-orange", "brown", "blue-grey"
];

/* Extract property from an array of objects */
function unpackAttribute(array, key) {
  var result = [];
  for (var index = 0; index < array.length; index++) {
    if (array[index][key] !== undefined)
      result.push(array[index][key]);
  }
  return result;
}

/* Build Cloudant query. "authentication" is not required for
   most operations */
function buildQuery(query, authentication) {
  if (!authentication) authentication = '';
  var url = 'https://' + authentication + '@' + account + database + query;
  return url;
}

/* Download documents from Cloudant */
function getDocuments(page, callback) {
  var query = all_doc_query + '&limit=' + PER_PAGE + '&skip=' + (PER_PAGE * page);
  var url = buildQuery(query);
  Vue.http.get(url).then(function (res) {
    if (callback) callback(unpackAttribute(res.data.rows, 'doc'));
  }, function (res) {
    if (callback) callback(null, 'Could not fetch data from cloudant');
  });
}

/* Main Vue instance */
var index = new Vue({
  el: '#mainbox',
  ready: function() {
    this.loadMore();
  },
  methods: {
    loadMore: function() {
      var that = this;
      if (this.loading) return;
      this.loading = true;
      getDocuments(this.page, function(data, err) {
        if (err) {
          alert(err);
        }
        if (data && data.length > 0) {
          that.products = that.products.concat(data);
          that.page += 1;
        }
        that.loading = false;
      });
    },
    pageBottom: function() {
      this.loadMore();
    },
    refresh: function() {
      this.page = 0;
      this.loading = false;
      this.products = [];
      this.loadMore();
    }
  },
  data: {
    page: 0,        /* Page of next card set */
    shared: shared, /* Data shared by all Vue Modules */
    products: [     /* Card set, array of objects */
    ]
  }
});
