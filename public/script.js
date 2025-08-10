import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject,
    uploadString
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
const sortingGallery = document.getElementById('sorting-gallery');
let allSelectedFiles = [];
let originalOrder = [];
let currentOrder = [];
let activeGalleryLoadId = 0;

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

document.getElementById('sort-back-btn').addEventListener("click", () => {
  if (document.getElementById('sorting-gallery').style.display === "grid") {
    clearStatus();
    // could be throwing a testing error
    if(!confirm("Unsaved changes to current gallery order will be reset. Are you sure?")) {
      return;
    } else {
      clearStatus();
      const editableGalleries = Array.from(document.querySelectorAll('.editable-gallery'));
      document.getElementById('sorting-gallery').innerHTML = ``;
      currentOrder = [];
      document.getElementById('sorting-gallery').style.display = "none";
      editableGalleries.forEach((gallery) => gallery.style.color = "whitesmoke");
    }
  } else {
    toHome();
  }
});

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
  clearStatus();
  const storageFolderRef = ref(storage, `galleries/${destination}`);
  const items = await listAll(storageFolderRef);

  const containers = Array.from(document.querySelectorAll('#sorting-gallery .img-container'));

  const newOrder = containers.map((container, index) => {
    const img = container.querySelector('img');
    const fullPath = img?.getAttribute('data-path');
    return { fullPath, newIndex: index };
  });

  // Keep only moved files
  const changedFiles = newOrder.filter(({ fullPath, newIndex }) => {
    const original = originalOrder.find(o => o.fullPath === fullPath);
    return original && original.originalIndex !== newIndex;
  });

  if (!changedFiles.length) {
    updateStatus("No image order changes detected. Original gallery order preserved.");
    return;
  }

    currentOrder = containers.map((container, i) => {
    const img = container.querySelector('img');
    const fullPath = img?.getAttribute('data-path');
    return currentOrder.find(item => item.fullPath === fullPath);
  }).filter(Boolean);

  // Process only changed files
  const sortedBlobs = await Promise.all(
    changedFiles.map(async ({ fullPath, newIndex }) => {
      const imageRef = ref(storage, fullPath);
      const url = await getDownloadURL(imageRef);
      const blob = await fetch(url).then(res => res.blob());
      const oldName = fullPath.split('/').pop();
      const cleanName = oldName.replace(/^[a-zA-Z]+-\d{2,}-/, '');
      const destinationName = `${destination}-${newIndex.toString().padStart(2, '0')}-${cleanName}`;
      return { blob, fullPath, newFullPath: `galleries/${destination}/${destinationName}`, size: blob.size };
    })
  );

  for (const item of items.items) {
    const match = sortedBlobs.find(b => b.fullPath === item.fullPath);
    if (match && match.newFullPath !== item.fullPath) {
      await deleteObject(item);
    }
  }

  const progressContainer = document.getElementById('progress-bar-container');
  const progressVisual = document.getElementById('progress-bar-visual');
  const progressLabel = document.getElementById('progress-label');
  const statusLabel = document.getElementById('status');

  progressContainer.style.display = "block";
  progressLabel.style.display = "block";
  progressVisual.style.width = "0%";
  progressLabel.textContent = "0% complete";

  const maxConcurrent = 4;
  let totalBytes = sortedBlobs.reduce((sum, file) => sum + file.size, 0);
  let uploadedBytes = 0;
  let activeUploads = 0;
  let completed = 0;
  let index = 0;

  return new Promise((resolve) => {
    function uploadNext() {
      if (index >= sortedBlobs.length) return;

      while (activeUploads < maxConcurrent && index < sortedBlobs.length) {
        const { blob, newFullPath } = sortedBlobs[index++];
        const storageRef = ref(storage, newFullPath);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        let previousTransferred = 0;
        activeUploads++;

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const current = snapshot.bytesTransferred;
            const delta = current - previousTransferred;
            previousTransferred = current;

            uploadedBytes += delta;
            const totalProgress = (uploadedBytes / totalBytes) * 100;
            progressVisual.style.width = `${totalProgress}%`;
            progressLabel.textContent = `${totalProgress.toFixed(2)}% complete`;
          },
          (error) => {
            console.error("Upload failed:", error);
            activeUploads--;
            uploadNext(); 
          },
          () => {
            activeUploads--;
            completed++;
            if (completed === sortedBlobs.length) {
              progressContainer.style.display = "none";
              progressLabel.style.display = "none";
              statusLabel.style.display = "block";
              document.getElementById('save-order-btn').style.display = "none";
              updateStatus(`${destination.charAt(0).toUpperCase() + destination.slice(1)} successfully resorted and reuploaded.`);
              const editableGalleries = Array.from(document.querySelectorAll('.editable-gallery'));
              editableGalleries.forEach((gallery) => gallery.style.color = "whitesmoke");
              sortingGallery.innerHTML = "";
              sortingGallery.style.display = "none";
              resolve();
            } else {
              uploadNext(); 
            }
          }
        );
      }
    }
    uploadNext(); 
  });
};

