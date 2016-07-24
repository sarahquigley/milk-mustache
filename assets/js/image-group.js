$(document).ready(function() {
  var $imageGroups = $('.image-group');
  $imageGroups.each(function(i){
    var $childImgs = $(this).find('img');
    $childImgs.each(function(j){
      var aspectRatio = this.naturalWidth / this.naturalHeight;
      $(this).parent('.image-container').css('flex', aspectRatio.toString() + ' 1 0%');
      console.log(aspectRatio);
    });
  });
});
