import Notiflix from "notiflix";
import simpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import './sass/index.scss';

const axios = require('axios');
const input = document.querySelector('input');
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
const API_KEY = '26914341-54aa11636e5e71a26cca98a98';

let pageForBtn = 1;
let valueInput = '';
let totalHitsValue = '';

const lightbox = new simpleLightbox('.gallery a', {
    captionData: 'alt',
    captionDelay: 250,
    close: false,
});

form.addEventListener('submit', onSubmit);
loadMore.addEventListener('click', onClick);

function onSubmit(e){
    e.preventDefault();
    gallery.innerHTML = '';
    valueInput = e.currentTarget.elements.searchQuery.value.trim();
    if(!loadMore.classList.contains('visually-hidden')) {
        loadMore.classList.add('visually-hedden');
    }
    if (valueInput === '') {
        Notiflix.Notify.failure('Enter a quary');
    } else {
        pageForBtn = 1;

        getUser(valueInput).then(() => {
            if (totalHitsValue > 0) {
                Notiflix.Notify.success(`Hooray! We found ${totalHitsValue} images.`);
            }
            pageForBtn += 1;
            lightbox.refresh();
            input.value = '';
        });
    }
}

async function getUser(q) {
    try {
        const response = await axios.get(
            `https://pixabay.com/api/?key=${API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageForBtn}`
        );

        if (response.data.hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        }
        let arr = response.data.hits;
        let lastPage = Math.ceil(response.data.totalHits / 40);
        totalHitsValue = response.data.totalHits;

        makeList(arr);

        if (response.data.total > 40) {
            loadMore.classList.remove('visually-hidden');
        }
        if (pageForBtn === lastPage) {
            if(!loadMore.classList.contains('visually-hidden')) {
                loadMore.classList.add('visually-hidden');
            }
            if (response.data.total <= 40) {
                return;
            }
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }

    } catch (error) {
        console.log(error);
    }
}

function makeList(data) {
    const markup = makeListCard(data);
    gallery.insertAdjacentHTML('beforeend', markup);
}

function makeListCard(data) {
    return data
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) =>
          `<div class="photo-card">
    <a href="${largeImageURL}"> 
    <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
    </a>
    <div class="info">
      <p class="info_item">
         <b class="text property" >Likes</b>
        <b class="text value">${likes}</b>
      </p>
      <p class="info_item">
           <b class="text property">Views</b>
        <b class="text value">${views}</b>
      </p>
      <p class="info_item">
          <b class="text property">Comments</b>
        <b class="text value">${comments}</b>
      </p>
      <p class="info_item">
        <b class="text property">Downloads</b>
        <b class="text value">${downloads}</b>
      </p>
    </div>
  </div>`
      )
      .join('');
}

function onClick(e) {
    e.preventDefault();
    getUser(valueInput).then(() => {
        pageForBtn += 1;
        lightbox.refresh();
        const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
        window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
        });
    });
}