const sortGallery = async (btn) => {
  
  const imgContainer = btn.closest('.img-container');
  if (!imgContainer) return;

  const parent = imgContainer.parentElement;
  const containers = Array.from(parent.children);
  const currentIndex = containers.indexOf(imgContainer);
  const maxIndex = containers.length - 1;
  let swapIndex = null;

  const sortStyle = parent.style.gridTemplateColumns === "1fr" ? "one" : "two";
  
  if (btn.classList.contains('to-top')) {
    if (currentIndex === 0) return; 

    parent.insertBefore(imgContainer, parent.firstElementChild);

    const movedItem = currentOrder.splice(currentIndex, 1)[0];
    currentOrder.unshift(movedItem);

    const updatedContainers = Array.from(parent.children);
    updatedContainers.forEach((container, i) => {
      container.id = `img-container-${i}`;
      const img = container.querySelector('img');
      if (img) img.id = `img-${i}`;
      const indexDisplay = container.querySelector('.img-index-display');
      if (indexDisplay) indexDisplay.textContent = i;
    });
  } else if (btn.classList.contains('swap')) {
    const isEven = currentIndex % 2 === 0;
    const swapIndex = isEven ? currentIndex + 1 : currentIndex - 1;

    if (swapIndex >= 0 && swapIndex < containers.length) {
      const swapContainer = containers[swapIndex];

      if (isEven) {
        parent.insertBefore(swapContainer, imgContainer);
      } else {
        parent.insertBefore(imgContainer, swapContainer);
      }

      [currentOrder[currentIndex], currentOrder[swapIndex]] = [currentOrder[swapIndex], currentOrder[currentIndex]];

      const updatedContainers = Array.from(parent.children);

      updatedContainers.forEach((container, i) => {
        container.id = `img-container-${i}`;
        const img = container.querySelector('img');
        if (img) img.id = `img-${i}`;
        const indexDisplay = container.querySelector('.img-index-display');
        if (indexDisplay) indexDisplay.textContent = i;
      });
    }
  } else if (sortStyle === "one") {
    if (btn.classList.contains('up')) {
      if (currentIndex >= 1) {
        swapIndex = currentIndex - 1;
      } else {
        return; 
      }
    } else if (btn.classList.contains('down')) {
      if (currentIndex < maxIndex) {
        swapIndex = currentIndex + 1;
      } else {
        return;
      }
    } 
  } else if (sortStyle === "two") {
    if (btn.classList.contains('up')) {
      if (currentIndex >= 2) {
        swapIndex = currentIndex - 2;
      } else if (currentIndex === 1) {
        swapIndex = 0;
      } else {
        return; 
      }
    } else if (btn.classList.contains('down')) {
      if (currentIndex < maxIndex - 2) {
        swapIndex = currentIndex + 2;
      } else if (currentIndex === maxIndex - 2 || currentIndex === maxIndex - 1) {
        swapIndex = maxIndex;
      } else {
        return;
      }
    } 
  } else {
    return;
  };

  const swapContainer = containers[swapIndex];
  if (!swapContainer) return;

  if (swapIndex < currentIndex) {
    parent.insertBefore(imgContainer, swapContainer);
  } else if (swapIndex > currentIndex) {
    parent.insertBefore(imgContainer, containers[swapIndex + 1])
  } else {
    return;
  }

  [currentOrder[currentIndex], currentOrder[swapIndex]] = [currentOrder[swapIndex], currentOrder[currentIndex]];

  const updatedContainers = Array.from(parent.children);
  updatedContainers.forEach((container, i) => {
    container.id = `img-container-${i}`;
    const img = container.querySelector('img');
    if (img) img.id = `img-${i}`;
    const indexDisplay = container.querySelector('.img-index-display');
    if (indexDisplay) indexDisplay.textContent = i;
  });

  return currentOrder;
};

