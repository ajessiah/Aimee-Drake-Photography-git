import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
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
const fileInput = document.getElementById('fileInput');
const selectedFiles = document.getElementById('selected-files');
let allSelectedFiles = [];
let currentOrder = [];

const clearStatus = () => {
    document.getElementById('status').style.display = "none";
    document.getElementById('status').innerText = ``;
};

const updateStatus = (str) => {
    document.getElementById('status').style.display = "block";
    document.getElementById('status').innerText = `${str}`;
};

const clearSelectedFiles = () => {
    allSelectedFiles = [];
    selectedFiles.innerHTML = ``;
    selectedFiles.style.display = "none";
    fileInput.value = "";
};

fileInput.addEventListener('change', () => {
    clearStatus();
    const newFiles = Array.from(fileInput.files);
    console.log(newFiles);

    newFiles.forEach(file => {
        const alreadyAdded = allSelectedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!alreadyAdded) {
            allSelectedFiles.push(file);
        }
    });

    selectedFiles.innerHTML = ``;
    allSelectedFiles.length ? selectedFiles.style.display = "block" : "none";

    allSelectedFiles.forEach(file => {
        const p = document.createElement('p');
        p.textContent = file.name;
        selectedFiles.appendChild(p);
    });

    document.getElementById("clear-all-btn").style.display = "block";
    document.getElementById("done-btn").style.display = "block";
    document.getElementById('upload-controls').style.display = "none";
})

document.getElementById("clear-all-btn").addEventListener("click", () => {
    clearSelectedFiles();
    document.getElementById("done-btn").style.display = "none";
    document.getElementById("clear-all-btn").style.display = "none";
    document.getElementById('upload-controls').style.display = "flex";
    document.getElementById('file-destination').style.display = 'none';
    document.getElementById('upload-btn').style.display = "none";
    clearStatus();
});

document.getElementById("done-btn").addEventListener("click", () => {
    if (!allSelectedFiles.length) {
        updateStatus("No files selected.");
        return;
    } else {
        document.getElementById('content-controls').style.display = "none";
        document.getElementById('upload-controls').style.display = "flex";
        document.getElementById('file-destination').style.display = "block";
        document.getElementById('upload-btn').style.display = "block";
    };
});

document.getElementById("upload-back-btn").addEventListener("click", () => {
    if (document.getElementById('file-destination').style.display === "block") {
      document.getElementById('file-destination').value = "";
      document.getElementById('content-controls').style.display = "flex";
      document.getElementById('upload-controls').style.display = "none";
      clearStatus();
    } else {
      toHome();
    }
});

document.getElementById('file-destination').addEventListener("click", clearStatus);

// ADMIN HOME

const toHome = () => {
    clearStatus();
    document.getElementById('feature-menu').style.display = "flex";
    document.getElementById('upload-photos').style.display = "none";
    document.getElementById('sort-photos').style.display = "none";
    document.getElementById('page-title-text').innerText = `ADMIN HOME`;
};

window.onload = toHome();

// UPLOAD PHOTOS

