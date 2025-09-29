// Flag para rastrear se estamos em transição de navegação
let isTransitioning = false;
let currentSection = 0;

const container = document.getElementById('container');
const sections = Array.from(container.querySelectorAll('section'));

// Encolhe o header no scroll da janela
window.addEventListener('scroll', function() {
  const h1 = document.getElementById('main-title');
  const header = document.querySelector('header');
  const body = document.body;

  if (window.scrollY > 10) {
    h1.classList.add('hide');
    header.classList.add('shrink');
    body.classList.add('shrink-header');
  } else {
    h1.classList.remove('hide');
    header.classList.remove('shrink');
    body.classList.remove('shrink-header');
  }
});

// Atualiza a posição da seta na home
function updateArrowPosition() {
  const movingArrow = document.querySelector('.arrow-svg-bg');
  if (movingArrow) {
    // Se estiver na primeira seção, seta grudada na esquerda (left = 0)
    if (currentSection === 0) {
      movingArrow.style.left = `0px`;
    } else {
      const maxDistance = 350;
      movingArrow.style.left = `${currentSection * maxDistance}px`;
    }
  }
}

// Lida com navegação via roda do mouse
function handleSectionScroll() {
  let readyToAdvance = Array(sections.length).fill(false);
  let readyToBack = Array(sections.length).fill(false);

  sections.forEach((section, idx) => {
    section.addEventListener('wheel', function(e) {
      if (isTransitioning) return;

      // Avançar para próxima seção
      if (e.deltaY > 0 && idx < sections.length - 1) {
        if (section.scrollTop + section.clientHeight >= section.scrollHeight - 1) {
          if (readyToAdvance[idx]) {
            isTransitioning = true;
            shrinkHeader();
            currentSection = idx + 1;
            container.style.transform = `translateX(-${currentSection * 100}vw)`;
            updateArrowPosition();
            readyToAdvance[idx] = false;
            readyToBack[idx] = false;
            setTimeout(() => isTransitioning = false, 300);
          } else {
            readyToAdvance[idx] = true;
          }
        } else {
          readyToAdvance[idx] = false;
        }
      }

      // Voltar para seção anterior
      if (e.deltaY < 0 && idx > 0) {
        if (section.scrollTop <= 0) {
          if (readyToBack[idx]) {
            isTransitioning = true;
            shrinkHeader();
            currentSection = idx - 1;
            container.style.transform = `translateX(-${currentSection * 100}vw)`;
            updateArrowPosition();
            readyToBack[idx] = false;
            readyToAdvance[idx] = false;
            setTimeout(() => isTransitioning = false, 300);
          } else {
            readyToBack[idx] = true;
          }
        } else {
          readyToBack[idx] = false;
        }
      }
    });
  });

  // Reseta flags ao fim da transição
  container.addEventListener('transitionend', () => {
    readyToAdvance.fill(false);
    readyToBack.fill(false);
    sections[currentSection].scrollTop = 0;
  });
}

// Função para encolher o header
function shrinkHeader() {
  const h1 = document.getElementById('main-title');
  const header = document.querySelector('header');
  const body = document.body;
  h1.classList.add('hide');
  header.classList.add('shrink');
  body.classList.add('shrink-header');
}

// Navega para uma seção específica
function goToSection(targetIndex) {
  if (targetIndex === currentSection) return;

  const totalSections = sections.length;
  let diff = targetIndex - currentSection;
  if (Math.abs(diff) > totalSections / 2) {
    diff = diff > 0 ? diff - totalSections : diff + totalSections;
  }
  const step = diff > 0 ? 1 : -1;
  const steps = Math.abs(diff);

  let currentStep = 0;
  isTransitioning = true;
  shrinkHeader();

  function animate() {
    if (currentStep < steps) {
      currentSection += step;
      if (currentSection < 0) currentSection = totalSections - 1;
      if (currentSection >= totalSections) currentSection = 0;
      container.style.transform = `translateX(-${currentSection * 100}vw)`;
      currentStep++;
      requestAnimationFrame(animate);
    } else {
      updateArrowPosition();
      isTransitioning = false;
    }
  }
  animate();
}

// Adiciona eventos aos links do nav e gerencia a classe ativa para underline
const navLinks = Array.from(document.querySelectorAll('nav a'));
navLinks.forEach((link, idx) => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    goToSection(idx);
    setActiveNavLink(idx);
  });
});

// Atualiza a classe ativa do link do menu para o underline
function setActiveNavLink(activeIndex) {
  navLinks.forEach((link, idx) => {
    if (idx === activeIndex) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Move a seta na seção home
const homeSection = document.querySelector('.home');
if (homeSection) {
  homeSection.addEventListener('scroll', function() {
    const scrollTop = homeSection.scrollTop;
    const maxScroll = homeSection.scrollHeight - homeSection.clientHeight;
    const progress = Math.min(scrollTop / maxScroll, 1);
    const maxDistance = window.innerWidth - document.querySelector('.arrow-svg-bg').offsetWidth; // Limita a seta ao limite da página
    const arrow = document.querySelector('.arrow-svg-bg');
    if (arrow) arrow.style.left = `${progress * maxDistance}px`;
  });
}

// Inicializa
handleSectionScroll();
updateArrowPosition();
setActiveNavLink(currentSection);
