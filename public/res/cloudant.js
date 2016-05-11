function pushDocument(doc, callback) {
  var insert = buildQuery('/');
  Vue.http.post(insert, doc, {emulateJSON:false}).then(function(res) {
    if (!callback) alert('Save complete');
    else callback();
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}
