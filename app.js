$(document).ready(function() {

  function saveAndAddClearButton(header, rows) {
    window.localStorage.header = JSON.stringify(header);
    window.localStorage.rows = JSON.stringify(rows);
    window.localStorage.date = (new Date()).toString();

    var $clear = $('<button class="btn btn-sm btn-outline-danger clear">Clear</button>');
    $('p.message').append($clear);
    $clear.click(function(e) {
      delete window.localStorage.header;
      delete window.localStorage.rows;
      delete window.localStorage.date;
      window.location.reload();
    });
  }

  function buildTable(header, rows) {
    var $thead = $('table>thead').empty();
    var $tbody = $('table>tbody').empty();

    var $tr = $('<tr></tr>').appendTo($thead);
    header.forEach(function(value) {
      $tr.append('<th>' + value + '</th>');
    });

    rows.forEach(function(row) {
      var $tr = $('<tr></tr>').appendTo($tbody);
      row.forEach(function(value) {
        $tr.append('<td>' + value + '</td>');
      });
    });
    $('p.message').html(rows.length + ' rows loaded. ');
    saveAndAddClearButton(header, rows);
  }

  function onPaste(e) {
    if (!e.originalEvent.clipboardData || !e.originalEvent.clipboardData.items) return;

    var items = e.originalEvent.clipboardData.items;
    var data;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type == 'text/plain') {
        data = items[i];
        break;
      }
    }
    if (!data) return;

    data.getAsString(function(text) {
      text = text.replace(/\r/g, '').trim('\n');
      var rowsOfText = text.split('\n');
      var header = [];
      var rows = [];
      rowsOfText.forEach(function(rowAsText) {
        // Remove wrapping double quotes
        var row = rowAsText.split('\t').map(function(colAsText) {
          return colAsText.trim().replace(/^"(.*)"$/, '$1');
        });
        // The first row with data is assumed to be the header
        if (header.length == 0) {
          // Remove empty columns
          while (row.length && !row[row.length-1].trim()) row.pop();
          if (row.length == 0) return;
          header = row;
        } else {
          rows.push(row.slice(0, header.length));
        }
      });
      buildTable(header, rows);
    });
  }

  $(document).on('paste', onPaste);

  // Attempt to restore from local storage
  try {
    var header = JSON.parse(window.localStorage.header);
    var rows = JSON.parse(window.localStorage.rows);
    buildTable(header, rows);
    $('p.message').append('<br/><em>' + window.localStorage.date + '</em>');
  } catch (err) {}

});