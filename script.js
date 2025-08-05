import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzeqUokZe4nVbZPCaqLVkioetMEUY6M2k",
  authDomain: "aimee-drake-photography.firebaseapp.com",
  projectId: "aimee-drake-photography",
  storageBucket: "aimee-drake-photography.firebasestorage.app",
  messagingSenderId: "1044564691523",
  appId: "1:1044564691523:web:a07dd1176339730528e2f6"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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

const toHome = () => {
  content.classList.add('loading');
  const carouselRef = ref(storage, 'galleries/carousel');

  fetch("Pages/home.txt")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.text();
    })
    .then(data => {
      setTimeout(async () => {
        content.className = 'home';
        content.innerHTML = data;

        // Scroll to top
        content.scrollTo({ top: 0, behavior: "smooth" });

        // Load slideshow container
        const carouselDiv = document.getElementById('carousel');

        // ✅ Dynamically create slide images
        try {

            const result = await listAll(carouselRef);
            console.log(result);

            await Promise.all(result.items.map(async (itemRef, index) => {
                const url = await getDownloadURL(itemRef);
                const slide = document.createElement('img');
                slide.classList.add('slide', 'lazy');
                slide.dataset.src = url;
                slide.alt = `Slide ${index + 1}`;
                if (index === 0) slide.classList.add('active');
                carouselDiv.appendChild(slide);
            }));

            const slides = document.querySelectorAll('.slide');

            slides.forEach(img => {
            const realSrc = img.dataset.src;
            img.src = realSrc;
            img.onload = () => {
                img.classList.remove('lazy');
                img.classList.add('loaded');
            };
            });

            if (slides.length === 0) throw new Error("No slides found");

            const prevBtn = document.querySelector('.nav.prev');
            const nextBtn = document.querySelector('.nav.next');
            let currentIndex = 0;
            let slideInterval = setInterval(showNextSlide, 3000);

            function transitionSlide(nextIndex, direction = 'left') {
                const currentSlide = slides[currentIndex];
                const nextSlide = slides[nextIndex];
                if (!nextSlide || !currentSlide) return; // Safety check

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

                currentSlide.removeAttribute('style');
                nextSlide.removeAttribute('style');
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

            carouselDiv.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, false);

            carouselDiv.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 50) {
                clearInterval(slideInterval);
                diff > 0 ? showNextSlide() : showPrevSlide();
                slideInterval = setInterval(showNextSlide, 3000);
                }

            }, false);

        } catch (err) {
          console.error("Error loading carousel images:", err);
        }

        content.classList.remove('loading');
      }, 200);
    })
    .catch(error => {
      console.error('Error loading the text file:', error);
    });
};


