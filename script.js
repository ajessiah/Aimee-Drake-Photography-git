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
    fetch("Pages/about.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            setTimeout(() => {
            content.style.height = "60vh";
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
                const allProjects = []; // To keep track of all image containers

                allImgs.forEach((project) => {
                    // Create container for each gallery set
                    const projectDiv = document.createElement("div");
                    projectDiv.classList.add("project-div");

                    // Create button for the gallery name
                    const projectLink = document.createElement("button");
                    projectLink.textContent = project.name;
                    projectLink.classList.add("project-btn");

                    // Create image container
                    const imgContainer = document.createElement("div");
                    imgContainer.classList.add("project-content", "hidden");

                    // Add images to container
                    project.gallery.forEach(imagePath => {
                    const img = document.createElement("img");
                    img.src = imagePath;
                    img.alt = project.name;
                    img.classList.add("project-img");
                    imgContainer.appendChild(img);
                    });

                    // Track this container
                    allProjects.push(imgContainer);

                    // Toggle behavior
                    projectLink.addEventListener("click", () => {
                    allProjects.forEach(container => {
                        if (container !== imgContainer) {
                        container.classList.add("hidden"); // Close others
                        }
                    });
                    imgContainer.classList.toggle("hidden"); // Toggle clicked one
                    });

                    // Append elements
                    projectDiv.appendChild(projectLink);
                    projectDiv.appendChild(imgContainer);
                    portfolioDiv.appendChild(projectDiv);
                });
                content.style.height = "fit-content";
                content.classList.remove('loading');
            }, 200);
        })
        .catch(error => {
            console.error('Error loading the text file:', error);
        });
};

portfolioBtn.addEventListener("click", toPortfolio);
hamPortfolio.addEventListener("click", toPortfolio);

hamMenuBtn.addEventListener("click", () => {
  hamMenu.classList.toggle("active");
  if (hamMenu.classList.contains("active")) {
    hamMenuBtn.style.color = "#a08f39";
  } else {
    hamMenuBtn.style.color = "white";
  }
});

const overlayButtons = document.querySelectorAll(".overlay-btns");

overlayButtons.forEach(button => {
  button.addEventListener("click", () => {
    hamMenu.classList.remove("active");
    hamMenuBtn.style.color = "white";
  });
});

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