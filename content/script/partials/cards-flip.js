$('.card').click(function() {
    // toggle event removed in jQuery 1.9
    var card = $(this);
    if (!card.data('flipped')) {
      card.addClass('flip');
      card.data('flipped', true);
    } else {
      card.removeClass('flip');
      card.data('flipped', false);
    }
  });
