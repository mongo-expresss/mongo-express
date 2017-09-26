import $ from 'jquery';
import renderjson from 'renderjson';
import CodeMirror from './codeMirrorLoader';

const $document = $(document);

function getParameterByName(name) {
  name = name.replace(/\[/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

$document.ready(function () {
  $('#tabs').tab();
  if (document.location.href.indexOf('query=') >= 0 && getParameterByName('query') !== '') {
    $('#tabs a[href="#advanced"]').tab('show');
  }
});

const addDoc = CodeMirror.fromTextArea(document.getElementById('document'), {
  mode: { name: 'javascript', json: true },
  indentUnit: 4,
  electricChars: true,
  matchBrackets: true,
  lineNumbers: true,
  theme: ME_SETTINGS.codeMirrorEditorTheme,
});

const addIndexDoc = CodeMirror.fromTextArea(document.getElementById('index'), {
  mode: { name: 'javascript', json: true },
  indentUnit: 4,
  electricChars: true,
  matchBrackets: true,
  lineNumbers: true,
  theme: ME_SETTINGS.codeMirrorEditorTheme,
});


window.checkValidJSON = function () {
  $.ajax({
    type: 'POST',
    url: `${ME_SETTINGS.baseHref}checkValid`,
    data: {
      document: addDoc.getValue(),
    },
  }).done((data) => {
    if (data === 'Valid') {
      $('#documentInvalidJSON').remove();
      $('#addDocumentForm').submit();
    } else if ($('#documentInvalidJSON').length === 0) {
      $('#document-modal-body').parent().append('<div id="documentInvalidJSON" class="alert alert-danger"><strong>Invalid JSON</strong></div>');
    }
  });
  return false;
};

window.checkValidIndexJSON = function () {
  $.ajax({
    type: 'POST',
    url: `${ME_SETTINGS.baseHref}checkValid`,
    data: {
      document: addIndexDoc.getValue(),
    },
  }).done((data) => {
    if (data === 'Valid') {
      $('#indexInvalidJSON').remove();
      $('#addIndexForm').submit();
    } else if ($('#indexInvalidJSON').length === 0) {
      $('#index-modal-body').parent().append('<div id="indexInvalidJSON" class="alert alert-danger"><strong>Invalid JSON</strong></div>');
    }
  });
  return false;
};

$('#addDocument').on('shown.bs.modal', function () {
  addDoc.refresh();
  addDoc.focus();
});

$('#addIndex').on('shown.bs.modal', function () {
  addIndexDoc.refresh();
  addIndexDoc.focus();
});

if (ME_SETTINGS.collapsibleJSON) {
  $(function () {
    // convert all objects to renderjson elements
    $('div.tableContent pre').each(function () {
      const $this = $(this);
      const text = $.trim($this.text());
      if (text) {
        $this.html(renderjson(JSON.parse(text)));
      }
    });
  });
  renderjson.set_show_to_level(ME_SETTINGS.collapsibleJSONDefaultUnfold);
}

function makeCollectionUrl() {
  const st = ME_SETTINGS;
  return `${st.baseHref}db/${st.dbName}/${st.collectionName}/`;
}

window.loadDocument = function (id) {
  location.href = `${makeCollectionUrl()}${encodeURIComponent(id)}`;
};

  $('.deleteButtonDocument').on('click', function (e) {
    const $form = $(this).closest('form');
    e.stopPropagation();
    e.preventDefault();

    $('#confirm-deletion-document').modal({ backdrop: 'static', keyboard: false }).one('click', '#delete', function () {
      $form.trigger('submit'); // submit the form
    });
  });


  $('.deleteButtonCollection').on('click', function (event) {

    $('.deleteButtonCollection').tooltip('hide');

    event.preventDefault();

    const $target = $(this);
    const $parentForm = $('#' + $target.attr('childof'));

    $('#confirmation-input').attr('shouldbe', $target.attr('collection-name'));
    $('#modal-collection-name').text($target.attr('collection-name'));
    $('#confirm-deletion-collection').modal({ backdrop: 'static', keyboard: false })
      .one('shown.bs.modal', function () {
        $('#confirmation-input').focus();
      })
      .one('click', '#delete', function () {
        const $input = $('#confirmation-input');
        if ($input.val().toLowerCase() === $input.attr('shouldbe').toLowerCase()) {
          $parentForm.trigger('submit');
        }
      });
  });
});
