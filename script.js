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
        color: 0x00f2ff,
        emissive: 0x002244,
        specular: 0x00f2ff,
        shininess: 100,
        wireframe: true,
        transparent: true,
        opacity: 0.55
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 3;
    scene.add(mesh);

    const light = new THREE.PointLight(0x00f2ff, 2.5, 60);
    light.position.set(0, 0, 10);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x505050);
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

        const scrollY = window.scrollY || window.pageYOffset;
        
        // Rotate and shift grid dynamically based on scroll
        mesh.rotation.z += 0.001;
        mesh.rotation.x = -Math.PI / 3 + scrollY * 0.0003;
        mesh.rotation.y = scrollY * 0.0001;
        
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

    // --- GSAP & Lenis Smooth Scroll ---
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easeOutExpo
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.05,
        smoothTouch: false,
        infinite: false,
    });

    // Synchronize Lenis scroll positions with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Header scroll state change
    ScrollTrigger.create({
        start: 'top -50',
        onEnter: () => document.getElementById('main-header').classList.add('scrolled'),
        onLeaveBack: () => document.getElementById('main-header').classList.remove('scrolled'),
    });

    // --- Cinematic Text Scrub (About Us Section) ---
    const textElements = document.querySelectorAll('.select-glow');
    textElements.forEach(el => {
        const text = el.textContent.trim();
        const words = text.split(/\s+/);
        el.innerHTML = words.map((word, i) => {
            // Check if it is the highlighted word "“content.”"
            if (el.classList.contains('why-choose-lead') && (word.includes('content') || word.includes('“content.”'))) {
                return `<span class="word highlighted" style="color: var(--accent-cyan); text-shadow: 0 0 15px rgba(0, 242, 255, 0.4); display: inline-block;">${word}</span>`;
            }
            return `<span class="word" style="display: inline-block; white-space: nowrap;">${word}</span>`;
        }).join(' ');

        const wordSpans = el.querySelectorAll('.word');
        
        gsap.fromTo(wordSpans, 
            { 
                opacity: 0.15,
                filter: 'blur(2px)'
            },
            {
                opacity: 1,
                filter: 'blur(0px)',
                stagger: 0.05,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    end: 'bottom 50%',
                    scrub: true,
                }
            }
        );
    });

    // --- Services Horizontal Scroll (Growth Stack) ---
    let horizontalTween;
    const pinSection = document.querySelector('.services-pin-container');
    const scrollWrapper = document.querySelector('.horizontal-scroll-wrapper');
    const slides = gsap.utils.toArray('.service-slide');

    function initHorizontalScroll() {
        if (!pinSection || !scrollWrapper) return;

        // Clear any existing ScrollTriggers on resize
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === pinSection) trigger.kill(true);
        });

        if (window.innerWidth > 768) {
            // Desktop horizontal scroll tween
            const totalScrollWidth = scrollWrapper.scrollWidth - window.innerWidth;

            horizontalTween = gsap.to(scrollWrapper, {
                x: -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: pinSection,
                    pin: true,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${totalScrollWidth}`,
                    invalidateOnRefresh: true,
                }
            });

            // Sequential reveal for each slide: Image FIRST → Content AFTER → stays static
            slides.forEach((slide) => {
                const iconCol = slide.querySelector('.card-icon-col');
                const contentCol = slide.querySelector('.card-content-col');
                const titleWrap = slide.querySelector('.service-title-wrap');
                const shortDesc = slide.querySelector('.service-short-desc');
                const listItems = slide.querySelectorAll('.facilities-grid li');

                // Skip the title slide
                if (!iconCol || !contentCol) return;

                // Set initial hidden states
                gsap.set(iconCol, { opacity: 0, scale: 0.6 });
                gsap.set(contentCol.children, { opacity: 0, y: 30 });

                // Build a timeline for this slide
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: slide,
                        containerAnimation: horizontalTween,
                        start: 'left 70%',
                        toggleActions: 'play none none none'
                    }
                });

                // Step 1: Image column scales & fades in
                tl.to(iconCol, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'back.out(1.4)'
                });

                // Step 2: Title slides up & fades in
                if (titleWrap) {
                    tl.to(titleWrap, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: 'power3.out'
                    }, '-=0.4');
                }

                // Step 3: Description fades in
                if (shortDesc) {
                    tl.to(shortDesc, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power2.out'
                    }, '-=0.2');
                }

                // Step 4: Facility list items stagger in
                if (listItems.length > 0) {
                    tl.to(listItems, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.03,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, '-=0.15');
                }
            });
        } else {
            // Mobile fallback: Reset inline translation and kill horizontal tweens
            gsap.set(scrollWrapper, { clearProps: 'transform' });
            
            // Standard vertical sequential reveals for mobile
            slides.forEach((slide) => {
                const iconCol = slide.querySelector('.card-icon-col');
                const contentCol = slide.querySelector('.card-content-col');
                const titleWrap = slide.querySelector('.service-title-wrap');
                const shortDesc = slide.querySelector('.service-short-desc');
                const listItems = slide.querySelectorAll('.facilities-grid li');

                if (!iconCol || !contentCol) return;

                gsap.set(iconCol, { opacity: 0, scale: 0.6 });
                gsap.set(contentCol.children, { opacity: 0, y: 25 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: slide,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                });

                tl.to(iconCol, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.4)'
                });

                if (titleWrap) {
                    tl.to(titleWrap, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: 'power3.out'
                    }, '-=0.3');
                }

                if (shortDesc) {
                    tl.to(shortDesc, {
                        opacity: 1,
                        y: 0,
                        duration: 0.35,
                        ease: 'power2.out'
                    }, '-=0.15');
                }

                if (listItems.length > 0) {
                    tl.to(listItems, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.03,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, '-=0.1');
                }
            });
        }
    }

    // Initialize horizontal scroll
    initHorizontalScroll();

    // Re-initialize and refresh layout calculation on resize
    window.addEventListener('resize', () => {
        initHorizontalScroll();
        ScrollTrigger.refresh();
    });

    // --- Standard Reveal Animations (Excluding Horizontal Slides) ---
    const reveals = document.querySelectorAll('.reveal, .glass:not(.services-pin-container .glass), .portfolio-item, #process .glass');
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

    // Video hover logic
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

