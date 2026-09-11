const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const updateHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 18);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navigation?.classList.toggle("open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
  });
});

document.addEventListener("click", (event) => {
  if (!navigation?.classList.contains("open")) return;
  if (navigation.contains(event.target) || menuToggle?.contains(event.target)) return;
  menuToggle?.setAttribute("aria-expanded", "false");
  navigation.classList.remove("open");
});

const revealElements = document.querySelectorAll(".reveal");
revealElements.forEach((element) => {
  const delay = Number(element.dataset.delay || 0);
  element.style.setProperty("--delay", `${delay}ms`);
});

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const hero = document.querySelector(".hero");
hero?.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches) return;
  const bounds = hero.getBoundingClientRect();
  hero.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
  hero.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const demoText = document.querySelector("[data-demo-text]");
const demoCaption = document.querySelector("[data-demo-caption]");
const trigger = "/thanks";
const expansion = "Thanks for reaching out! I appreciate your message and will get back to you as soon as possible.";
let animationTimer;

const wait = (duration) =>
  new Promise((resolve) => {
    animationTimer = window.setTimeout(resolve, duration);
  });

async function runExpansionDemo() {
  if (!demoText || !demoCaption) return;

  if (reducedMotion.matches) {
    demoText.textContent = expansion;
    demoCaption.textContent = "The exact saved response. Ready instantly.";
    return;
  }

  while (document.body.contains(demoText)) {
    demoText.textContent = "";
    demoCaption.textContent = "Type a shortcut anywhere.";
    await wait(450);

    for (const character of trigger) {
      demoText.textContent += character;
      await wait(82);
    }

    await wait(620);
    demoText.textContent = expansion;
    demoCaption.textContent = "The exact saved response. Ready instantly.";
    await wait(3100);
  }
}

runExpansionDemo();

reducedMotion.addEventListener?.("change", () => {
  window.clearTimeout(animationTimer);
  if (demoText && demoCaption) {
    demoText.textContent = expansion;
    demoCaption.textContent = "The exact saved response. Ready instantly.";
  }
});
