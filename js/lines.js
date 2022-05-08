function init() {
   var field = document.getElementById("field");
   var fieldImg = document.getElementById("fieldImg");

   var leftImgOffset = window.outerWidth/2 - fieldImg.naturalWidth/2 -field.offsetLeft; //window.outerWidth/2 -600 -field.offsetLeft;
   fieldImg.style.left = leftImgOffset;

   window.onresize = function(e) {
     let newLeftImgOffset = window.outerWidth/2 - fieldImg.naturalWidth/2 -field.offsetLeft;
     fieldImg.style.left = newLeftImgOffset;
     console.log("w1 = " + w1 + " px;");
   }
}
