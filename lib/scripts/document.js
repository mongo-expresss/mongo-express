import $ from 'jquery';
import CodeMirror from './codeMirrorLoader';

const doc = CodeMirror.fromTextArea(document.getElementById('document'), {
  mode: {
    name: 'javascript',
    json: true,
  },
  indentUnit: 4,
  lineNumbers: true,
  autoClearEmptyLines: true,
  matchBrackets: true,
  readOnly: ME_SETTINGS.readOnly,
  theme: ME_SETTINGS.codeMirrorEditorTheme,
});

window.onBackClick = function () {
  // "Back" button is clicked

  if (doc.isClean()) {
    history.back();
  } else if ($('#discardChanges').length === 0) {
    $('#pageTitle').parent().append(
      '<div id="discardChanges" class="alert alert-warning"><strong>Document has changed! Are you sure you wish to go back?</strong></div>'
    );
    $('.backButton').text('Back & Discard Changes');
  } else {
    history.back();
  }

  return false;
};
};
