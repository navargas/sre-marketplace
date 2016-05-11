function pushDocument(doc, callback) {
  var insert = buildQuery('/');
  Vue.http.post(insert, doc, {emulateJSON:false}).then(function(res) {
    doc._rev = res.data.rev
    if (!callback) alert('Save complete');
    else callback();
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}

function deleteDocument(doc, callback) {
  if (!doc._id) return;
  doc._deleted = true;
  var insert = buildQuery('/'+doc._id+'?rev='+doc._rev);
  Vue.http.delete(insert).then(function(res) {
    if (!callback) alert('Save complete');
    else callback();
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}
