// Smooth Scroll on Button Click
document.querySelector('.scroll-down').addEventListener('click', () => {
  document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
});

// GSAP Animations
gsap.from("header .welcome h1 span", {
  opacity: 0,
  y: -50,
  duration: 1,
  delay: 0.5,
  ease: "power2.out",
});

gsap.from("header .welcome p", {
  opacity: 0,
  y: 50,
  duration: 1,
  delay: 1,
  ease: "power2.out",
});

gsap.from(".scroll-down", {
  opacity: 0,
  duration: 1,
  delay: 1.5,
  ease: "power2.out",
});

// Section Fade-in on Scroll
gsap.registerPlugin(ScrollTrigger);

gsap.to("#about, #skills, #certificates", {
  opacity: 1,
  duration: 1,
  scrollTrigger: {
    trigger: "#about",
    start: "top 75%",
  },
});

// Skills Progress Bars Animation
gsap.fromTo(
  ".progress-bar .fill",
  { width: "0%" },
  {
    width: "100%",
    duration: 1.5,
    delay: 0.3,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#skills",
      start: "top 80%",
    },
  }
);

// Certificate Chart
const ctx = document.getElementById('certificateChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Python Basics', 'Java Mastery', 'Web Development', 'Data Science'],
    datasets: [{
      label: 'Progress (%)',
      data: [80, 70, 60, 90], // Update this data as needed
      backgroundColor: ['#4facfe', '#00f2fe', '#ffb400', '#4caf50'],
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  }
});
