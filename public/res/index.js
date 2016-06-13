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
  var url = buildQuery(query, DATABASE);
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
    rateToggle: function(item) {
      /* item unvoting not yet supported */
      if (item.voted) return;
      /* ------------------------------- */
      if (item.voted) {
        item.stars -= 1;
        // delete vote from cloudant
      } else {
        item.stars += 1;
        var votes = getCookie('votes').split(',');
        votes.push(item._id);
        setCookie('votes', votes.join(','));
        uploadVote(item._id, function(voteDoc) {
        });
      }
      item.voted = !item.voted;
    },
    downloadRatings: function() {
      var url = buildQuery(RATINGS_VIEW, VOTES_DATABASE);
      var that = this;
      Vue.http.get(url).then(function (res) {
        if (!res.data) return;
        var ratings = res.data.rows;
        for (var index in ratings) {
          if (!ratings[index].key || !ratings[index].value) continue;
          that.stars[ratings[index].key] = ratings[index].value;
        }
        that.initializeStars();
      }, function (res) {
        // error, fails silently if ratings is not available or enabled
      });
    },
    clearStarAttr: function(array) {
      var voted_already = getCookie('votes').split(',');
      for (var index in array) {
        array[index].stars = 0;
        array[index].voted = false;
        if (voted_already.indexOf(array[index]._id) >= 0) {
          array[index].voted = true;
        }
      }
    },
    initializeStars: function() {
      for (var index in this.products) {
        this.products[index].stars = 0;
        if (this.stars[this.products[index]._id]) {
          this.products[index].stars = this.stars[this.products[index]._id];
        }
      }
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
          that.clearStarAttr(data);
          that.products = that.products.concat(data);
          that.downloadRatings();
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
    stars: {},      /* Raw data for setting ratings */
    products: [     /* Card set, array of objects */
    ]
  }
});
