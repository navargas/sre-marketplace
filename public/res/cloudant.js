function pushDocument(doc) {
  var insert = buildQuery('/');
  Vue.http.post(insert, doc, {emulateJSON:false}).then(function(res) {
    alert('Save complete');
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}
