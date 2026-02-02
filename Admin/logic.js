
/**
 * Fetches categories from the server and renders them in the HTML table.
 *
 * Steps:
 * 1. Select the table body container where categories will be displayed.
 * 2. Fetch the categories data from the provided API endpoint.
 * 3. Parse the response as JSON.
 * 4. Loop through each category and create a table row (`<tr>`) with:
 *    - Index number
 *    - Category name
 *    - Category description
 *    - Action icons for edit and delete
 * 5. Append all generated rows as HTML to the table container.
 *
 * Notes:
 * - `caterogries` is assumed to be an array of objects with `name` and `description` fields.
 * - `count` variable is used to display row numbers starting from 1.
 * - Action icons currently do not have click functionality attached; they can be handled separately.
 *
 * Trigger:
 * - The function is called when the DOM content is fully loaded (`DOMContentLoaded` event).
 */
const renderCaterogries = async (term) => {
  var container = document.querySelector('#caterogy-container');
  var totalCategories = document.querySelector('#totalCate');
  var uri = 'http://localhost:3000/categories';

  if (term) {
    uri += `?q=${term}`;
  }

  const res = await fetch(uri);
  const caterogries = await res.json();

  var template = '';
  var count = 1;
  caterogries.forEach((caterory) => {
    template += `
    <tr data-id="${caterory.id}">
       <td>${count}</td>
       <td>${caterory.name}</td>
       <td>
           ${
             caterory.description.length > 90
               ? caterory.description.slice(0, 90) + '...'
               : caterory.description
           }
        </td>
        <td class="actions">
           <i class="fa-solid fa-pen edit" 
            onclick="openUpdateModal('${caterory.id}', '${caterory.name}','${caterory.description}')"></i>
           <i 
             class="fa-solid fa-trash delete"
             onclick="openDeleteModal('${caterory.id}', '${caterory.name}')">
            </i>
        </td>
    </tr>`;
    count++;
  });

  container.innerHTML = template;
  totalCategories.innerHTML = count - 1;
};
const categoriesSection = document.getElementById('c');
categoriesSection.addEventListener('click', renderCaterogries);

/**
 * ============================
 * Category Modal & Creation Logic
 * ============================
 *
 * Handles opening/closing the "Add Category" modal, validating inputs,
 * generating unique IDs for new categories, submitting them to the server,
 * and updating the categories table while staying on the categories tab.
 */

/** Select the Add Category modal element */
const modal = document.getElementById('addCategoryModal');

/**
 * Opens the Add Category modal by changing its display to 'flex'
 */
function openModal() {
  modal.style.display = 'flex';
}

/**
 * Closes the Add Category modal by hiding it
 * and clear the form
 * clear the span after the input and reset the border with the start style
 */
function closeModal() {
  modal.style.display = 'none';
  document.querySelector('#addCategoryForm').reset();
  var categoryName = document.querySelector('#categoryName');
  var CategoryDescription = document.querySelector('#categoryDescription');

  categoryName.nextElementSibling.innerHTML = '';
  categoryName.style.border = '1px solid var(--primary-color)';
  CategoryDescription.nextElementSibling.innerHTML = '';
  CategoryDescription.style.border = '1px solid var(--primary-color)';
}

/**
 * Validates a form input field
 *
 * @param {HTMLElement} element - The input or textarea element to validate
 * @returns {boolean} - true if valid, false otherwise
 *
 * Validation rules:
 * - Name: 5–30 alphanumeric characters or spaces
 * - Description: 15–300 alphanumeric characters or spaces
 * - Displays error messages and border colors for invalid inputs
 */
function validation(element) {
  var categoryNameRegex = /^[A-Za-z0-9 ]{5,30}$/;
  var categoryDesctiptionRegex = /^[A-Za-z0-9 ]{15,300}$/;

  if (!element.value) {
    element.nextElementSibling.textContent = `* Please enter your ${element.name}`;
    element.style.border = '1px solid #ef4444';
    element.nextElementSibling.style.color = '#ef4444';
    return false;
  } else if (
    (element.name == 'CatergoryName' &&
      !categoryNameRegex.test(element.value)) ||
    (element.name == 'CategoryDescription' &&
      !categoryDesctiptionRegex.test(element.value))
  ) {
    element.nextElementSibling.textContent = `Please enter ${element.name} data in valid format`;
    element.style.border = '1px solid #ef4444';
    element.nextElementSibling.style.color = '#ef4444';
    return false;
  } else {
    element.nextElementSibling.textContent = '';
    element.style.border = '1px solid green';
    return true;
  }
}

/**
 *
 * Generates a unique ID for a new category
 * @returns {string} Unique category ID using timestamp + random number
 */
const generateId = () => {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
};

/** Select the Add Category form element */
var addCategoryForm = document.querySelector('#addCategoryForm');

/**
 * Handles the form submission for creating a new category
 *
 * Steps:
 * 1. Prevent default form submission
 * 2. Validate all form inputs
 * 3. If valid:
 *    - Generate a unique ID
 *    - Collect name and description
 *    - Send a POST request to the JSON server
 *    - Reset the form
 *    - Close the modal
 *    - Refresh the categories table
 *    - Stay on the categories tab
 *
 * @param {Event} e - The submit event
 */
