const header = document.getElementById('header');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX - window.innerWidth / 2) / 60;
    const y = (e.clientY - window.innerHeight / 2) / 60;

    header.style.transform = `
        translateX(-50%)
        translate(${x}px, ${y}px)
    `;
});
