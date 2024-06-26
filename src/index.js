
document.addEventListener('DOMContentLoaded', function () {
    let loader = document.querySelector('.loader');
    // loader.classList.remove('loader--completed');

    // setTimeout(() => {
    //     loader.classList.add('loader--completed');
    // }, 3000);

    const mobileMenu = document.querySelector('.js-mobile-menu');
    const navListWrap = document.getElementById('mainMenuWrap');

    // Header menu toggle functionality
    if (mobileMenu && navListWrap) {
        mobileMenu.addEventListener('click', function () {
            navListWrap.classList.toggle('main-nav--show');
        });
    }

    // Sticky header functionality
    const header = document.querySelector('header');

    const handleScroll = () => {
        if (window.scrollY > 100) { // Adjust scroll threshold as needed
            header.classList.add('header--fixed');
        } else {
            header.classList.remove('header--fixed');
        }
    };

    window.addEventListener('scroll', handleScroll);

    const mobileFilterButton = document.querySelector('.js-mobile-filter');
    const productFilterElement = document.getElementById('productFilter');

    if (mobileFilterButton && productFilterElement) {
        mobileFilterButton.addEventListener('click', function () {
            productFilterElement.classList.toggle('filterOpen');
        });
    }

    const filterCloseButton = document.querySelector('.filter-close');
    if (filterCloseButton) {
        filterCloseButton.addEventListener('click', function () {
            productFilterElement.classList.remove('filterOpen');
        });
    }

    // Add event listener for Clear All button
    const clearFiltersLink = document.getElementById('clearFilters');
    if (clearFiltersLink) {
        clearFiltersLink.addEventListener('click', function (event) {
            event.preventDefault();
            // Clear filters
            sortBy = ''; // Reset sorting
            category = []; // Reset category filter
            currentPage = 1; // Reset pagination

            // Update UI as needed
            const categoryCheckboxes = document.querySelectorAll('.checkbox-input');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            productFilterElement.classList.remove('productFilter-wrap--show');

            // Reload products with cleared filters
            PLPController.getProducts(sortBy, category);
        });
    }


    const visuallyHiddenSortingLabel = document.querySelector('.product__product-sort .visually-hidden');
    const sortingSelect = document.getElementById('sorting');

    if (visuallyHiddenSortingLabel && sortingSelect) {
        visuallyHiddenSortingLabel.addEventListener('click', function (event) {
            sortingSelect.focus(); // Bring the select element into focus
            sortingSelect.click(); // Trigger click on the sorting select element
        });
    }
});

let sortBy = '';
let category = [];
let currentPage = 1;
let itemsPerPage = 10;
let products = [];
let filteredProducts = [];
let searchTerm = '';

