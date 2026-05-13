document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(follower, { x: e.clientX - 16, y: e.clientY - 16, duration: 0.3 });
    });

    // Cursor hover effects
    const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, .glass-hover');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(follower, { scale: 2, backgroundColor: 'rgba(0, 242, 255, 0.1)', duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(follower, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
        });
    });

    // --- Three.js Background ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.PlaneGeometry(30, 30, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        color: 0x050505,
        emissive: 0x001122,
        specular: 0x00f2ff,
        shininess: 100,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 3;
    scene.add(mesh);

    const light = new THREE.PointLight(0x00f2ff, 2, 50);
    light.position.set(0, 0, 10);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    camera.position.z = 10;

    // Mouse interaction for Three.js
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        
        // Wave animation
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.5;
        }
        geometry.attributes.position.needsUpdate = true;

        mesh.rotation.z += 0.001;
        mesh.position.x += (mouseX * 5 - mesh.position.x) * 0.05;
        mesh.position.y += (-mouseY * 5 - mesh.position.y) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- GSAP Animations ---
    gsap.registerPlugin(ScrollTrigger);

    // Header scroll
    ScrollTrigger.create({
        start: 'top -50',
        onEnter: () => document.getElementById('main-header').classList.add('scrolled'),
        onLeaveBack: () => document.getElementById('main-header').classList.remove('scrolled'),
    });

    // Reveal animations
    const reveals = document.querySelectorAll('.reveal, .glass, .portfolio-item, .service-card, #process .glass');
    reveals.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 92%', 
                toggleActions: 'play none none reverse'
            },
            y: 40,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.1
        });
    });

    // Video hover
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const parent = video.parentElement;
        parent.addEventListener('mouseenter', () => video.play());
        parent.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
});
