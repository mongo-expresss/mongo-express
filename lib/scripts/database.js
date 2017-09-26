import $ from 'jquery';

$(document).ready(() => {
  $('#collection').popover({
    content: 'Collection names must begin with a letter, underscore or slash, and can contain only letters, underscores, numbers, dots or slashes',
    placement: 'left',
  });

  const $deleteButton = $('.deleteButton');

  $deleteButton.tooltip({
    title: 'Warning! Are you sure you want to delete this collection? All documents will be deleted.',
  });

  $deleteButton.on('click', function onDeleteClick(event) {
    $deleteButton.tooltip('hide');

    event.preventDefault();

    const target = $(this);
    const parentForm = $('#' + target.attr('childof'));

});
