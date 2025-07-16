const content = document.getElementById('page-content');
const logoDiv = document.getElementById('logo-container');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');
const portfolioBtn = document.getElementById('portfolio-btn');
const ratesBtn = document.getElementById('rates-btn');
const contactBtn = document.getElementById('contact-btn');
const portfolioDiv = document.getElementById('portfolio-container');
const hamMenuBtn = document.getElementById('hamburger-btn');
const hamMenu = document.getElementById('menu-overlay');
const hamHome = document.getElementById('ham-home-btn');
const hamAbout = document.getElementById('ham-about-btn');
const hamPortfolio = document.getElementById('ham-portfolio-btn');
const hamRates = document.getElementById('ham-rates-btn');
const hamContact = document.getElementById('ham-contact-btn');
const header = document.getElementById('header-div');

const allImgs = 
[
    {
        name: "23 Valley View",
        gallery: [
            "Photos/23 Valley View/Sun Room 1.jpg", 
            "Photos/23 Valley View/Combo 1.jpg", 
            "Photos/23 Valley View/Bathroom.jpg", 
            "Photos/23 Valley View/Living Room 2.jpg", 
            "Photos/23 Valley View/Fire Pit.jpg"
        ]
    }, 
    {
        name: "290 Liberty",
        gallery: [
            "Photos/290 Liberty/Kitchen 1.jpg", 
            "Photos/290 Liberty/Fire Pit 1.jpg", 
            "Photos/290 Liberty/Bedroom 1.jpg", 
            "Photos/290 Liberty/Bathroom 1.jpg", 
            "Photos/290 Liberty/Living Room 2.jpg"
        ]
    }, 
    {
        name: "843 Monte Vista",
        gallery: [
            "Photos/843 Monte Vista/Backyard 1.jpg", 
            "Photos/843 Monte Vista/Kitchen 1.jpg", 
            "Photos/843 Monte Vista/Bedroom 1.jpg", 
            "Photos/843 Monte Vista/Aerial 1.jpg", 
            "Photos/843 Monte Vista/Exterior 1.jpg"
        ]
    }
];

const toHome = () => {
    content.classList.add('loading');
    fetch("Pages/home.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            setTimeout(() => {
                content.className = 'home';
                content.innerHTML = data;

                const slides = document.querySelectorAll('.slide');
                const prevBtn = document.querySelector('.nav.prev');
                const nextBtn = document.querySelector('.nav.next');
                let currentIndex = 0;
                let slideInterval = setInterval(showNextSlide, 3000);

                function transitionSlide(nextIndex, direction = 'left') {
                    const currentSlide = slides[currentIndex];
                    const nextSlide = slides[nextIndex];

                    nextSlide.classList.remove('active', 'out-left', 'out-right');
                    nextSlide.style.transition = 'none';
                    nextSlide.style.transform = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
                    nextSlide.style.opacity = '1'; 
                    nextSlide.style.zIndex = '2';

                    void nextSlide.offsetWidth;

                    nextSlide.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out';
                    nextSlide.style.transform = 'translateX(0)';

                    currentSlide.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out';
                    currentSlide.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
                    currentSlide.style.opacity = '0';
                    currentSlide.style.zIndex = '1';

                    setTimeout(() => {
                        currentSlide.classList.remove('active');
                        nextSlide.classList.add('active');

                        currentSlide.style.transition = '';
                        currentSlide.style.transform = '';
                        currentSlide.style.opacity = '';
                        currentSlide.style.zIndex = '';

                        nextSlide.style.transition = '';
                        nextSlide.style.transform = '';
                        nextSlide.style.opacity = '';
                        nextSlide.style.zIndex = '';
                    }, 800);

                    currentIndex = nextIndex;
                }

                function showNextSlide() {
                    const nextIndex = (currentIndex + 1) % slides.length;
                    transitionSlide(nextIndex, 'left');
                }

                function showPrevSlide() {
                    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                    transitionSlide(prevIndex, 'right');
                }

                nextBtn.addEventListener('click', () => {
                    clearInterval(slideInterval);
                    showNextSlide();
                    slideInterval = setInterval(showNextSlide, 3000);
                });

                prevBtn.addEventListener('click', () => {
                    clearInterval(slideInterval);
                    showPrevSlide();
                    slideInterval = setInterval(showNextSlide, 3000);
                });

                let touchStartX = 0;

                document.getElementById('carousel').addEventListener('touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, false);

                document.getElementById('carousel').addEventListener('touchend', (e) => {
                    const touchEndX = e.changedTouches[0].screenX;
                    const diff = touchStartX - touchEndX;

                    if (Math.abs(diff) > 50) {
                        clearInterval(slideInterval);
                        if (diff > 0) {
                        showNextSlide(); // swipe left
                        } else {
                        showPrevSlide(); // swipe right
                        }
                        slideInterval = setInterval(showNextSlide, 3000);
                    }
                }, false);
                content.style.height = "fit-content";
                content.style.minHeight = "60vh";
                content.classList.remove('loading');
            }, 200);
        })
        .catch(error => {
            console.error('Error loading the text file:', error);
        });
};

//window.onload = toHome;
homeBtn.addEventListener("click", toHome);
logoDiv.addEventListener("click", toHome);
hamHome.addEventListener("click", toHome);

const toAbout = () => {
    content.classList.add('loading');
    fetch("Pages/about.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            setTimeout(() => {
            content.style.height = "fit-content";
            content.style.minHeight = "60vh";
            content.className = 'about';
            content.innerHTML = data;
            content.classList.remove('loading');
            }, 200);
        })
        .catch(error => {
            console.error('Error loading the text file:', error);
        });
};

