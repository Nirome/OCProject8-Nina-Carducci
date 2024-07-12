function mauGallery(element, options) {
  options = Object.assign({}, mauGalleryDefaults, options);
  const tagsCollection = [];

  createRowWrapper(element);
  if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
  }
  listeners(options);

  Array.from(element.children).forEach(item => {
      if (item.classList.contains('gallery-item')) {
          responsiveImageItem(item);
          moveItemInRowWrapper(item);
          wrapItemInColumn(item, options.columns);
          const theTag = item.getAttribute('data-gallery-tag');
          if (options.showTags && theTag && !tagsCollection.includes(theTag)) {
              tagsCollection.push(theTag);
          }
      }
  });

  if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
  }

  element.style.display = 'block';
}

const mauGalleryDefaults = {
  columns: 3,
  lightBox: true,
  lightboxId: null,
  showTags: true,
  tagsPosition: "bottom",
  navigation: true
};

function listeners(options) {
  document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
          if (options.lightBox && item.tagName === 'IMG') {
              openLightBox(item, options.lightboxId);
          }
      });
  });

  document.querySelectorAll('.gallery').forEach(gallery => {
      gallery.addEventListener('click', function(event) {
          if (event.target.classList.contains('nav-link')) {
              filterByTag(event.target);
          } else if (event.target.classList.contains('mg-prev')) {
              prevImage(options.lightboxId);
          } else if (event.target.classList.contains('mg-next')) {
              nextImage(options.lightboxId);
          }
      });
  });
}

function createRowWrapper(element) {
  if (!element.querySelector('.gallery-items-row')) {
      const rowWrapper = document.createElement('div');
      rowWrapper.className = 'gallery-items-row row';
      element.appendChild(rowWrapper);
  }
}

function wrapItemInColumn(element, columns) {
  let columnClasses = '';
  if (typeof columns === 'number') {
      columnClasses = ` col-${Math.ceil(12 / columns)}`;
  } else if (typeof columns === 'object') {
      if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
      if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
      if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
      if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
      if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
  } else {
      console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
  }

  const column = document.createElement('div');
  column.className = `item-column mb-4${columnClasses}`;
  element.parentNode.replaceChild(column, element);
  column.appendChild(element);
}

function moveItemInRowWrapper(element) {
  const rowWrapper = document.querySelector('.gallery-items-row');
  if (rowWrapper) {
      rowWrapper.appendChild(element);
  }
}

function responsiveImageItem(element) {
  if (element.tagName === 'IMG') {
      element.classList.add('img-fluid');
  }
}

function openLightBox(element, lightboxId) {
  const lightbox = document.getElementById(lightboxId);
  if (lightbox) {
      const lightboxImage = lightbox.querySelector('.lightboxImage');
      if (lightboxImage) {
          lightboxImage.src = element.src;
          lightbox.classList.add('show');
          lightbox.style.display = 'block';
      }
  }
}

function prevImage(lightboxId) {
  const activeImage = document.querySelector(`img[src="${document.querySelector('.lightboxImage').src}"]`);
  const activeTag = document.querySelector('.tags-bar .active-tag').dataset.imagesToggle;
  const imagesCollection = [];
  
  document.querySelectorAll('.item-column').forEach(column => {
      const img = column.querySelector('img');
      if (img && (activeTag === 'all' || img.dataset.galleryTag === activeTag)) {
          imagesCollection.push(img);
      }
  });

  let index = imagesCollection.indexOf(activeImage) - 1;
  if (index < 0) index = imagesCollection.length - 1;
  
  document.querySelector('.lightboxImage').src = imagesCollection[index].src;
}

function nextImage(lightboxId) {
  const activeImage = document.querySelector(`img[src="${document.querySelector('.lightboxImage').src}"]`);
  const activeTag = document.querySelector('.tags-bar .active-tag').dataset.imagesToggle;
  const imagesCollection = [];
  
  document.querySelectorAll('.item-column').forEach(column => {
      const img = column.querySelector('img');
      if (img && (activeTag === 'all' || img.dataset.galleryTag === activeTag)) {
          imagesCollection.push(img);
      }
  });

  let index = imagesCollection.indexOf(activeImage) + 1;
  if (index >= imagesCollection.length) index = 0;

  document.querySelector('.lightboxImage').src = imagesCollection[index].src;
}

function createLightBox(gallery, lightboxId, navigation) {
  const modalHTML = `
      <div class="modal fade" id="${lightboxId || 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-body">
                      ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : ''}
                      <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                      ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : ''}
                  </div>
              </div>
          </div>
      </div>`;
  gallery.insertAdjacentHTML('beforeend', modalHTML);
}

function showItemTags(gallery, position, tags) {
  let tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
  tags.forEach(tag => {
      tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
  });
  
  const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
  if (position === 'bottom') {
      gallery.insertAdjacentHTML('beforeend', tagsRow);
  } else if (position === 'top') {
      gallery.insertAdjacentHTML('afterbegin', tagsRow);
  } else {
      console.error(`Unknown tags position: ${position}`);
  }
}

function filterByTag(element) {
  if (element.classList.contains('active-tag')) {
      return;
  }

  document.querySelector('.active-tag').classList.remove('active-tag', 'active');
  element.classList.add('active-tag', 'active');

  const tag = element.dataset.imagesToggle;

  document.querySelectorAll('.gallery-item').forEach(item => {
      const column = item.closest('.item-column');
      if (column) {
          column.style.display = tag === 'all' || item.dataset.galleryTag === tag ? 'block' : 'none';
      }
  });
}
