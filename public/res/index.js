var colors = [
  "teal", "pink", "purple", "deep-purple", "indigo",
  "blue", "light-blue", "cyan", "blue-grey", "green",
  "light-green", "lime", "yellow", "amber", "orange",
  "deep-orange", "brown", "red", "white"
];

var cardWidths = [3, 4, 6, 2];
var cardWidths_idx = parseInt(getCookie('cardWidths_idx')) || 0;

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
    replaceWhitespace: function(input) {
      var newStr = input.replace(' ', '_');
      return newStr;
    },
    changeTextProperty: function(prop, index, filter) {
      var newValue = prompt("Enter new " + prop, this.products[index][prop]);
      if (!newValue) return;
      if (filter) newValue = filter(newValue);
      this.products[index][prop] = newValue;
      this.products[index].changed = true;
    },
    nextColor: function(item) {
      if (!item.color_idx) item.color_idx = 0;
      item.color = colors[item.color_idx];
      item.color_idx += 1;
      if (item.color_idx >= colors.length) item.color_idx = 0;
      item.changed = true;
    },
    save: function(item) {
      pushDocument(item);
    },
    remove: function(item) {
      deleteDocument(item, function() {
        location.reload();
      });
    },
    newProduct: function() {
      pushDocument({
        name: 'New Document Name',
        link: 'http://google.com',
        icon: 'remove_circle_outline',
        color: 'red',
        changed: false,
        desc: 'Enter description here'
      }, function () {
        location.reload();
      });
    },
    changeLayout: function() {
      cardWidths_idx += 1;
      if (cardWidths_idx >= cardWidths.length) cardWidths_idx = 0;
      setCookie('cardWidths_idx', cardWidths_idx);
      this.cardRatio = cardWidths[cardWidths_idx];
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
    cardRatio: cardWidths[cardWidths_idx], /* Share of 12 that cards occupy */
    shared: shared, /* Data shared by all Vue Modules */
    products: [     /* Card set, array of objects */
    ]
  }
});
