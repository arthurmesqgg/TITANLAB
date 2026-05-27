// ===== TOGGLE MENU =====
const menuBtn = document.getElementById('menu-btn');
const dropdown = document.getElementById('dropdown');

if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('aberto');
    });
}

document.addEventListener('click', () => {
    if (dropdown) dropdown.classList.remove('aberto');
});

// ===== MODO ESCURO / CLARO =====
let trilho = document.getElementById('trilho');
let body   = document.body;

if (trilho) {
    trilho.addEventListener('click', () => {
        trilho.classList.toggle('dark');
        body.classList.toggle('dark');
        localStorage.setItem('tema', body.classList.contains('dark') ? 'dark' : 'light');
        // CORREÇÃO 3: removida a chamada a atualizarImagens() — 
        // as redes sociais ficam com os PNGs padrão, sem troca de ícone pelo tema
    });
}

// Aplica tema salvo ao carregar
let temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'dark') {
    document.body.classList.add('dark');
    if (trilho) trilho.classList.add('dark');
}

// ===== NAVBAR SHRINK NO SCROLL =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    // CORREÇÃO 2: a logo agora está dentro da navbar (nav-right),
    // então encolhe junto com ela automaticamente via CSS
    if (window.scrollY > 50) {
        navbar.classList.add('shrink');
    } else {
        navbar.classList.remove('shrink');
    }
});

// ===== LIGHTBOX =====
const galerias   = document.querySelectorAll('.galeria');
const lightbox   = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const fechar     = document.querySelector('.fechar');
const nextBtn    = document.querySelector('.next-img');
const prevBtn    = document.querySelector('.prev-img');

let indexAtual   = 0;
let listaImagens = [];
let scale        = 1;
let isDragging   = false;
let startX       = 0;
let moveX        = 0;
let scrollCooldown = false;

galerias.forEach(galeria => {
    const imgs = galeria.querySelectorAll('img');
    imgs.forEach((img, index) => {
        img.addEventListener('click', () => {
            listaImagens = Array.from(imgs).map(i => i.src);
            indexAtual   = index;
            abrirImagem();
        });
    });
});

function abrirImagem(direcao = 'direita') {
    lightboxImg.style.transition = 'none';
    lightboxImg.style.transform  = direcao === 'direita'
        ? 'translateX(20%) scale(1)'
        : 'translateX(-20%) scale(1)';

    lightbox.style.display = 'flex';
    // Mostra o botão fechar junto com o lightbox
    fechar.style.display   = 'block';
    lightboxImg.src        = listaImagens[indexAtual];
    scale                  = 1;

    setTimeout(() => {
        lightboxImg.style.transition = 'transform 0.3s ease';
        lightboxImg.style.transform  = 'translateX(0) scale(1)';
    }, 10);
}

function fecharImagem() {
    lightbox.style.display = 'none';
    fechar.style.display   = 'none';
}

function proximaImagem() {
    indexAtual = (indexAtual + 1) % listaImagens.length;
    abrirImagem('direita');
}

function imagemAnterior() {
    indexAtual = (indexAtual - 1 + listaImagens.length) % listaImagens.length;
    abrirImagem('esquerda');
}

if (fechar)   fechar.addEventListener('click', fecharImagem);
if (nextBtn)  nextBtn.addEventListener('click', proximaImagem);
if (prevBtn)  prevBtn.addEventListener('click', imagemAnterior);

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) fecharImagem();
    });
}

// Zoom com scroll do mouse na imagem
if (lightboxImg) {
    lightboxImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect    = lightboxImg.getBoundingClientRect();
        const originX = ((e.clientX - rect.left) / rect.width)  * 100;
        const originY = ((e.clientY - rect.top)  / rect.height) * 100;
        lightboxImg.style.transformOrigin = `${originX}% ${originY}%`;

        scale += e.deltaY < 0 ? 0.2 : -0.2;
        scale  = Math.min(Math.max(1, scale), 3);
        lightboxImg.style.transform = `scale(${scale})`;
    });

    lightboxImg.addEventListener('click', () => {
        scale = 1;
        lightboxImg.style.transform = 'scale(1)';
    });
}

// Scroll fora da imagem troca slide
if (lightbox) {
    lightbox.addEventListener('wheel', (e) => {
        if (lightbox.style.display !== 'flex') return;
        const rect = lightboxImg.getBoundingClientRect();
        const dentroDaImagem =
            e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top  && e.clientY <= rect.bottom;
        if (dentroDaImagem) return;
        e.preventDefault();
        if (scrollCooldown) return;
        scrollCooldown = true;
        e.deltaY > 0 ? proximaImagem() : imagemAnterior();
        setTimeout(() => { scrollCooldown = false; }, 400);
    });

    // Touch swipe
    lightbox.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX     = e.touches[0].clientX;
        lightboxImg.style.transition = 'none';
    });

    lightbox.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        moveX = e.touches[0].clientX - startX;
        lightboxImg.style.transform = `translateX(${moveX}px) scale(${scale})`;
    });

    lightbox.addEventListener('touchend', () => {
        isDragging = false;
        lightboxImg.style.transition = 'transform 0.3s ease';
        if      (moveX >  80) imagemAnterior();
        else if (moveX < -80) proximaImagem();
        else lightboxImg.style.transform = `translateX(0) scale(${scale})`;
        moveX = 0;
    });
}

// Teclado
document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'Escape')      fecharImagem();
        if (e.key === 'ArrowRight')  proximaImagem();
        if (e.key === 'ArrowLeft')   imagemAnterior();
    }
});