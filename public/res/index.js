var colors = [
  "teal", "pink", "purple", "deep-purple", "indigo",
  "blue", "light-blue", "cyan", "blue-grey", "green",
  "light-green", "lime", "yellow", "amber", "orange",
  "deep-orange", "brown", "red"
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

/* Download documents from Cloudant */
function getDocuments(page, callback) {
  var query = ALL_DOC_QUERY + '&limit=' + PER_PAGE + '&skip=' + (PER_PAGE * page);
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
    changeTextProperty: function(prop, index) {
      var newValue = prompt("Enter new " + prop);
      if (!newValue) return;
      this.products[index][prop] = newValue;
    },
    nextColor: function(item) {
      if (!item.color_idx) item.color_idx = 0;
      item.color = colors[item.color_idx];
      item.color_idx += 1;
      if (item.color_idx >= colors.length) item.color_idx = 0;
    },
    save: function(item) {
      pushDocument(item, function() {
        window.location = '/';
      });
    },
    newProduct: function() {
      pushDocument({
        name: 'New Document Name',
        link: 'http://google.com',
        image: 'https://i.imgur.com/zn7mVz2.png',
        color: 'red',
        desc: 'Enter description here'
      }, function () {
        window.location = '/';
      });
    },
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
