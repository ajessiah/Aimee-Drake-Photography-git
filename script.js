import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getStorage,
    ref as storageRef,
    getDownloadURL,
    listAll, 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { 
    getFirestore, collection, addDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getDatabase, push, set, ref as realTimeRef } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";


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
const firebase = getFirestore(app);
const realTime = getDatabase(app);

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
let allContainers = [];


function showError(inputElement, message) {
    inputElement.classList.add("error");
    const errorEl = document.createElement("div");
    errorEl.className = "error-message";
    errorEl.style.color = "red";
    errorEl.style.fontSize = "0.9rem";
    errorEl.style.marginTop = "4px";
    errorEl.textContent = message;
    inputElement.insertAdjacentElement("afterend", errorEl);
}

function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
    document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
}

async function submitForm(data) {
  const submissionsRef = realTimeRef(realTime, "customerFeedback");
  const newSubmission = push(submissionsRef);
  await set(newSubmission, data);
}

const toHome = () => {
  content.classList.add('loading');
  const carouselRef = storageRef(storage, 'galleries/carousel');
  document.getElementById('page-title-text').innerText = `WELCOME`;

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

        const slideshowDiv = document.getElementById('slideshow-div');
        const carouselDiv = document.getElementById('carousel');
        const carouselNav = Array.from(document.getElementsByClassName('nav'));
        
        if (window.innerWidth >= 769) {
            carouselNav.forEach((nav) => {
                nav.classList.add('sleepy');
            });
        };

        slideshowDiv.addEventListener("mouseenter", () => {
            carouselNav.forEach((nav) => {
                if(nav.classList.contains('sleepy')) {
                    nav.classList.remove('sleepy');
                }
            });
        });

        slideshowDiv.addEventListener("mouseleave", () => {
            carouselNav.forEach((nav) => {
                if (window.innerWidth >= 769) {
                    carouselNav.forEach((nav) => {
                        nav.classList.add('sleepy');
                    });
                };
            });
        });

        slideshowDiv.addEventListener("click", toPortfolio);

        try {
          const listResult = await listAll(carouselRef);

          const originalOrder = listResult.items.map((item, index) => ({
            fullPath: item.fullPath,
            originalIndex: index
          }));

          listResult.items.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return nameA.localeCompare(nameB, undefined, { numeric: true });
          });

          await Promise.all(listResult.items.map(async (itemRef, index) => {
            const url = await getDownloadURL(itemRef);
            const slide = document.createElement('img');
            slide.classList.add('slide', 'lazy');
            slide.dataset.src = url;
            slide.dataset.originalIndex = originalOrder.find(o => o.fullPath === itemRef.fullPath)?.originalIndex ?? index;
            slide.alt = `Slide ${index + 1}`;
            if (index === 0) slide.classList.add('active');
            carouselDiv.appendChild(slide);
          }));

          // ✅ Ensure appended DOM order matches `originalOrder`
          const slidesArray = Array.from(carouselDiv.querySelectorAll('.slide'));
          slidesArray.sort((a, b) => {
            return parseInt(a.dataset.originalIndex, 10) - parseInt(b.dataset.originalIndex, 10);
          }).forEach(slide => carouselDiv.appendChild(slide));

          // ✅ Lazy-load + fade-in
          const slides = document.querySelectorAll('.slide');
          slides.forEach(img => {
            img.src = img.dataset.src;
            img.onload = () => {
              img.classList.remove('lazy');
              img.classList.add('loaded');
            };
          });

          // ✅ Carousel nav/controls
          if (slides.length === 0) throw new Error("No slides found");
          const prevBtn = document.querySelector('.nav.prev');
          const nextBtn = document.querySelector('.nav.next');
          let currentIndex = 0;
          let slideInterval = setInterval(showNextSlide, 3000);

          function transitionSlide(nextIndex, direction = 'left') {
            const currentSlide = slides[currentIndex];
            const nextSlide = slides[nextIndex];
            if (!nextSlide || !currentSlide) return;

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
          carouselDiv.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
          }, false);

          carouselDiv.addEventListener('touchend', e => {
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

window.onload = toHome;
homeBtn.addEventListener("click", toHome);
logoDiv.addEventListener("click", toHome);
hamHome.addEventListener("click", toHome);

const toAbout = () => {
    content.classList.add('loading');
    document.getElementById('page-title-text').innerText = `ABOUT ME`;

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

            const aboutMe = document.getElementById('about-me-container');
            const breaks = aboutMe.querySelectorAll("br");
            console.log(breaks);

            if (window.innerWidth >= 769) {
                breaks.forEach((br, index) => {
                    if (index % 2 === 0) {
                        console.log(index);
                        br.style.display = "none";
                        breaks[index + 1].style.display = "none";
                    } 
                    
                    if (index % 4 === 0 && index !== 0) {
                        br.style.display = "block";
                        breaks[index + 1].style.display = "block";
                    } 
                })
            }

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
    document.getElementById('page-title-text').innerText = `PORTFOLIO`;

    const portfolioRef = storageRef(storage, 'galleries/portfolio');
    allContainers = [];

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

                content.scrollTo({ top: 0, behavior: "smooth" });

                requestAnimationFrame(() => {
                    const portfolioDiv = document.getElementById('portfolio-container');

                    if (!portfolioDiv) {
                        console.error("portfolio-container not found");
                        content.classList.remove('loading');
                        return;
                    }

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
                        const sortedItems = res.items.sort((a, b) => {
                            const getIndex = (file) => {
                                const match = file.name.match(/^[a-zA-Z]+-(\d+)-/);
                                return match ? parseInt(match[1], 10) : 0;
                            };
                            return getIndex(a) - getIndex(b);
                        });

                        return Promise.all(
                            sortedItems.map((itemRef, i) => {
                                return getDownloadURL(itemRef).then((url) => ({
                                    url,
                                    index: i,
                                    name: itemRef.name
                                }));
                            })
                        );
                    }).then((images) => {
                        images.forEach(({ url, index, name }) => {
                            const imgContainer = document.createElement("div");
                            imgContainer.classList.add("img-frame");

                            const portfolioImg = document.createElement("img");
                            portfolioImg.setAttribute('data-src', url);
                            portfolioImg.classList.add('lazy', 'portfolio-img');
                            portfolioImg.setAttribute('alt', `Portfolio image ${index + 1}`);

                            imgContainer.appendChild(portfolioImg);
                            portfolioDiv.appendChild(imgContainer);
                            allContainers[index] = imgContainer;

                            observer.observe(portfolioImg);

                            // Click-to-enlarge logic
                            imgContainer.addEventListener("click", () => {
                                const existingEnlarged = document.querySelector('.img-frame.enlarged');
                                if (existingEnlarged) existingEnlarged.remove();

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

                                if (window.innerWidth > 786) {
                                    focusImg.style.objectPosition = "center 45%";
                                } else {
                                    focusImg.style.objectPosition = "center 60%";
                                }
                                

                                focusFrame.appendChild(focusImg);
                                document.body.appendChild(focusFrame);

                                requestAnimationFrame(() => {
                                    const targetWidth = window.innerWidth * 0.85;
                                    let targetHeight;
                                    
                                    if (window.innerWidth <= 480) {
                                        targetHeight = window.innerHeight * 0.30;
                                    } 
                                    
                                    if (window.innerWidth > 480 && window.innerWidth <= 768) {
                                        targetHeight = window.innerHeight * 0.37;
                                    }

                                    if (window.innerWidth > 786 && window.innerWidth <= 1024) {
                                        targetHeight = window.innerHeight * 0.54;
                                    }
                                    
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

                                const menuBtns = document.getElementsByClassName('menu-btn');
                                Array.from(menuBtns).forEach((btn) => {
                                    btn.addEventListener("click", () => {
                                        if (focusFrame.classList.contains('enlarged')) {
                                            focusFrame.remove();
                                        }
                                    });
                                });
                            });
                        });

                        content.classList.remove('loading');
                    }).catch((error) => {
                        console.error('Error accessing folder or loading images:', error);
                        content.classList.remove('loading');
                    });
                }, 200);
            });
        })
        .catch(error => {
            console.error('Error loading the text file:', error);
            content.classList.remove('loading');
        });
};

