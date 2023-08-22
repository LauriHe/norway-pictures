'use strict';

// extract exif data from an image and add it to the desired dom element
const addExifToImgData = async (sourceElem, targetElem) => {
  // get an image file from image element source
  const getFileFromImgElem = async (img) => {
    const res = await fetch(img.src);
    const blob = await res.blob();
    const file = new File([blob], 'image.jpg', blob);
    return file;
  };

  // extract exif data from image file
  const extractExif = async (file) => {
    const reader = new FileReader();
    reader.onloadend = function (e) {
      try {
        const exifObj = piexif.load(e.target.result); // use piexifjs to extract exif data

        // store and format the desired exif data
        const camera = exifObj['0th'][piexif.ImageIFD.Make] + ' ' + exifObj['0th'][piexif.ImageIFD.Model];
        const lens = exifObj['Exif'][piexif.ExifIFD.LensModel];
        const aperture = 'f/' + exifObj['Exif'][piexif.ExifIFD.FNumber][0] / exifObj['Exif'][piexif.ExifIFD.FNumber][1];
        const exposure = exifObj['Exif'][piexif.ExifIFD.ExposureTime][0] + '/' + exifObj['Exif'][piexif.ExifIFD.ExposureTime][1] + ' s';
        const iso = exifObj['Exif'][piexif.ExifIFD.ISOSpeedRatings];
        const focalLength = exifObj['Exif'][piexif.ExifIFD.FocalLengthIn35mmFilm] + ' mm';

        // add exif data to image element as data attributes
        targetElem.setAttribute('data-camera', camera);
        targetElem.setAttribute('data-lens', lens);
        targetElem.setAttribute('data-aperture', aperture);
        targetElem.setAttribute('data-exposure', exposure);
        targetElem.setAttribute('data-iso', iso);
        targetElem.setAttribute('data-focal-length', focalLength);
      } catch (error) {}
    };
    reader.readAsDataURL(file);
  };

  const file = await getFileFromImgElem(sourceElem);
  extractExif(file);
};

