/**
 * Portfolio Interactivity & UI Logic
 * Refactored for readability, encapsulation, and maintainability.
 */

(() => {
  "use strict";

  /* ============================================================
     1. CONFIGURATION & STATE
     ============================================================ 
     Keep all editable data at the top. If you want to change 
     how the site feels or what it says, edit this section.
  */
  const CONFIG = {
    sliderIntervalMs: 3000,
    counterDurationMs: 1500,
    scrollThresholdPx: 400,
    typingSpeedMs: 110,
    typingDeleteSpeedMs: 60,
    typingPauseMs: 1800,
  };

  const CONTENT = {
    typingRoles: [
      "Web Developer 💻",
      "CSE Student 🎓",
      "UI Enthusiast 🎨",
      "Problem Solver 🔧",
    ],
  };

  const FORM_RULES = {
    name:    { required: true, minLength: 2,  label: "Name" },
    email:   { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: "Email" },
    subject: { required: true, minLength: 3,  label: "Subject" },
    message: { required: true, minLength: 20, label: "Message" },
  };

  // Check if the user has requested minimal animations via OS settings
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     2. CORE UTILITIES
     ============================================================ */
  
  /** * Selects an element by ID and warns developers if it's missing.
   * This saves hours of debugging typos in HTML IDs.
   */
  const getElement = (id) => {
    const element = document.getElementById(id);
    if (!element) console.warn(`[Portfolio Debug]: Element #${id} is missing from the DOM.`);
    return element;
  };

  /** * Limits how often a function runs (perfect for scroll events).
   * Ensures the browser doesn't get overloaded drawing frames.
   */
  const throttleToFrame = (callback) => {
    let isQueued = false;
    return (...args) => {
      if (isQueued) return;
      isQueued = true;
      requestAnimationFrame(() => {
        callback(...args);
        isQueued = false;
      });
    };
  };

  /* ============================================================
     3. UI COMPONENTS
     ============================================================ */

  const setupThemeToggle = () => {
    const toggleBtn = getElement("darkToggle");
    if (!toggleBtn) return;

    const applyTheme = (isDark) => {
      document.body.classList.toggle("dark", isDark);
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
      toggleBtn.setAttribute("aria-pressed", String(isDark));
      localStorage.setItem("portfolioThemeDark", String(isDark));
    };

    // Restore user's saved preference immediately
    applyTheme(localStorage.getItem("portfolioThemeDark") === "true");

    toggleBtn.addEventListener("click", () => {
      applyTheme(!document.body.classList.contains("dark"));
    });
  };

  const setupTypingEffect = () => {
    const textContainer = getElement("typingText");
    if (!textContainer) return;

    // Accessibility: Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      textContainer.textContent = CONTENT.typingRoles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isErasing = false;
    let timerId;

    const typeCharacter = () => {
      const currentRole = CONTENT.typingRoles[roleIndex];

      if (!isErasing) {
        textContainer.textContent = currentRole.substring(0, ++charIndex);
        if (charIndex === currentRole.length) {
          isErasing = true;
          timerId = setTimeout(typeCharacter, CONFIG.typingPauseMs);
          return;
        }
      } else {
        textContainer.textContent = currentRole.substring(0, --charIndex);
        if (charIndex === 0) {
          isErasing = false;
          roleIndex = (roleIndex + 1) % CONTENT.typingRoles.length;
        }
      }

      const speed = isErasing ? CONFIG.typingDeleteSpeedMs : CONFIG.typingSpeedMs;
      timerId = setTimeout(typeCharacter, speed);
    };

    typeCharacter();
  };

  const setupNavigation = () => {
    const navbar = getElement("navbar");
    const navMenu = getElement("navLinks");
    const burger = getElement("hamburger");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const sections = Array.from(document.querySelectorAll("section[id]"));

    if (!navbar || !navMenu || !burger) return;

    // Scroll spy & shadow
    const handleScroll = throttleToFrame(() => {
      const scrollY = window.scrollY;
      navbar.classList.toggle("scrolled", scrollY > 50);

      // Find which section is currently in view
      let activeSectionId = "";
      sections.forEach((section) => {
        if (scrollY >= section.offsetTop - 120) {
          activeSectionId = section.id;
        }
      });

      // Update active nav link
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeSectionId}`;
        link.classList.toggle("active", isActive);
        link.setAttribute("aria-current", isActive ? "page" : "false");
      });
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Mobile Menu Toggle
    const toggleMenu = (forceClose = false) => {
      const shouldOpen = forceClose ? false : !navMenu.classList.contains("open");
      navMenu.classList.toggle("open", shouldOpen);
      burger.textContent = shouldOpen ? "✕" : "☰";
      burger.setAttribute("aria-expanded", String(shouldOpen));
    };

    burger.addEventListener("click", () => toggleMenu());
    navLinks.forEach(link => link.addEventListener("click", () => toggleMenu(true)));

    // Accessibility: Close on Escape key or outside click
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        toggleMenu(true);
        burger.focus();
      }
    });
    
    document.addEventListener("click", (e) => {
      if (!burger.contains(e.target) && !navMenu.contains(e.target)) toggleMenu(true);
    });
  };

  const setupScrollAnimations = () => {
    // Shared intersection observer logic for performance
    const animateOnScroll = (elements, animationCallback, threshold = 0.3) => {
      if (!elements.length) return;

      if (prefersReducedMotion) {
        elements.forEach(animationCallback);
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animationCallback(entry.target);
            obs.unobserve(entry.target); // Only animate once
          }
        });
      }, { threshold });

      elements.forEach(el => observer.observe(el));
    };

    // 1. Stat Counters
    animateOnScroll(Array.from(document.querySelectorAll(".stat-num")), (element) => {
      const targetValue = parseInt(element.dataset.target, 10);
      if (isNaN(targetValue) || prefersReducedMotion) {
        element.textContent = targetValue || 0;
        return;
      }

      const startTime = performance.now();
      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / CONFIG.counterDurationMs, 1);
        
        // Ease-out quad formula for smooth deceleration
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        element.textContent = Math.floor(easedProgress * targetValue);

        if (progress < 1) requestAnimationFrame(updateCounter);
      };
      requestAnimationFrame(updateCounter);
    }, 0.5);

    // 2. Skill Bars
    animateOnScroll(Array.from(document.querySelectorAll(".skill-fill")), (element) => {
      element.classList.add("animated");
    });
  };

  const setupProjectFilter = () => {
    const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
    const cards = Array.from(document.querySelectorAll(".project-card"));
    if (!filterBtns.length || !cards.length) return;

    const applyFilter = (filterCategory) => {
      filterBtns.forEach((btn) => {
        const isActive = btn.dataset.filter === filterCategory;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const matches = filterCategory === "all" || card.dataset.category === filterCategory;
        card.classList.toggle("hidden", !matches);
      });
    };

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
    });
  };

  const setupSlider = () => {
    const slides = Array.from(document.querySelectorAll(".slide"));
    const dotsWrap = getElement("sliderDots");
    const prevBtn = getElement("sliderPrev");
    const nextBtn = getElement("sliderNext");

    if (!slides.length || !dotsWrap) return;

    let currentIndex = 0;
    let autoPlayTimerId = null;

    // Create navigation dots dynamically
    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = `dot ${index === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", String(index === 0));
      
      dot.addEventListener("click", () => { 
        goToSlide(index); 
        resetAutoPlay(); 
      });
      
      dotsWrap.appendChild(dot);
      return dot;
    });

    const goToSlide = (index) => {
      // Loop around if out of bounds
      const nextIndex = (index + slides.length) % slides.length;

      // Clean up current slide
      slides[currentIndex].classList.remove("active");
      dots[currentIndex].classList.remove("active");
      dots[currentIndex].setAttribute("aria-selected", "false");

      // Set new slide
      currentIndex = nextIndex;
      slides[currentIndex].classList.add("active");
      dots[currentIndex].classList.add("active");
      dots[currentIndex].setAttribute("aria-selected", "true");
    };

    const startAutoPlay = () => {
      if (prefersReducedMotion) return;
      autoPlayTimerId = setInterval(() => goToSlide(currentIndex + 1), CONFIG.sliderIntervalMs);
    };

    const resetAutoPlay = () => {
      clearInterval(autoPlayTimerId);
      startAutoPlay();
    };

    // Event Listeners
    prevBtn?.addEventListener("click", () => { goToSlide(currentIndex - 1); resetAutoPlay(); });
    nextBtn?.addEventListener("click", () => { goToSlide(currentIndex + 1); resetAutoPlay(); });

    // Pause on hover
    const wrapper = document.querySelector(".slider-wrapper");
    wrapper?.addEventListener("mouseenter", () => clearInterval(autoPlayTimerId));
    wrapper?.addEventListener("mouseleave", () => startAutoPlay());

    // Keyboard support when focused
    document.addEventListener("keydown", (e) => {
      if (!wrapper.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === "ArrowLeft")  { goToSlide(currentIndex - 1); resetAutoPlay(); }
      if (e.key === "ArrowRight") { goToSlide(currentIndex + 1); resetAutoPlay(); }
    });

    startAutoPlay();
  };

  const setupFormValidation = () => {
    const form = getElement("contactForm");
    const statusDiv = getElement("formStatus");
    const submitBtn = getElement("submitBtn");
    const charCount = getElement("charCount");
    const msgInput = getElement("message");

    if (!form) return;

    // Map input IDs to their DOM elements
    const inputs = Object.fromEntries(
      Object.keys(FORM_RULES).map(id => [id, getElement(id)])
    );

    // Dynamic character counter for message
    msgInput?.addEventListener("input", () => {
      const len = msgInput.value.length;
      const min = FORM_RULES.message.minLength;
      if (charCount) {
        charCount.textContent = `${len} / ${min} characters minimum`;
        charCount.style.color = len >= min ? "#10b981" : "";
      }
    });

    // Validation Logic
    const validateField = (id, inputEl) => {
      if (!inputEl) return true;
      
      const rule = FORM_RULES[id];
      const value = inputEl.value.trim();
      let errorMessage = "";

      if (rule.required && !value) {
        errorMessage = `${rule.label} is required.`;
      } else if (rule.minLength && value.length < rule.minLength) {
        errorMessage = `${rule.label} must be at least ${rule.minLength} characters.`;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        errorMessage = `Please enter a valid email address.`;
      }

      // Update UI
      const errorSpan = getElement(`${id}Error`);
      inputEl.classList.toggle("error", !!errorMessage);
      inputEl.classList.toggle("valid", !errorMessage && value.length > 0);
      if (errorSpan) errorSpan.textContent = errorMessage;

      return !errorMessage;
    };

    // Attach blur (leaving field) and focus events
    Object.entries(inputs).forEach(([id, inputEl]) => {
      if (!inputEl) return;
      inputEl.addEventListener("blur", () => validateField(id, inputEl));
      inputEl.addEventListener("focus", () => {
        inputEl.classList.remove("error");
        const span = getElement(`${id}Error`);
        if (span) span.textContent = "";
      });
    });

    // Handle Submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const isValid = Object.entries(inputs)
        .map(([id, inputEl]) => validateField(id, inputEl))
        .every(Boolean);

      if (isValid) {
        handleSuccessfulSubmit(form, inputs, statusDiv, submitBtn, charCount);
      } else {
        showFormStatus(statusDiv, "Please fix the errors above before sending.", "error");
        // Focus first invalid field for accessibility
        const firstInvalid = Object.values(inputs).find(el => el?.classList.contains("error"));
        firstInvalid?.focus();
      }
    });
  };

  const showFormStatus = (statusDiv, message, type) => {
    if (!statusDiv) return;
    statusDiv.textContent = (type === "success" ? "✅ " : "❌ ") + message;
    statusDiv.className = `form-status ${type}`;
  };

  const handleSuccessfulSubmit = (form, inputs, statusDiv, submitBtn, charCount) => {
    showFormStatus(statusDiv, "Message sent successfully! I'll get back to you soon.", "success");
    
    if (submitBtn) {
      submitBtn.textContent = "Message Sent ✓";
      submitBtn.disabled = true;
    }

    // Reset form after 4 seconds
    setTimeout(() => {
      form.reset();
      Object.values(inputs).forEach(inputEl => inputEl?.classList.remove("valid", "error"));
      
      if (statusDiv) statusDiv.className = "form-status";
      if (charCount) charCount.textContent = "0 / 20 characters minimum";
      
      if (submitBtn) {
        submitBtn.textContent = "Send Message";
        submitBtn.disabled = false;
      }
    }, 4000);
  };

  const setupBackToTop = () => {
    const btn = getElement("backToTop");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      throttleToFrame(() => {
        btn.classList.toggle("visible", window.scrollY > CONFIG.scrollThresholdPx);
      }),
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  };

  /* ============================================================
     4. APP INITIALISATION
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupTypingEffect();
    setupNavigation();
    setupScrollAnimations();
    setupProjectFilter();
    setupSlider();
    setupFormValidation();
    setupBackToTop();
    
    const footerYear = getElement("footerYear");
    if (footerYear) footerYear.textContent = new Date().getFullYear();
  });

})();