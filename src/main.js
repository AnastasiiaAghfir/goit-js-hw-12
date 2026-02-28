import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import { getImagesByQuery } from "./js/pixabay-api.js";
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from "./js/render-functions.js";

const form = document.querySelector(".form");
const loadMoreBtn = document.querySelector(".load-more");

let currentQuery = "";
let currentPage = 1;
let totalHits = 0;
const PER_PAGE = 15;

form.addEventListener("submit", async event => {
  event.preventDefault();

  const query = event.target.elements["search-text"].value.trim();

  if (!query) {
    iziToast.warning({
      message: "Please enter a search query!",
      position: "topRight",
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        message:
          "Sorry, there are no images matching your search query. Please try again!",
        position: "topRight",
      });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(totalHits / PER_PAGE);

    if (totalPages === 1) {
      iziToast.info({
        message:
          "We're sorry, but you've reached the end of search results.",
        position: "topRight",
      });
      return;
    }

    showLoadMoreButton();
  } catch (error) {
    iziToast.error({
      message: "Something went wrong.",
      position: "topRight",
    });
  } finally {
    hideLoader();
  }

  form.reset();
});

loadMoreBtn.addEventListener("click", async () => {
  currentPage += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    if (data.hits.length === 0) {
      iziToast.info({
        message:
          "We're sorry, but you've reached the end of search results.",
        position: "topRight",
      });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(totalHits / PER_PAGE);

    if (currentPage >= totalPages) {
      iziToast.info({
        message:
          "We're sorry, but you've reached the end of search results.",
        position: "topRight",
      });
    } else {
      showLoadMoreButton();
    }

    const { height } = document
      .querySelector(".gallery-item")
      .getBoundingClientRect();

    window.scrollBy({
      top: height * 2,
      behavior: "smooth",
    });
  } catch (error) {
    iziToast.error({
      message: "Something went wrong.",
      position: "topRight",
    });
  } finally {
    hideLoader();
  }
});