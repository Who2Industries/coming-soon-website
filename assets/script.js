(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let launchDate;

  initTyping();
  initCountdown();
  initForm();
  initParticles();
  initCLI();

  function onMotionPreferenceChange(callback) {
    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", callback);
    } else if (typeof prefersReducedMotion.addListener === "function") {
      prefersReducedMotion.addListener(callback);
    }
  }

  function initTyping() {
    const typingEl = document.querySelector(".typing");
    if (!typingEl) return;

    const text = typingEl.dataset.text || "";
    if (!text) return;

    const shouldReduceMotion = prefersReducedMotion.matches;
    if (shouldReduceMotion) {
      typingEl.textContent = text;
      return;
    }

    let index = 0;
    const speed = 45;

    const type = () => {
      typingEl.textContent = text.slice(0, index);
      if (index < text.length) {
        index += 1;
        setTimeout(type, speed);
      }
    };

    setTimeout(type, 400);
  }

  function initCountdown() {
    const countdownEl = document.getElementById("countdown");
    if (!countdownEl) return;

    launchDate = new Date("2028-01-01T00:00:00Z");

    const update = () => {
      const now = new Date();
      const diff = launchDate - now;

      if (diff <= 0) {
        setSegments(countdownEl, { days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setSegments(countdownEl, { days, hours, minutes, seconds });
      return false;
    };

    update();
    const interval = window.setInterval(() => {
      const finished = update();
      if (finished) {
        window.clearInterval(interval);
      }
    }, 1000);
  }

  function setSegments(container, segments) {
    Object.entries(segments).forEach(([unit, value]) => {
      const segmentEl = container.querySelector(`[data-unit="${unit}"]`);
      if (segmentEl) {
        segmentEl.textContent = value.toString().padStart(2, "0");
      }
    });
  }

  function initForm() {
    const form = document.getElementById("notify-form");
    if (!form) return;

    const emailInput = form.querySelector("#email");
    const feedback = document.getElementById("form-feedback");
    const submitButton = form.querySelector('button[type="submit"]');

    const setState = (state, message) => {
      form.classList.remove("success", "error");
      feedback.classList.remove("success", "error");

      if (state) {
        form.classList.add(state);
        feedback.classList.add(state);
      }

      feedback.textContent = message || "";
      submitButton.disabled = state === "success";
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValid) {
        setState("error", "Please enter a valid email address.");
        return;
      }

      const botcheck = form.querySelector("#botcheck");
      if (botcheck && botcheck.checked) {
        setState("error", "Invalid submission detected.");
        return;
      }

      submitButton.disabled = true;
      setState("", "Subscribing...");

      try {
        const formData = new FormData(form);
        formData.set(
          "message",
          `New subscriber email: ${email}\n\nPlease add this email to the Who2Industries mailing list.`,
        );
        formData.set("from_email", email);
        formData.set("email", email);
        if (botcheck) {
          formData.set("botcheck", "");
        }

        const response = await fetch("/api/subscribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setState(
            "success",
            "Subscribed — we will notify you when we launch.",
          );
          form.reset();
          window.setTimeout(() => {
            setState("", "");
            submitButton.disabled = false;
          }, 5000);
        } else {
          throw new Error(data.message || "Submission failed");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        setState("error", "Something went wrong. Please try again later.");
        submitButton.disabled = false;
      }
    });
  }

  function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const shouldReduceMotion = prefersReducedMotion.matches;
    if (shouldReduceMotion) {
      canvas.remove();
      return;
    }

    const ctx = canvas.getContext("2d");
    const particles = [];
    let animationFrameId = null;
    let running = true;

    const createParticles = () => {
      particles.length = 0;
      const count = Math.floor((window.innerWidth + window.innerHeight) / 18);
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.8 + 0.4,
          alpha: Math.random() * 0.5 + 0.1,
          velocityX: (Math.random() - 0.5) * 0.25,
          velocityY: (Math.random() - 0.5) * 0.25,
        });
      }
    };

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      createParticles();
    };

    const resizeListener = () => resize();

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 6,
        );
        gradient.addColorStop(0, `rgba(56, 249, 215, ${particle.alpha})`);
        gradient.addColorStop(
          0.5,
          `rgba(122, 92, 255, ${particle.alpha * 0.6})`,
        );
        gradient.addColorStop(1, "rgba(5, 7, 15, 0)");
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      animationFrameId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resizeListener);
    draw();

    const stop = () => {
      running = false;
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", resizeListener);
    };

    onMotionPreferenceChange((event) => {
      if (event.matches && running) {
        stop();
        canvas.remove();
      }
    });
  }

  function initCLI() {
    const overlay = document.querySelector(".cli-overlay");
    const inputEl = document.getElementById("cli-input");
    const logEl = document.getElementById("cli-log");
    if (!overlay || !inputEl || !logEl) return;

    let open = false;
    let buffer = "";

    const commands = {
      help: () => [
        "Available commands:",
        "  help     - Show this help menu",
        "  status   - System boot status",
        "  links    - Show contact links",
        "  motto    - Print the Who2Industries ethos",
      ],
      status: () => {
        if (!launchDate) {
          return ["Status: Systems warming up..."];
        }

        const now = new Date();
        const diff = Math.max(launchDate - now, 0);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return [
          "Boot sequence initiated.",
          `Launch ETA: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        ];
      },
      links: () => [
        "Links:",
        "  Socials  https://socials.who2industries.ink",
        "  Projects https://codeberg.org/who2industries",
        "  Mastodon https://mstdn.business/@who2industries",
        "  Founders Mastodon https://techhub.social/@spoljarevic",
        "  Email    info@who2industries.systems",
      ],
      motto: () => [
        "Infrastructure meets individuality.",
        "Open. Secure. Automated. Crafted with Linux.",
      ],
    };

    const renderInput = () => {
      inputEl.textContent = buffer;
    };

    const write = (lines) => {
      lines.forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        logEl.appendChild(p);
      });
      logEl.scrollTop = logEl.scrollHeight;
    };

    const openOverlay = () => {
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      open = true;
      buffer = "";
      logEl.innerHTML = "";
      renderInput();
    };

    const closeOverlay = () => {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      open = false;
      buffer = "";
      renderInput();
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    const handleCommand = () => {
      const command = buffer.trim().toLowerCase();
      if (!command) return;

      write([`who2@comingsoon:~$ ${command}`]);

      if (commands[command]) {
        write(commands[command]());
      } else {
        write([`Command not found: ${command}`]);
      }

      buffer = "";
      renderInput();
    };

    window.addEventListener("keydown", (event) => {
      const activeTag = document.activeElement
        ? document.activeElement.tagName.toLowerCase()
        : "";

      if (
        !open &&
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        activeTag !== "input" &&
        activeTag !== "textarea"
      ) {
        event.preventDefault();
        openOverlay();
        return;
      }

      if (!open) return;

      if (event.key === "Escape") {
        closeOverlay();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleCommand();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        buffer = buffer.slice(0, -1);
        renderInput();
        return;
      }

      if (
        event.key.length === 1 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        buffer += event.key;
        renderInput();
      }
    });
  }
})();