const createCategory = async (e) => {
  e.preventDefault();

  var elements = [
    document.querySelector('#categoryName'),
    document.querySelector('#categoryDescription'),
  ];

  var allValid = true;

  // Validate all inputs
  for (var element in elements) {
    var valid = validation(elements[element]);
    if (!valid) {
      allValid = false;
    }
  }

  if (allValid) {
    // Collect values
    var name = addCategoryForm.CatergoryName.value;
    var description = addCategoryForm.CategoryDescription.value;
    var id = generateId();

    // Send POST request to add new category
    await fetch('http://localhost:3000/categories', {
      method: 'POST',
      body: JSON.stringify({ id, name, description }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Reset form & close modal
    addCategoryForm.reset();
    closeModal();

    // Refresh categories table
    await renderCaterogries();
  }
};

/** Attach submit event listener to the Add Category form */
addCategoryForm.addEventListener('submit', createCategory);

// ==============================
// Delete Category Modal
// ==============================

// Modal overlay element for delete confirmation popup
const deleteModal = document.querySelector('.modal-overlay-delete');

// Paragraph/span where the confirmation message will be shown
const deleteMessage = document.getElementById('deleteMessage');

// Button that confirms deletion
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Variable to temporarily store the ID of the category to be deleted
let categoryIdToDelete = null;

// ==============================
// Open Delete Modal
// ==============================

/**
 * Opens the delete confirmation modal
 * @param {string} id - Category ID to delete
 * @param {string} name - Category name to display in confirmation message
 */
function openDeleteModal(id, name) {
  // Store category ID for later use when confirming deletion
  categoryIdToDelete = id;

  // Set confirmation message dynamically
  deleteMessage.textContent = `Are you sure you want to delete "${name}"?`;

  // Show the modal
  deleteModal.style.display = 'flex';
}

// ==============================
// Close Delete Modal
// ==============================

/**
 * Closes the delete confirmation modal
 * and clears the stored category ID
 */
function closeDeleteModal() {
  categoryIdToDelete = null;
  deleteModal.style.display = 'none';
}

// ==============================
// Confirm Delete Action
// ==============================

/**
 * Handles the delete confirmation button click
 * - Deletes the selected category
 * - Deletes all products related to that category
 * - Refreshes the categories list
 */
confirmDeleteBtn.addEventListener('click', async (e) => {
  // Safety check: if no category is selected, stop execution
  if (!categoryIdToDelete) return;

  // ================================
  // Delete category from json-server
  // ================================
  await fetch(`http://localhost:3000/categories/${categoryIdToDelete}`, {
    method: 'DELETE',
  });

  // Close modal and refresh categories table
  closeDeleteModal();
  renderCaterogries();

  // ==============================
  // Delete related products
  // ==============================

  // Fetch all products
  const productsRes = await fetch('http://localhost:3000/products');
  const products = await productsRes.json();

  // Loop through products and delete those that belong to the deleted category
  products.forEach(async (product) => {
    if (product.categoryId == categoryIdToDelete) {
      await fetch(`http://localhost:3000/products/${product.id}`, {
        method: 'DELETE',
      });
    }
  });
});

const updateModal = document.getElementById('UpdateCategoryModal');
const updateForm = document.getElementById('updateCategoryForm');
var categoryIdToUpdate = null;

function openUpdateModal(id, name, description) {
  categoryIdToUpdate = id;
  updateForm.CatergoryName.value = name;
  updateForm.categoryDescription.value = description;
  updateModal.style.display = 'flex';
}

function closeUpdateModal() {
  updateModal.style.display = 'none';
}

const updateCategory = async (e) => {
  e.preventDefault();

  if (categoryIdToUpdate == null) {
    return;
  }

  var elements = [updateForm.CatergoryName, updateForm.CategoryDescription];

  var allValid = true;

  // Validate all inputs
  for (var element in elements) {
    var valid = validation(elements[element]);
    if (!valid) {
      allValid = false;
    }
  }

  if (allValid) {
    // Collect values
    var name = updateForm.CatergoryName.value;
    var description = updateForm.CategoryDescription.value;

    await fetch(`http://localhost:3000/categories/${categoryIdToUpdate}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryIdToUpdate,
        name,
        description,
      }),
    });

    // Reset form & close modal
    updateForm.reset();
    closeUpdateModal();

    // Refresh categories table
    renderCaterogries();
  }
};
updateForm.addEventListener('submit', updateCategory);

const categorySearchForm = document.querySelector('.categorySearchForm');

categorySearchForm.search.addEventListener('keyup', () => {
  renderCaterogries(categorySearchForm.search.value.trim());
});

categorySearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
});


const tabs = document.querySelectorAll('.taps .tap');
const pages = document.querySelectorAll('.sideTab');

function activateTab(pageId) {
  // tabs
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.page === pageId);
  });

  // pages
  pages.forEach((page) => {
    page.classList.toggle('active', page.id === pageId);
  });

  // save state
  localStorage.setItem('activeTab', pageId);

  if(pageId == 'categories'){
    renderCaterogries();
  }
}

// click
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activateTab(tab.dataset.page);
  });
});

const savedTab = localStorage.getItem('activeTab');
activateTab(savedTab);