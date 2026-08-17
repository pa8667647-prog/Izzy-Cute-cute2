window.onload = function () {
    // VERIFICA O RECARREGAMENTO PRIMEIRO
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
        window.location.href = 'index.html';
        return; // Para a execução para garantir o redirecionamento
    }

    // --- 1. CONTEXTO DE ÁUDIO E ELEMENTOS DO DOM ---
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audio = document.getElementById('audios');
    const gifImage = document.querySelector('.body_left img');
    const loveContainer = document.querySelector(".love");
    const templateBlock = document.querySelector(".block");
    const muteButton = document.getElementById('mute-button');

    // --- 2. DADOS DA ANIMAÇÃO DO CORAÇÃO ---
    const blk_pitn = {
        block1: [[0, 1], [0, 0], [-1, 0], [-1, -1]], block2: [[0, 1], [0, 0], [-1, 0], [0, -1]],
        block3: [[-1, 1], [0, 0], [-1, 0], [-1, -1]], block4: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
        block5: [[-1, 1], [0, 0], [-1, 0], [0, -1]], block6: [[0, -1], [0, 0], [-1, 0], [1, -1]],
        block7: [[-1, -1], [0, 0], [-1, 0], [1, 0]], block8: [[-1, 1], [0, 0], [-1, 0], [-1, -1]],
        block9: [[0, -1], [0, 0], [-1, 0], [1, 0]], block10: [[-1, 1], [0, 0], [-1, 0], [1, 0]],
        block11: [[2, 0], [0, 0], [-1, 0], [1, 0]], block12: [[0, 1], [0, 0], [-1, 0], [0, -1]],
        block13: [[0, 1], [0, 0], [-1, 0], [-1, -1]], block14: [[1, 1], [0, 0], [-1, 0], [1, 0]],
        block15: [[1, -1], [0, 0], [-1, 0], [1, 0]], block16: [[-1, -1], [0, 0], [-1, 0], [1, 0]],
        block17: [[0, 1], [0, 0], [-1, 0], [0, -1]], block18: [[0, 1], [0, 0], [-1, 0], [-1, -1]],
        block19: [[0, -1], [0, 0], [-1, 0], [1, 0]], block20: [[1, -1], [0, 0], [-1, 0], [1, 0]],
        block21: [[0, 1], [0, 0], [-1, 0], [-1, -1]], block22: [[1, 1], [0, 0], [-1, 0], [1, 0]],
        block23: [[0, 2], [0, 0], [0, -1], [0, 1]]
    };
    const offset_pitn = {
        block1: [5, 3], block2: [5, 1], block3: [3, 4], block4: [3, 2],
        block5: [3, -1], block6: [2, 5], block7: [2, 1], block8: [1, -1],
        block9: [1, -3], block10: [1, 2], block11: [0, 3], block12: [0, 0],
        block13: [-1, -4], block14: [0, -2], block15: [-2, 4], block16: [-2, 2],
        block17: [-2, 0], block18: [-3, -2], block19: [-4, 0], block20: [-3, 5],
        block21: [-5, 3], block22: [-4, 1], block23: [-6, 1]
    };

    // --- 3. DEFINIÇÕES DE FUNÇÕES ---
    function createPetals() {
        const petalContainer = document.getElementById('petal-container');
        if (!petalContainer) return;
        const petalCount = 30;
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.className = 'petal';
            const randomX = Math.random() * 100;
            const randomSize = Math.random() * 15 + 10;
            const fallDuration = Math.random() * 10 + 8;
            const animationDelay = Math.random() * 12;
            petal.style.left = `${randomX}vw`;
            petal.style.width = `${randomSize}px`;
            petal.style.height = `${randomSize * 1.25}px`;
            petal.style.opacity = Math.random() * 0.5 + 0.5;
            petal.style.animationDuration = `${fallDuration}s`;
            petal.style.animationDelay = `${animationDelay}s`;
            petalContainer.appendChild(petal);
        }
    }

    function playPlopSound() {
        if (!audioContext) return;
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    function explode(event) {
        playPlopSound();
        const heart = event.target;
        const heartRect = heart.getBoundingClientRect();
        const particleCount = 15;
        heart.style.visibility = 'hidden';
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            document.body.appendChild(particle);
            const startX = heartRect.left + heartRect.width / 2;
            const startY = heartRect.top + heartRect.height / 2;
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 50;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            const duration = Math.random() * 600 + 400;
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'ease-out',
                fill: 'forwards'
            });
            setTimeout(() => { particle.remove(); }, duration);
        }
    }

    const drawNextPartScoped = (function() {
        let animationIndex = 1;
        const unitSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--unit-size'));
        if(!templateBlock) return function(){};
        templateBlock.style.top = "50%";
        templateBlock.style.left = "50%";
        templateBlock.style.margin = `-${unitSize / 2}px 0 0 -${unitSize / 2}px`;
        const block_left = templateBlock.offsetLeft;
        const block_top = templateBlock.offsetTop;

        return function(intervalRef) {
            if (!loveContainer || !templateBlock || animationIndex > Object.keys(blk_pitn).length) {
                if(intervalRef) clearInterval(intervalRef);
                return;
            }
            templateBlock.style.visibility = "visible";
            const blockKey = "block" + animationIndex;
            templateBlock.style.left = block_left + unitSize * offset_pitn[blockKey][0] + "px";
            templateBlock.style.top = block_top - unitSize * offset_pitn[blockKey][1] + "px";
            for (let i = 0; i < templateBlock.children.length; i++) {
                templateBlock.children[i].style.left = blk_pitn[blockKey][i][0] * -unitSize + "px";
                templateBlock.children[i].style.top = blk_pitn[blockKey][i][1] * -unitSize + "px";
            }
            const clone_block = templateBlock.cloneNode(true);
            for (const heartPiece of clone_block.children) {
                heartPiece.addEventListener('click', explode);
            }
            loveContainer.appendChild(clone_block);
            if (loveContainer.children.length >= Object.keys(blk_pitn).length) {
                const blocks = loveContainer.getElementsByClassName("block");
                if(blocks.length > 1) blocks[blocks.length - 1].children[2].style.display = "none";
                templateBlock.style.display = "none";
            }
            animationIndex++;
        }
    })();

    // --- 4. INICIALIZAÇÃO ---
    (function setup() {
        createPetals();

        if (muteButton && audio) {
            muteButton.addEventListener('click', () => {
                audio.muted = !audio.muted;
                muteButton.textContent = audio.muted ? '🔇' : '🔊';
            });
        }
        
        audio.play().catch(e => console.warn("Autoplay da música foi bloqueado pelo navegador.", e));
        
        if (gifImage && gifImage.dataset.src) {
            gifImage.src = gifImage.dataset.src;
        }

        setTimeout(() => {
            let creationInterval = setInterval(() => drawNextPartScoped(creationInterval), 300);
        }, 12000);
    })();
};