const imgTrash = async (btn) => {
  // could be throwing a testing error
  if (!confirm("Are you sure you want to delete this image? This cannot be undone.")) {
    return;
  }

  const imgContainer = btn.closest('.img-container');
  if (!imgContainer) return;

  const img = imgContainer.querySelector('img');
  const imagePath = img.getAttribute('data-path');
  const parent = imgContainer.parentElement;

  try {
    // Delete from Firebase Storage
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);

    // Remove from DOM
    parent.removeChild(imgContainer);

    // Remove from currentOrder
    const indexToRemove = currentOrder.findIndex(item => item.fullPath === imagePath);
    if (indexToRemove > -1) {
      currentOrder.splice(indexToRemove, 1);
    }

    // Re-index remaining containers and update IDs/texts
    const updatedContainers = Array.from(parent.children);
    updatedContainers.forEach((container, i) => {
      container.id = `img-container-${i}`;
      const img = container.querySelector('img');
      if (img) img.id = `img-${i}`;
      const indexDisplay = container.querySelector('.img-index-display');
      if (indexDisplay) indexDisplay.textContent = i;
    });

  } catch (err) {
    console.error("Failed to delete image:", err);
    alert("Error deleting image. Check console for details.");
  }
};

const getCurrentGallery = async (destination) => {
    clearStatus();
    const thisLoadId = ++activeGalleryLoadId;

    if (thisLoadId !== activeGalleryLoadId) {
      console.log(`Gallery load for ${destination} aborted – newer request in progress.`);
      return; // Abort stale load
    }

    currentOrder = []; 

    const sortingGallery = document.getElementById('sorting-gallery');
    sortingGallery.innerHTML = "";

    if(destination === "portfolio") {
      Object.assign(sortingGallery.style, {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: 'auto',
        gap: '5px',
        justifyItems: 'center'
      });
    } else {
      Object.assign(sortingGallery.style, {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridAutoRows: 'auto',
        gap: '5px',
        justifyItems: 'center'
      });
    }

    document.getElementById('sort-controls').style.display = "flex";
    document.getElementById('save-order-btn').style.display = "block";
    const storageRef = ref(storage, `galleries/${destination}`);

;
  try {
    const currentGallery = await listAll(storageRef);

    originalOrder = currentGallery.items.map((item, index) => ({
      fullPath: item.fullPath,
      originalIndex: index
    }));
    
    for (const [index, itemRef] of currentGallery.items.entries()) {

        const url = await getDownloadURL(itemRef); 
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        if (destination === "portfolio") {
          imgContainer.classList.add('special');
        }

        imgContainer.id = `img-container-${index}`;
        const img = document.createElement('img');
        img.id = `img-${index}`;
        img.src = url;
        img.alt = itemRef.name;
        img.setAttribute('data-path', itemRef.fullPath);

        const leftOverlay = document.createElement('div');
        leftOverlay.classList.add('img-controls-div', 'img-left');
        const rightOverlay = document.createElement('div');
        rightOverlay.classList.add('img-controls-div', 'img-right');
        
        const upSort = document.createElement('button');
        upSort.classList.add('sort-btn', 'up');
        upSort.innerHTML = `<i class="fa-solid fa-chevron-up" style="color: #E6C068"></i>`;

        const swapColumn = document.createElement('button');
        swapColumn.classList.add('sort-btn', 'swap');
        swapColumn.innerHTML = `<i class="fa-solid fa-arrows-left-right"></i>`;

        const downSort = document.createElement('button');
        downSort.classList.add('sort-btn', 'down');
        downSort.innerHTML = `<i class="fa-solid fa-chevron-down" style="color: #E6C068"></i>`;

        const trashImg = document.createElement('button');
        trashImg.classList.add('trash-btn');
        trashImg.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;

        const indexDisplay = document.createElement('span');
        indexDisplay.classList.add('img-index-display');
        indexDisplay.textContent = index; // Initial index

        const sendToTopBtn = document.createElement('button');
        sendToTopBtn.classList.add('sort-btn', 'to-top');
        sendToTopBtn.innerHTML = `<i class="fa-solid fa-star"></i>`;

        if (thisLoadId !== activeGalleryLoadId) {
          console.log(`Gallery load for ${destination} aborted – newer request in progress.`);
          return; // Abort stale load
        }

        if (destination === "portfolio") {
          rightOverlay.appendChild(upSort);
          rightOverlay.appendChild(swapColumn);
          rightOverlay.appendChild(downSort);
          leftOverlay.appendChild(sendToTopBtn);
          leftOverlay.appendChild(indexDisplay);
          leftOverlay.appendChild(trashImg);
        } else {
          rightOverlay.appendChild(upSort);
          rightOverlay.appendChild(indexDisplay);
          rightOverlay.appendChild(downSort);
          leftOverlay.appendChild(sendToTopBtn);
          leftOverlay.appendChild(trashImg);
        }

        imgContainer.appendChild(img);
        imgContainer.appendChild(rightOverlay);
        imgContainer.appendChild(leftOverlay); 
        sortingGallery.appendChild(imgContainer);

      currentOrder.push({
        name: itemRef.name,
        index: index,
        folder: destination,
        fullPath: itemRef.fullPath,
        downloadURL: url
      });

    }

    const sortBtns = Array.from(document.getElementsByClassName('sort-btn'));

    sortBtns.forEach((btn) => {
      if (thisLoadId !== activeGalleryLoadId) {
        console.log(`Gallery load for ${destination} aborted – newer request in progress.`);
        return; // Abort stale load
      }
      btn.addEventListener("click", (e) => sortGallery(e.currentTarget));
    });

    const trashBtns = Array.from(document.getElementsByClassName('trash-btn'));

    trashBtns.forEach((btn) => {
      if (thisLoadId !== activeGalleryLoadId) {
        console.log(`Gallery load for ${destination} aborted – newer request in progress.`);
        return; // Abort stale load
      }
      btn.addEventListener("click", (e) => imgTrash(e.currentTarget));
    });

    document.getElementById('save-order-btn').addEventListener("click", () => {
        confirmSort(destination);
    });

  } catch (error) {
    console.error("Error fetching storage items:", error);
  }
  if (thisLoadId !== activeGalleryLoadId) {
    console.log(`Gallery load for ${destination} aborted – newer request in progress.`);
    return; // Abort stale load
  }
  return currentOrder; 
};

const toUpload = () => {
    clearStatus();
    document.getElementById('feature-menu').style.display = "none";
    document.getElementById('upload-photos').style.display = "block";
    document.getElementById('upload-controls').style.display = "flex";
    document.getElementById('page-title-text').innerText = `UPLOAD PHOTOS`;
};

document.getElementById('to-upload').addEventListener("click", toUpload);

const toSort = () => {
  clearStatus();
  document.getElementById('feature-menu').style.display = "none";
  document.getElementById('sort-photos').style.display = "block";
  document.getElementById('sort-controls').style.display = "flex";
  document.getElementById('page-title-text').innerText = `EDIT GALLERY`;
  const editableGalleries = Array.from(document.querySelectorAll('.editable-gallery'));
  editableGalleries.forEach((gallery) => gallery.style.color = "whitesmoke");
};

document.getElementById('to-sort').addEventListener("click", toSort);

document.getElementById('sort-carousel').addEventListener("click", () => {
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