aboutBtn.addEventListener("click", toAbout);
hamAbout.addEventListener("click", toAbout);

const toPortfolio = () => {
    content.classList.add('loading');
    fetch("Pages/portfolio.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            setTimeout(() => {
                content.className = 'portfolio';
                content.innerHTML = data;

                const portfolioDiv = document.getElementById('portfolio-container');
                const allProjects = [];

                allImgs.forEach((project) => {
                    const projectDiv = document.createElement("div");
                    projectDiv.classList.add("project-div");

                    const projectLink = document.createElement("button");
                    projectLink.textContent = project.name;
                    projectLink.classList.add("project-btn");

                    // Create image container (slideshow wrapper)
                    const imgContainer = document.createElement("div");
                    imgContainer.classList.add("project-content", "hidden");

                    const slideshow = document.createElement("div");
                    slideshow.classList.add("slideshow");

                    // Image elements
                    const imgElements = project.gallery.map((imagePath, index) => {
                        const img = document.createElement("img");
                        img.src = imagePath;
                        img.alt = project.name;
                        img.classList.add("project-img");
                        if (index !== 0) img.style.display = "none"; // Show only the first image
                        return img;
                    });

                    imgElements.forEach(img => slideshow.appendChild(img));
                    imgContainer.appendChild(slideshow);

                    // Nav buttons
                    const prevBtn = document.createElement("button");
                    prevBtn.textContent = "‹";
                    prevBtn.classList.add("slideshow-nav", "prev");

                    const nextBtn = document.createElement("button");
                    nextBtn.textContent = "›";
                    nextBtn.classList.add("slideshow-nav", "next");

                    imgContainer.appendChild(prevBtn);
                    imgContainer.appendChild(nextBtn);

                    let currentIndex = 0;

                    const showImage = (index) => {
                        imgElements.forEach((img, i) => {
                            img.style.display = i === index ? "block" : "none";
                        });
                    };

                    prevBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        currentIndex = (currentIndex - 1 + imgElements.length) % imgElements.length;
                        showImage(currentIndex);
                    });

                    nextBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        currentIndex = (currentIndex + 1) % imgElements.length;
                        showImage(currentIndex);
                    });

                    allProjects.push(imgContainer);

                    projectLink.addEventListener("click", () => {
                        allProjects.forEach(container => {
                            const link = container.previousElementSibling;
                            if (container !== imgContainer) {
                                container.classList.add("hidden");
                                if (link) link.classList.remove("open");
                            }
                        });

                        const isHidden = imgContainer.classList.contains("hidden");
                        imgContainer.classList.toggle("hidden");

                        if (isHidden) {
                            projectLink.classList.add("open");
                            showImage(0); // Reset to first image on open
                            currentIndex = 0;
                        } else {
                            projectLink.classList.remove("open");
                        }
                    });

                    projectDiv.appendChild(projectLink);
                    projectDiv.appendChild(imgContainer);
                    portfolioDiv.appendChild(projectDiv);
                });

                content.style.height = "fit-content";
                content.style.minHeight = "60vh";
                content.classList.remove('loading');
            }, 200);
        })
        .catch(error => {
            console.error('Error loading the text file:', error);
        });
};

portfolioBtn.addEventListener("click", toPortfolio);
hamPortfolio.addEventListener("click", toPortfolio);

const toRates = () => {
    content.classList.add('loading');
    fetch("Pages/rates.txt")
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        setTimeout(() => {
            content.className = 'rates';
            content.innerHTML = data;
            const dropdownBtns = document.querySelectorAll(".dropdown-btn");
            const dropdownContent = document.querySelectorAll(".dropdown-content");

            dropdownBtns.forEach((button, index) => {
                button.addEventListener("click", () => {
                    dropdownContent[index].classList.toggle("hidden");
                    dropdownContent[index].classList.toggle("visible");
                    button.classList.toggle("open");
                })
            })
            content.style.height = "fit-content";
            content.style.minHeight = "60vh";
            content.classList.remove('loading');
        }, 200);
    })
    .catch(error => {
        console.error('Error loading the text file:', error);
    });
};

ratesBtn.addEventListener("click", toRates);
hamRates.addEventListener("click", toRates);

const toContact = () => {
    content.classList.add('loading');
    fetch("Pages/contact.txt")
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.text();
    })
    .then(data => {
        setTimeout(() => {
            content.className = 'contact';
            content.innerHTML = data;
            content.style.height = "fit-content";
            content.style.minHeight = "60vh";
            content.classList.remove('loading');
        }, 200);
    })
    .catch(error => {
        console.error('Error loading the text file:', error);
    });
};

contactBtn.addEventListener("click", toContact);
hamContact.addEventListener("click", toContact);

hamMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hamMenu.classList.toggle("active");

    if (hamMenu.classList.contains("active")) {
        hamMenuBtn.style.color = "#E6C068";
    } else {
        hamMenuBtn.style.color = "white";
    }
});

document.addEventListener("click", (e) => {
    if (hamMenu.classList.contains("active") && !hamMenu.contains(e.target) && e.target !== hamMenuBtn) {
        hamMenu.classList.remove("active");
        hamMenuBtn.style.color = "white";
    }
});

hamMenu.addEventListener("click", (e) => {
    e.stopPropagation();
});
    
const overlayButtons = document.querySelectorAll(".overlay-btns");

overlayButtons.forEach(button => {
  button.addEventListener("click", () => {
    hamMenu.classList.remove("active");
    hamMenuBtn.style.color = "white";
  });
});

toRates();