// display exif data and create modal when clicking on an image
const handleExifAndModal = async () => {
  const images = document.querySelectorAll('.image');
  for (let i = 0; i < images.length; i++) {
    // create a temporary hidden image to extract exif data from
    // this is needed because the exif data is not available from the webp images
    const hiddenImg = document.createElement('img');
    i != 48 && (hiddenImg.src = `./images/jpg-tiny/${i + 1}.jpg`);
    hiddenImg.style.display = 'none';
    document.body.appendChild(hiddenImg);

    // add exif data to image element
    await addExifToImgData(hiddenImg, images[i]);
    hiddenImg.remove();
  }

  const imgContainers = document.querySelectorAll('.image-container'); // each image is stored in its own container

  for (let i = 0; i < imgContainers.length; i++) {
    const imgContainer = imgContainers[i];

    // get data attributes from image element
    const camera = images[i].getAttribute('data-camera');
    const lens = images[i].getAttribute('data-lens');
    const aperture = images[i].getAttribute('data-aperture');
    const exposure = images[i].getAttribute('data-exposure');
    const iso = images[i].getAttribute('data-iso');
    const focalLength = images[i].getAttribute('data-focal-length');

    // container to hold exif data
    const exifData = document.createElement('div');
    exifData.classList.add('exif-data');

    // p elements to hold exif data
    const cameraData = document.createElement('p');
    cameraData.classList.add('exif-data-item');
    cameraData.textContent = camera;

    const lensData = document.createElement('p');
    lensData.classList.add('exif-data-item');
    lensData.textContent = lens;

    const apertureData = document.createElement('p');
    apertureData.classList.add('exif-data-item');
    apertureData.textContent = aperture;

    const exposureData = document.createElement('p');
    exposureData.classList.add('exif-data-item');
    exposureData.textContent = exposure;

    const isoData = document.createElement('p');
    isoData.classList.add('exif-data-item');
    isoData.textContent = 'ISO ' + iso;

    const focalLengthData = document.createElement('p');
    focalLengthData.classList.add('exif-data-item');
    focalLengthData.textContent = '' + focalLength;

    exifData.appendChild(cameraData);
    exifData.appendChild(lensData);
    exifData.appendChild(apertureData);
    exifData.appendChild(exposureData);
    exifData.appendChild(isoData);
    exifData.appendChild(focalLengthData);

    imgContainer.appendChild(exifData);

    exifData.style.transition = 'top 0.2s ease-in-out'; // transition for exif data to slide in and out

    // show exif data on mouseenter
    imgContainer.addEventListener('mouseenter', () => {
      exifData.style.top = 0;
      images[i].style.filter = 'brightness(50%)';
    });

    // hide exif data on mouseleave
    imgContainer.addEventListener('mouseleave', () => {
      exifData.style.top = '19rem';
      images[i].style.filter = 'brightness(100%)';
    });

    // show modal on click
    imgContainer.addEventListener('click', () => {
      // div to hold modal
      const modal = document.createElement('div');
      modal.classList.add('modal');

      // modal image
      const modalImg = document.createElement('img');
      modalImg.src = `./images/webp-large/${i + 1}.webp`;
      modalImg.classList.add('modal-image');

      // container to hold modal image and exif data
      const modalImgContainer = document.createElement('div');
      modalImgContainer.classList.add('modal-image-container');
      modalImgContainer.appendChild(modalImg);

      // modal controls
      const controls = document.createElement('div');
      controls.classList.add('modal-controls');

      // button to close modal
      const closeButton = document.createElement('button');
      const closeIcon = document.createElement('img');
      closeIcon.classList.add('modal-icon');
      closeIcon.src = './icons/close.svg';
      closeButton.classList.add('modal-close-button');
      closeButton.classList.add('modal-button');
      closeButton.appendChild(closeIcon);

      // button to show exif data
      const infoButton = document.createElement('button');
      const infoIcon = document.createElement('img');
      infoIcon.classList.add('modal-icon');
      infoIcon.src = './icons/info.svg';
      infoButton.classList.add('modal-info-button');
      infoButton.classList.add('modal-button');
      infoButton.appendChild(infoIcon);

      // button to show previous image
      const backButton = document.createElement('button');
      backButton.classList.add('modal-button');
      const backIcon = document.createElement('img');
      backIcon.classList.add('modal-icon');
      backIcon.src = './icons/back.svg';
      backButton.appendChild(backIcon);

      // button to show next image
      const forwardButton = document.createElement('button');
      forwardButton.classList.add('modal-button');
      const forwardIcon = document.createElement('img');
      forwardIcon.classList.add('modal-icon');
      forwardIcon.src = './icons/forward.svg';
      forwardButton.appendChild(forwardIcon);

      // container to hold exif data
      // this is needed to be able to slide the exif data in and out of view
      const modalExifDataContainer = document.createElement('div');
      modalExifDataContainer.classList.add('modal-exif-data-container');

      // exif data
      const modalExifData = document.createElement('div');
      modalExifData.classList.add('modal-exif-data');

      // p elements to hold exif data
      const modalCameraData = document.createElement('p');
      modalCameraData.classList.add('modal-exif-data-item');
      modalCameraData.textContent = camera;
      modalExifData.appendChild(modalCameraData);

      const modalLensData = document.createElement('p');
      modalLensData.classList.add('modal-exif-data-item');
      modalLensData.textContent = lens;
      modalExifData.appendChild(modalLensData);

      const modalApertureData = document.createElement('p');
      modalApertureData.classList.add('modal-exif-data-item');
      modalApertureData.textContent = aperture;
      modalExifData.appendChild(modalApertureData);

      const modalExposureData = document.createElement('p');
      modalExposureData.classList.add('modal-exif-data-item');
      modalExposureData.textContent = exposure;
      modalExifData.appendChild(modalExposureData);

      const modalIsoData = document.createElement('p');
      modalIsoData.classList.add('modal-exif-data-item');
      modalIsoData.textContent = 'ISO ' + iso;
      modalExifData.appendChild(modalIsoData);

      const modalFocalLengthData = document.createElement('p');
      modalFocalLengthData.classList.add('modal-exif-data-item');
      modalFocalLengthData.textContent = '' + focalLength;
      modalExifData.appendChild(modalFocalLengthData);

      const modalExifPhotographer = document.createElement('p');
      modalExifPhotographer.classList.add('modal-exif-data-item');
      modalExifPhotographer.classList.add('modal-exif-data-photographer');
      modalExifPhotographer.textContent = '© Lauri Heikkinen';
      modalExifData.appendChild(modalExifPhotographer);

      // append elements to modal
      controls.appendChild(infoButton);
      controls.appendChild(closeButton);
      modalImgContainer.appendChild(controls);
      modalExifDataContainer.appendChild(modalExifData);
      modalImgContainer.appendChild(modalExifDataContainer);
      modal.appendChild(backButton);
      modal.appendChild(modalImgContainer);
      modal.appendChild(forwardButton);
      document.body.appendChild(modal);

      const scrollHeight = document.documentElement.scrollTop; // keep track of scroll height to position modal in the center of the screen
      modal.style.top = `${scrollHeight}px`; // position modal in the center of the screen
      document.body.style.overflow = 'hidden'; // prevent scrolling when modal is open
      modalExifData.style.transition = 'right 0.2s ease-in-out'; // transition for exif data to slide in and out
      controls.style.display = 'none'; // hide controls until image has loaded

      // wait for image to load before showing controls and positioning exif data
      modalImg.addEventListener('load', () => {
        controls.style.display = 'inline';
        const imageHeight = modalImg.height;
        modalExifPhotographer.style.marginTop = `${imageHeight - 30}px`; // position the photographer name at the bottom of the image

        // reposition the photographer name when the window is resized
        window.addEventListener('resize', () => {
          const imageHeight = modalImg.height;
          modalExifPhotographer.style.marginTop = `${imageHeight - 30}px`;
        });
      });

      // close modal when clicking outside of picture
      modal.addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
      });

      // prevent modal from closing when clicking on exif data
      modalExifDataContainer.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      let infoOpen = false; // keep track of whether exif data is visible or not
      // show or hide exif data when clicking on info button
      infoButton.addEventListener('click', (event) => {
        event.stopPropagation();
        infoOpen ? (modalExifData.style.right = '-17rem') : (modalExifData.style.right = '0');
        infoOpen = !infoOpen;
      });

      let currentImage = i; // keep track of which image is currently being shown
      // show the correct exif data when changing images
      const setExifData = () => {
        modalImg.src = `./images/webp-large/${currentImage + 1}.webp`;
        modalCameraData.textContent = images[currentImage].getAttribute('data-camera');
        modalLensData.textContent = images[currentImage].getAttribute('data-lens');
        modalApertureData.textContent = images[currentImage].getAttribute('data-aperture');
        modalExposureData.textContent = images[currentImage].getAttribute('data-exposure');
        modalIsoData.textContent = 'ISO ' + images[currentImage].getAttribute('data-iso');
        modalFocalLengthData.textContent = '' + images[currentImage].getAttribute('data-focal-length');
      };

      // show the previous image when clicking on back button
      backButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (currentImage > 0) {
          currentImage--;
          setExifData();
        } else {
          currentImage = 47;
          setExifData();
        }
      });

      // show the next image when clicking on forward button
      forwardButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (currentImage < 47) {
          currentImage++;
          setExifData();
        } else {
          currentImage = 0;
          setExifData();
        }
      });

      // show the previous image when pressing left arrow key and the next image when pressing right arrow key
      document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          if (currentImage > 0) {
            currentImage--;
            setExifData();
          } else {
            currentImage = 47;
            setExifData();
          }
        } else if (event.key === 'ArrowRight') {
          if (currentImage < 47) {
            currentImage++;
            setExifData();
          } else {
            currentImage = 0;
            setExifData();
          }
        }
      });
    });
  }
};

// load images and create a grid
const initImages = () => {
  const grid = document.querySelector('.grid');

  for (let i = 1; i < 50; i++) {
    const img = document.createElement('img');
    img.classList.add('image');
    i != 49 && (img.src = `./images/webp-small/${i}.webp`);

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('image-container');
    imgContainer.appendChild(img);
    grid.appendChild(imgContainer);
  }

  // create masonry grid after images have loaded
  window.addEventListener('load', () => {
    const msnry = new Masonry(grid, {
      itemSelector: '.image-container',
      columnWidth: 300,
      fitWidth: true,
    });
  });

  // add exif data to image elements
  handleExifAndModal();

  // temporary fix for exif data not loading on last image
  const images = document.querySelectorAll('.image');
  images[48].remove();
};

initImages();