const PLPController = {
    async loadMoreProducts(){
        try{
            document.querySelector('#loadMoreProducts').addEventListener('click', function(){
                itemsPerPage = 20;
                PLPController.getProducts();
                PLPController.filterProducts();
                PLPController.displayProducts(currentPage);
                loader.classList.remove('loader-completed');
                setTimeout(function() {
                    loader.classList.add('loader-completed');
                }, 250);
                

                // PLPController.setupPagination();
                // document.querySelector('.product__pagination').style.visibility = 'hidden';

                document.querySelector('#resetProducts').style.display = 'block';
                document.querySelector('#loadMoreProducts').style.display = 'none';
            });

            document.querySelector('#resetProducts').addEventListener('click', function(){
                itemsPerPage = 10;
                currentPage = 1;
                PLPController.getProducts();
                PLPController.filterProducts();
                PLPController.displayProducts(currentPage);
                // PLPController.setupPagination();
                // document.querySelector('.product__pagination').style.visibility = 'visible';
                document.querySelector('#resetProducts').style.display = 'none';
                document.querySelector('#loadMoreProducts').style.display = 'block';
            });
        }
        catch(err){
            console.log(err);  
        }
    },
    async searching() {
        try {
            document.querySelector('#search-input').addEventListener('keyup', function (e) {
                searchTerm = e.target.value.toLowerCase();
                currentPage = 1;
                PLPController.filterProducts();
                PLPController.displayProducts(currentPage);
                // PLPController.setupPagination();
            });
        } catch (err) {
            console.log(err);
        }
    },
    async addShorting() {
        try {
            let sorting = document.getElementById('sorting');
            sorting.addEventListener('change', function (e) {
                sortBy = e.target.value;
                currentPage = 1;
                PLPController.filterProducts();
                PLPController.displayProducts(currentPage);
                // PLPController.setupPagination();
            });
        } catch (err) {
            console.log(err);
        }
    },
    async addCategoryFilter() {
        try {
            let categoryFilter = document.querySelectorAll('.checkbox-input');
            for (let item of categoryFilter) {
                item.addEventListener('change', function (e) {
                    if (e.target.checked) {
                        category.push(e.target.value);
                    } else {
                        const index = category.indexOf(e.target.value);
                        if (index > -1) {
                            category.splice(index, 1);
                        }
                    }
                    currentPage = 1;
                    PLPController.filterProducts();
                    PLPController.displayProducts(currentPage);
                    // PLPController.setupPagination();
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    async getProducts() {
        try {
            loader.classList.add('loader-completed');
            const URL = `https://fakestoreapi.com/products?limit=${itemsPerPage}`;
            let response = await fetch(URL);
            products = await response.json();
            PLPController.filterProducts();
            PLPController.displayProducts(currentPage);
            // PLPController.setupPagination();
        } catch (err) {
            console.log(err);
            loader.classList.remove('loader--completed');
        }
    },
    filterProducts() {
        filteredProducts = products;

        if (sortBy) {
            if (sortBy === 'LowToHigh') {
                filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
            } else {
                filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
            }
        }

        if (category.length > 0) {
            filteredProducts = filteredProducts.filter(product => category.includes(product.category));
        }

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => 
                product.title.toLowerCase().includes(searchTerm)
            );
        }
    },
    displayProducts(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        let productHTML = '';
        for (let item of paginatedProducts) {
            productHTML += `
             <li class="product-item">
                <div class="product-card">
                    <div class="product-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="content-wrap">
                        <h3 class="product-name">${item.title.substring(0, 30)}</h3>
                        <p class="product-price">$${item.price}</p>
                        <button class="add-to-cart">
                            <img src="assets/images/heart.png" alt="cart icon" class="cart-icon">
                        </button>
                    </div>
                </div>
            </li>
            `;
        }
        document.getElementById('productList').innerHTML = productHTML;
    },
    setupPagination() {
        const paginationList = document.querySelector('.product__pagination');
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        paginationList.innerHTML = '';

        // Add Previous button
        const prevPageItem = document.createElement('li');
        prevPageItem.className = 'product__page-item';
        if (currentPage === 1) {
            prevPageItem.classList.add('product__page-item--hide');
        }
        prevPageItem.innerHTML = `<a class="product__page-link" href="#" aria-label="Previous">
            <img class="product__page-icon product__page-left" src="assets/images/chevron-right.svg">
        </a>`;
        prevPageItem.addEventListener('click', function (event) {
            event.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                PLPController.displayProducts(currentPage);
                // PLPController.setupPagination();
            }
        });
        paginationList.appendChild(prevPageItem);

        // Add page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'product__page-item';
            if (i === currentPage) {
                pageItem.classList.add('product__page-item--active');
            }
            pageItem.innerHTML = `<a class="product__page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', function (event) {
                event.preventDefault();
                currentPage = i;
                PLPController.displayProducts(currentPage);
                // PLPController.setupPagination();
            });
            paginationList.appendChild(pageItem);
        }

        // Add Next button
        const nextPageItem = document.createElement('li');
        nextPageItem.className = 'product__page-item';
        if (currentPage === totalPages) {
            nextPageItem.classList.add('product__page-item--hide');
        }
        nextPageItem.innerHTML = `<a class="product__page-link" href="#"><img class="product__page-icon product__page-right" src="assets/images/chevron-right.svg"></a>`;
        nextPageItem.addEventListener('click', function (event) {
            event.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                PLPController.displayProducts(currentPage);
                // PLPController.setupPagination();
            }
        });
        paginationList.appendChild(nextPageItem);        
    }    
};

PLPController.addShorting();
PLPController.addCategoryFilter();
PLPController.getProducts();
PLPController.searching();
PLPController.loadMoreProducts()