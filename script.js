document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sections = [...document.querySelectorAll('main section[id]')];
    const navLinks = [...document.querySelectorAll('nav a, .footer-links a')];
    const progressBar = document.querySelector('.scroll-progress span');
    const topButton = document.querySelector('#topBtn');
    const revealItems = document.querySelectorAll(
        '.services, .why-us, .stats, .maid-info, .mission-section, .contact-section, footer, .card, .why-box, .faq-box, .mission-card'
    );

    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    const updateScrollUI = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (topButton) topButton.classList.toggle('is-visible', window.scrollY > 500);
    };

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        window.requestAnimationFrame(() => {
            updateScrollUI();
            scrollTicking = false;
        });
        scrollTicking = true;
    }, { passive: true });
    updateScrollUI();

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                const targetId = link.getAttribute('href');
                link.classList.toggle('active', targetId === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-25% 0px -65% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetId = link.getAttribute('href');
            const target = targetId && targetId.startsWith('#') ? document.querySelector(targetId) : null;
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
            history.pushState(null, '', targetId);
        });
    });

    if (topButton) {
        topButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const counter = entry.target;
            const match = counter.textContent.match(/([\d,]+)/);
            if (!match) return;

            const targetValue = Number(match[1].replace(/,/g, ''));
            const suffix = counter.textContent.replace(match[1], '');

            if (prefersReducedMotion) {
                counter.textContent = `${targetValue.toLocaleString()}${suffix}`;
                observer.unobserve(counter);
                return;
            }

            const startTime = performance.now();
            const duration = 1200;

            const animateCounter = (currentTime) => {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                counter.textContent = `${Math.floor(targetValue * easedProgress).toLocaleString()}${suffix}`;
                if (progress < 1) {
                    window.requestAnimationFrame(animateCounter);
                }
            };

            window.requestAnimationFrame(animateCounter);
            observer.unobserve(counter);
        });
    }, { threshold: 0.7 });

    document.querySelectorAll('.stat-box h2').forEach((counter) => counterObserver.observe(counter));

    const enquiryForm = document.querySelector('.enquiry-form');
    if (enquiryForm) {
        const emailLink = enquiryForm.querySelector('.email-submit');
        const formStatus = enquiryForm.querySelector('.form-status') || document.createElement('p');

        formStatus.className = 'form-status';
        formStatus.setAttribute('aria-live', 'polite');
        if (!enquiryForm.querySelector('.form-status')) {
            enquiryForm.appendChild(formStatus);
        }

        const setFormStatus = (message, type = 'success') => {
            formStatus.textContent = message;
            formStatus.className = `form-status ${type}`;
        };

        const getEnquiryMessage = () => {
            const formData = new FormData(enquiryForm);
            const name = (formData.get('name') || '').toString().trim();
            const phone = (formData.get('phone') || '').toString().trim();
            const service = (formData.get('service') || '').toString().trim();
            const message = (formData.get('message') || '').toString().trim();

            return [
                'New enquiry for PB Enterprises',
                `Name: ${name}`,
                `Mobile: ${phone}`,
                `Service: ${service}`,
                `Message: ${message}`
            ].join('\n');
        };

        if (emailLink) {
            emailLink.addEventListener('click', (event) => {
                event.preventDefault();
                if (!enquiryForm.reportValidity()) {
                    setFormStatus('Please complete the required fields before sending your enquiry.', 'error');
                    return;
                }

                const subject = encodeURIComponent('New PB Enterprises enquiry');
                const body = encodeURIComponent(getEnquiryMessage());
                window.location.href = `mailto:priyabarman1982@gmail.com?subject=${subject}&body=${body}`;
            });
        }

        enquiryForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!enquiryForm.reportValidity()) {
                setFormStatus('Please fix the highlighted fields before sending your enquiry.', 'error');
                return;
            }

            const whatsappUrl = `https://wa.me/919820695742?text=${encodeURIComponent(getEnquiryMessage())}`;
            setFormStatus('Opening WhatsApp with your enquiry details…');
            window.location.href = whatsappUrl;
        });
    }
});
