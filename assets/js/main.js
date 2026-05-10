// main.js
// Handles global logic for the landing pages (Index, About, etc.)

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-item");

    window.addEventListener("scroll", () => {
        let current = "";
        const pageY = window.pageYOffset;
        
        sections.forEach((section) => {
            if (pageY >= section.offsetTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navItems.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current) && current !== "") {
                link.classList.add("active");
            }
        });
    });
});