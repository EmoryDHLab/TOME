var  mn = document.getElementById("head-nav");
    mns = "head-nav-scrolled";
    hdr = document.getElementsByTagName('header')[0].offsetHeight;
var scrollTop = function() {
  return (window.pageYOffset !== undefined) ? window.pageYOffset :
    (document.documentElement || document.body.parentNode ||
    document.body).scrollTop;}

window.onscroll = function() {
  if( scrollTop() > hdr ) {
    mn.className = mns;
  } else {
    mn.className = "";
  }
};
