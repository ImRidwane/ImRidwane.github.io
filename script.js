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

// Certificates Chart
const ctx = document.getElementById('certificateChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [
      'Google Data Analyst (2/8)',
      'Python Basics Certification',
      'SQL Mastery',
      'Java Programming',
      'Data Visualization'
    ],
    datasets: [{
      label: 'Completion (%)',
      data: [25, 90, 75, 80, 60], // Update with actual progress
      backgroundColor: ['#4facfe', '#00f2fe', '#ffb400', '#4caf50', '#ffa07a'],
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
