function pushDocument(doc, callback) {
  var insert = buildQuery('/', DATABASE);
  doc.changed = false;
  // doc.stars will be overwritten on load, but this prevents meaningless
  // info from being saved to cloudant
  delete doc.stars;
  delete doc.voted;
  Vue.http.post(insert, doc, {emulateJSON:false}).then(function(res) {
    doc._rev = res.data.rev
    if (!callback) alert('Save complete');
    else callback();
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}

function uploadVote(target, callback) {
  var doc = {
    target: target,
    type: 'like'
  }
  var insert = buildQuery('/', VOTES_DATABASE);
  Vue.http.post(insert, doc, {emulateJSON:false}).then(function(res) {
    doc._rev = res.data.rev
    if (!callback) alert('Save complete');
    else callback(doc);
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}

function deleteDocument(doc, callback) {
  if (!doc._id) return;
  doc._deleted = true;
  var insert = buildQuery('/'+doc._id+'?rev='+doc._rev, DATABASE);
  Vue.http.delete(insert).then(function(res) {
    if (!callback) alert('Save complete');
    else callback();
  }, function(res) {
    console.error(res);
    alert('Could not save document, check console');
  });
}
