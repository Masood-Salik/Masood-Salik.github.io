const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
});

document.querySelectorAll('.hidden').forEach(section => {
  observer.observe(section);
});

const tagline = document.querySelector('.tagline');
const taglineText = tagline.textContent;
tagline.textContent = '';
let index = 0;
function typeTagline() {
  if (index < taglineText.length) {
    tagline.textContent += taglineText.charAt(index);
    index++;
    setTimeout(typeTagline, 100);
  } else {
    tagline.style.animation = 'none';
    tagline.style.borderRight = 'none';
  }
}
typeTagline();