// window.onload = toHome;
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
            content.className = 'about';
            content.innerHTML = data;

            window.scrollTo({
                top: -20,
                behavior: "smooth"
            });

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
    const portfolioRef = ref(storage, 'galleries/portfolio');
    const allContainers = [];
    fetch(`Pages/portfolio.txt`)
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

                    content.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                    
                requestAnimationFrame(() => {
                    const portfolioDiv = document.getElementById('portfolio-container');

                        if (portfolioDiv) {
                            const observer = new IntersectionObserver((entries, obs) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                    const img = entry.target;
                                    img.src = img.dataset.src;
                                    img.onload = () => {
                                        img.classList.remove('lazy');
                                        img.classList.add('loaded');
                                    };
                                    obs.unobserve(img);
                                    }
                                });
                                });

                                listAll(portfolioRef).then((res) => {
                                res.items.forEach((itemRef, i) => {
                                    getDownloadURL(itemRef).then((url) => {
                                    const imgContainer = document.createElement("div");
                                    imgContainer.classList.add("img-frame");

                                    const portfolioImg = document.createElement("img");
                                    portfolioImg.setAttribute('data-src', url);
                                    portfolioImg.classList.add('lazy', 'portfolio-img');
                                    portfolioImg.setAttribute('alt', `Portfolio image ${i + 1}`);
                                    
                                    allContainers.push(imgContainer);
                                    console.log(allContainers);

                                    imgContainer.addEventListener("click", () => {
                                    const existingEnlarged = document.querySelector('.img-frame.enlarged');
                                    if (existingEnlarged) {
                                        existingEnlarged.remove();
                                    }

                                    const rect = imgContainer.getBoundingClientRect();

                                    const focusFrame = document.createElement('div');
                                    focusFrame.classList.add("img-frame", "enlarged");

                                    focusFrame.style.position = 'fixed';
                                    focusFrame.style.top = `${rect.top}px`;
                                    focusFrame.style.left = `${rect.left}px`;
                                    focusFrame.style.width = `${rect.width}px`;
                                    focusFrame.style.height = `${rect.height}px`;
                                    focusFrame.style.zIndex = '9999';
                                    focusFrame.style.transition = 'all 0.3s ease';
                                    focusFrame.style.overflow = 'hidden';

                                    const focusImg = document.createElement('img');
                                    focusImg.src = url;
                                    focusImg.classList.add('portfolio-img');
                                    focusImg.style.width = '100%';
                                    focusImg.style.height = '100%';
                                    focusImg.style.objectFit = 'cover';

                                    focusFrame.appendChild(focusImg);
                                    document.body.appendChild(focusFrame);

                                    requestAnimationFrame(() => {
                                        const targetWidth = window.innerWidth * 0.85; 
                                        const targetHeight = window.innerWidth * 0.55;

                                        focusFrame.style.width = `${targetWidth}px`;
                                        focusFrame.style.height = `${targetHeight}px`;
                                        focusFrame.style.top = `57%`;
                                        focusFrame.style.left = `50%`;
                                        focusFrame.style.transform = `translate(-50%, -50%)`;
                                    });

                                    focusFrame.addEventListener('click', () => {
                                        focusFrame.style.width = `${rect.width}px`;
                                        focusFrame.style.height = `${rect.height}px`;
                                        focusFrame.style.top = `${rect.top}px`;
                                        focusFrame.style.left = `${rect.left}px`;
                                        focusFrame.style.transform = `none`;

                                        setTimeout(() => {
                                        focusFrame.remove();
                                        }, 300);
                                    });
                                    });
                                    imgContainer.appendChild(portfolioImg);
                                    portfolioDiv.appendChild(imgContainer);

                                    // Observe each lazy image as it's added
                                    observer.observe(portfolioImg);
                                    });
                                });
                                }).catch((error) => {
                                console.error('Error accessing folder:', error);
                                });
                    };

                    content.classList.remove('loading');
                }, 200);
            });
        })
        .catch(error => {
            console.error('Error loading the text file:', error);
        });
};

portfolioBtn.addEventListener("click", toPortfolio);
hamPortfolio.addEventListener("click", toPortfolio);

toPortfolio();

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

            window.scrollTo({
                top: -20,
                behavior: "smooth"
            });

            const dropdownBtns = document.querySelectorAll(".dropdown-btn");
            const dropdownContent = document.querySelectorAll(".dropdown-content");

            dropdownBtns.forEach((button, index) => {
                button.addEventListener("click", () => {
                    dropdownContent[index].classList.toggle("hidden");
                    dropdownContent[index].classList.toggle("visible");
                    button.classList.toggle("open");
                })
            })
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

            window.scrollTo({
                top: -20,
                behavior: "smooth"
            });

            const dropdownBtn = document.getElementById('contact-form-btn');
            const dropdownContent = document.getElementById('contact-form');
            dropdownContent.classList.add("hidden");

            dropdownBtn.addEventListener("click", () => {
                dropdownContent.classList.toggle("hidden");

                if(!dropdownContent.classList.contains("hidden")) {
                    const phoneRadio = document.getElementById("pref-phone");
                    const emailRadio = document.getElementById("pref-email");
                    const phoneInput = document.getElementById("phone-input");
                    const emailInput = document.getElementById("email-input");

                    function toggleContactInput() {
                        if (phoneRadio.checked) {
                        phoneInput.style.display = "block";
                        emailInput.style.display = "none";
                        phoneInput.required = true;
                        emailInput.required = false;
                        } else if (emailRadio.checked) {
                        emailInput.style.display = "block";
                        phoneInput.style.display = "none";
                        emailInput.required = true;
                        phoneInput.required = false;
                        }
                    }

                    phoneRadio.addEventListener("change", toggleContactInput);
                    emailRadio.addEventListener("change", toggleContactInput);
                }
            })
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
