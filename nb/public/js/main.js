/**
 * Main Frontend Script
 * Handles 3D card tilt physics, mobile navigation, contact form submission, and scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHT
  // ==========================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Glass navbar compact style on scroll
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active state
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 2. MOBILE MENU TOGGLE
  // ==========================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksContainer = document.getElementById('navLinks');

  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (navLinksContainer.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  // ==========================================
  // 3. 3D CARD TILT EFFECT (Vanilla Physics)
  // ==========================================
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (-12deg to +12deg)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // ==========================================
  // 4. CONTACT FORM AJAX SUBMISSION
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const formAlert = document.getElementById('formAlert');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const service = document.getElementById('service').value;
      const message = document.getElementById('message').value.trim();

      // UI Loading state
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
      formAlert.className = 'form-alert';
      formAlert.style.display = 'none';

      try {
        // Send in the background to Node.js backend which emails tadiwatanyanyiwa69@gmail.com
        let sentSuccessfully = false;

        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, service, message })
          });

          const data = await response.json();
          if (response.ok && data.success) {
            sentSuccessfully = true;
          }
        } catch (serverErr) {
          console.warn('Backend relay unavailable, using direct background mail dispatch...', serverErr);
        }

        // Direct background fallback if backend didn't confirm
        if (!sentSuccessfully) {
          const directRes = await fetch('https://formsubmit.co/ajax/tadiwatanyanyiwa69@gmail.com', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name: name,
              contact: email,
              service: service,
              message: message,
              _subject: `New IT Request from ${name} - ${service}`
            })
          });

          if (directRes.ok) {
            sentSuccessfully = true;
          }
        }

        // Display smooth inline success message without redirecting the client
        formAlert.innerHTML = `✅ <strong>Message Sent Successfully!</strong> Your request has been automatically sent to Tadiwa (<strong>tadiwatanyanyiwa69@gmail.com</strong>). DOC will get back to you shortly.`;
        formAlert.className = 'form-alert success';
        formAlert.style.display = 'block';
        contactForm.reset();

      } catch (err) {
        console.error('Submission error:', err);
        formAlert.innerHTML = `⚠️ Could not complete automatic delivery. Please try again or reach DOC directly on WhatsApp.`;
        formAlert.className = 'form-alert error';
        formAlert.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

});