const uploadFiles = async (array) => {
    const files = array;
    const destination = document.getElementById('file-destination').value || "uncategorized";
    
    if (destination === "uncategorized") {
        updateStatus("Select an upload destination.");
        return;
    }

    let totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    let uploadedBytes = 0;
    let completedUploads = 0;
    let activeUploads = 0;
    let fileIndex = 0;
    let orderOffset = 0;
    const maxConcurrent = 4;

    document.getElementById('progress-bar-container').style.display = "block";
    document.getElementById("progress-label").style.display = "block";

    function startNextUpload() {
    if (fileIndex >= files.length) return;

    const file = files[fileIndex];
    const index = orderOffset + fileIndex; 
    fileIndex++;

    const newName = `${destination}-${index.toString().padStart(2, '0')}-${file.name}`;
    const storageRef = ref(storage, `galleries/${destination}/${newName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    let previousTransferred = 0;
    activeUploads++;

    uploadTask.on(
        "state_changed",
        snapshot => {
        const currentTransferred = snapshot.bytesTransferred;
        const delta = currentTransferred - previousTransferred;
        previousTransferred = currentTransferred;

        uploadedBytes += delta;
        const totalProgress = (uploadedBytes / totalBytes) * 100;
        document.getElementById("progress-bar-visual").style.width = totalProgress + "%";
        document.getElementById("progress-label").textContent = totalProgress.toFixed(2) + "% complete";
        },
        error => {
        console.error("Upload error:", error);
        document.getElementById("status").textContent = "Upload failed.";
        activeUploads--;
        startNextUpload(); 
        },
        () => {
        completedUploads++;
        activeUploads--;

        if (completedUploads === files.length) {
            document.getElementById('progress-bar-container').style.display = "none";
            document.getElementById("progress-label").style.display = "none";
            document.getElementById("status").style.display = "block";
            document.getElementById("status").textContent =
            `Successfully uploaded (${files.length}) photos to the ${destination.charAt(0).toUpperCase() + destination.slice(1)}.`;

            allSelectedFiles = [];
            selectedFiles.innerHTML = ``;
            selectedFiles.style.display = "none";
            document.getElementById('upload-controls').style.display = "flex";
            document.getElementById('file-destination').style.display = "none";
            document.getElementById('upload-btn').style.display = 'none';
            document.getElementById('content-controls').style.display = "flex";
            document.getElementById("done-btn").style.display = "none";
            document.getElementById("clear-all-btn").style.display = "none";
            document.getElementById('file-destination').value = "";
        } else {
            startNextUpload(); 
        }
        }
    );
    }

    for (let i = 0; i < maxConcurrent && i < files.length; i++) {
    startNextUpload();
    }
}

document.getElementById('upload-btn').addEventListener("click", () => {
  uploadFiles(allSelectedFiles);
});

// EDIT GALLERY

const confirmSort = async (destination) => {
  const storageFolderRef = ref(storage, `galleries/${destination}`);
  const items = await listAll(storageFolderRef);

  const sortedBlobs = await Promise.all(
    currentOrder.map(async ({ name, fullPath }, index) => {
      const imageRef = ref(storage, fullPath);
      const url = await getDownloadURL(imageRef);
      const blob = await fetch(url).then(res => res.blob());

      // Clean the filename: remove prefix like "carousel02-" or "portfolio15-"
      const cleanName = name.replace(new RegExp(`^[a-zA-Z]+-\\d{2,}-`), '');
      console.log(cleanName);
      const newName = `${destination}-${index.toString().padStart(2, '0')}-${cleanName}`;
      const newFullPath = `galleries/${destination}/${newName}`;

      return {
        index,
        blob,
        newName,
        originalName: name,
        fullPath,
        newFullPath
      };
    })
  );

  const currentPaths = items.items.map(item => item.fullPath);

  // 🔁 Step 1: Delete files that are changing position or name
  for (const item of items.items) {
    const found = sortedBlobs.find(b => b.fullPath === item.fullPath);
    const willChange = found && found.newFullPath !== item.fullPath;

    if (willChange) {
      await deleteObject(item);
    }
  }

  // 💾 Step 2: Upload only those that were moved or renamed
  for (const { blob, newName, fullPath, newFullPath } of sortedBlobs) {
    if (newFullPath !== fullPath) {
      const newRef = ref(storage, newFullPath);
      await uploadBytesResumable(newRef, blob);
    }
  }

  updateStatus("Gallery successfully resorted and reuploaded.");
};

const sortGallery = async (e) => {
  const imgContainer = e.target.closest('div');
  const parent = imgContainer.parentElement;
  const containers = Array.from(parent.children);
  const currentIndex = containers.indexOf(imgContainer);

  let swapIndex;

  if (e.target.classList.contains('up')) {
    if (currentIndex > 0) {
      swapIndex = currentIndex - 1;
    } else return;
  } else if (e.target.classList.contains('down')) {
    if (currentIndex < containers.length - 1) {
      swapIndex = currentIndex + 1;
    } else return;
  }

  const swapContainer = containers[swapIndex];

  // Swap in the DOM
  if (e.target.classList.contains('up')) {
    parent.insertBefore(imgContainer, swapContainer);
  } else {
    parent.insertBefore(swapContainer, imgContainer);
  }

  // ✅ Swap items in currentOrder
  [currentOrder[currentIndex], currentOrder[swapIndex]] = [currentOrder[swapIndex], currentOrder[currentIndex]];
  
  console.log(currentOrder);

  // Optional: re-index container IDs and img IDs
  containers.forEach((container, i) => {
    container.id = `img-container-${i}`;
    const img = container.querySelector('img');
    if (img) img.id = `img-${i}`;
  });

  return currentOrder;

};

const getCurrentGallery = async (destination) => {
    currentOrder = []; 
    document.getElementById('sort-controls').style.display = "flex";
    document.getElementById('sorting-gallery').style.display = "flex";
    document.getElementById('save-order-btn').style.display = "block";
    console.log(destination);
    const storageRef = ref(storage, `galleries/${destination}`);
    const sortingGallery = document.getElementById('sorting-gallery');
    sortingGallery.innerHTML = "";

  try {
    const currentGallery = await listAll(storageRef);

    
    for (const [index, itemRef] of currentGallery.items.entries()) {
        const url = await getDownloadURL(itemRef); 
        const imgContainer = document.createElement('div');
        imgContainer.id = `img-container-${index}`;
        const img = document.createElement('img');
        img.id = `img-${index}`;
        img.src = url;
        img.alt = itemRef.name;
        img.setAttribute('data-path', itemRef.fullPath);

        console.log(img.alt);
        console.log(img.dataset.path);
        
        const upSort = document.createElement('button');
        upSort.classList.add('sort-btn', 'up');
        upSort.innerHTML = `<i class="fa-solid fa-chevron-up" style="color: #E6C068"></i>`;
        const downSort = document.createElement('button');
        downSort.classList.add('sort-btn', 'down');
        downSort.innerHTML = `<i class="fa-solid fa-chevron-down" style="color: #E6C068"></i>`;

        imgContainer.appendChild(img);
        imgContainer.appendChild(upSort);
        imgContainer.appendChild(downSort);
        sortingGallery.appendChild(imgContainer);

      currentOrder.push({
        name: itemRef.name,
        index: index,
        folder: destination,
        fullPath: itemRef.fullPath,
        downloadURL: url
      });

      console.log(itemRef.fullPath);
    }

    const sortBtns = Array.from(document.getElementsByClassName('sort-btn'));

    sortBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => sortGallery(e));
    });

    document.getElementById('sort-back-btn').addEventListener("click", () => {
      if (document.getElementById('sorting-gallery').style.display === "flex") {
        sortingGallery.innerHTML = "";
        document.getElementById('sorting-gallery').style.display = "none";
        document.getElementById('save-order-btn').style.display = "none";
        document.getElementById('sort-portfolio').style.color = "whitesmoke";
        document.getElementById('sort-carousel').style.color = "whitesmoke";
      } else {
        toHome();
      }
    });

    document.getElementById('save-order-btn').addEventListener("click", () => {
        confirmSort(destination);
    });


  } catch (error) {
    console.error("Error fetching storage items:", error);
  }
  console.log(currentOrder);
  return currentOrder; 
};


document.getElementById('to-upload').addEventListener("click", () => {
  clearStatus();
    document.getElementById('feature-menu').style.display = "none";
    document.getElementById('upload-photos').style.display = "block";
    document.getElementById('upload-controls').style.display = "flex";
    document.getElementById('page-title-text').innerText = `UPLOAD PHOTOS`;
});

document.getElementById('to-sort').addEventListener("click", () => {
    document.getElementById('feature-menu').style.display = "none";
    document.getElementById('sort-photos').style.display = "block";
    document.getElementById('sort-controls').style.display = "flex";
    document.getElementById('page-title-text').innerText = `EDIT GALLERY`;
});

document.getElementById('sort-carousel').addEventListener("click", () => {
  document.getElementById('sorting-gallery');
    getCurrentGallery("carousel");
    document.getElementById('sort-carousel').style.color = "#E6C068";
    document.getElementById('sort-portfolio').style.color = "whitesmoke";
});

document.getElementById('sort-portfolio').addEventListener("click", () => {
    getCurrentGallery("portfolio");
    document.getElementById('sort-portfolio').style.color = "#E6C068";
    document.getElementById('sort-carousel').style.color = "whitesmoke";
});


document.getElementById('logo-container').addEventListener("click", () => {
    toHome();
});