portfolioBtn.addEventListener("click", toPortfolio);
hamPortfolio.addEventListener("click", toPortfolio);

const toRates = () => {
    content.classList.add('loading');
    document.getElementById('page-title-text').innerText = `RATES`;

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
            const dropdownContent = Array.from(document.querySelectorAll(".dropdown-content"));
            const addOnsAerial = dropdownContent[3].querySelector('img');

            if(window.innerWidth >= 769) {
                addOnsAerial.style.objectPosition = "50% 85%";
            };
            
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
    document.getElementById('page-title-text').innerText = `CONTACT`;

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

            document.getElementById("contact-form").addEventListener("submit", async (e) => {
                e.preventDefault();
                clearErrors();

                let contactValue;
                let customerName = `${e.target.firstName.value.trim()} ${e.target.lastName.value.trim()}`;
                const contactMethod = document.querySelector('input[name="contact-method"]:checked').value;

                let isValid = true;

                if (contactMethod === "Phone") {
                    const phoneInput = document.getElementById("phone-input");
                    contactValue = phoneInput.value.trim();

                    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
                    if (!phoneRegex.test(contactValue)) {
                        showError(phoneInput, "Please enter a valid phone number.");
                        isValid = false;
                    }

                } else if (contactMethod === "Email") {
                    const emailInput = document.getElementById("email-input");
                    contactValue = emailInput.value.trim();

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(contactValue)) {
                        showError(emailInput, "Please enter a valid email address.");
                        isValid = false;
                    }
                }

                if (!isValid) return; // Stop submission if invalid

                // Build form data
                const formData = new URLSearchParams();
                formData.append("name", customerName);
                formData.append("contactMethod", contactMethod);
                formData.append("contactValue", contactValue);
                formData.append("message", e.target.message.value.trim());
                formData.append("timestamp", Date.now());

                await fetch("https://hooks.zapier.com/hooks/catch/24269960/utmko0s/", {
                    method: "POST",
                    body: formData
                });

                const submissionsRef = realTimeRef(realTime, "customerFeedback");
                const newSubmission = push(submissionsRef);
                await set(newSubmission, formData);

                dropdownContent.classList.toggle("hidden");
                alert("Form submitted successfully!");
                e.target.reset();
            });

            // Helper: show error under input
            function showError(inputElement, message) {
                inputElement.classList.add("error"); // add red border
                const errorEl = document.createElement("div");
                errorEl.className = "error-message";
                errorEl.style.color = "red";
                errorEl.style.fontSize = "0.9rem";
                errorEl.style.marginTop = "4px";
                errorEl.textContent = message;
                inputElement.insertAdjacentElement("afterend", errorEl);
            }

            dropdownBtn.addEventListener("click", () => {
                dropdownContent.classList.toggle("hidden");

                if(!dropdownContent.classList.contains("hidden")) {
                    const phoneRadio = document.getElementById("pref-phone");
                    const emailRadio = document.getElementById("pref-email");
                    const phoneInput = document.getElementById("phone-input");
                    const emailInput = document.getElementById("email-input");

                    function toggleContactInput() {
                        if (phoneRadio.checked) {
                            hideError;
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

                    document.querySelectorAll('input[name="contact-method"]').forEach(radio => {
                        radio.addEventListener("change", clearErrors);
                    });

                    document.querySelectorAll("#phone-input, #email-input, #contact-form input, #contact-form textarea")
                        .forEach(el => el.addEventListener("focus", clearErrors));

                    document.addEventListener("click", (e) => {
                        if (!e.target.closest("#contact-form")) {
                            clearErrors();
                        }
                    });
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

