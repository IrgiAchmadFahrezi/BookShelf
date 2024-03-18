document.addEventListener('DOMContentLoaded', function () {
  const submitBook = document.getElementById('inputBook');
  submitBook.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const incompleteBookshelfList = [];
  const completedBookshelfList = [];
  const RENDER_EVENT = 'render-book';
  const SAVED_EVENT = 'saved-book';
  const STORAGE_KEY = 'BookShelf';

  function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = parseInt(document.getElementById('inputBookYear').value);
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, bookTitle, bookAuthor, bookYear, isComplete, false);

    if (isComplete) {
      completedBookshelfList.push(bookObject);
    } else {
      incompleteBookshelfList.push(bookObject);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function generateId() {
    return +new Date();
  }

  function generateBookObject(id, title, author, year, isCompleted) {
    return {
      id,
      title,
      author,
      year,
      isCompleted,
    };
  }

  function createBook(bookObject) {
    const titleBook = document.createElement('h2');
    titleBook.innerText = bookObject.title;
    titleBook.style.marginLeft = '10px';

    const authorBook = document.createElement('p');
    authorBook.innerText = 'Penulis: ' + bookObject.author;
    authorBook.style.marginLeft = '10px';

    const yearBook = document.createElement('p');
    yearBook.innerText = 'Tahun: ' + bookObject.year;
    yearBook.style.marginLeft = '10px';

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(titleBook, authorBook, yearBook);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.style.border = '1px solid #000';
    container.style.width = '20rem';
    container.style.height = '10.5rem';
    container.style.marginBottom = '50px';
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    const toggleButton = document.createElement('button');
    toggleButton.classList.add('toggle-button');
    toggleButton.style.float = 'right';
    toggleButton.style.marginRight = '20px';
    toggleButton.style.marginTop = '20px';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.width = '132px';
    toggleButton.style.height = '30px';
    toggleButton.innerText = bookObject.isCompleted ? 'Belum Selesai' : 'Selesai Dibaca';
    toggleButton.addEventListener('mouseenter', function () {
      toggleButton.style.backgroundColor = '#00ff00';
      toggleButton.style.color = '#ffffff';
    });
    toggleButton.addEventListener('mouseleave', function () {
      toggleButton.style.backgroundColor = '';
      toggleButton.style.color = '';
    });

    toggleButton.addEventListener('click', function () {
      toggleBookStatus(bookObject.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.style.float = 'left';
    deleteButton.style.marginLeft = '20px';
    deleteButton.style.marginTop = '20px';
    deleteButton.style.borderRadius = '5px';
    deleteButton.style.height = '30px';
    deleteButton.style.width = '120px';
    deleteButton.innerText = 'Hapus';

    deleteButton.addEventListener('mouseenter', function () {
      deleteButton.style.backgroundColor = '#ff0000';
      deleteButton.style.color = '#ffffff';
    });

    deleteButton.addEventListener('mouseleave', function () {
      deleteButton.style.backgroundColor = '';
      deleteButton.style.color = '';
    });
    deleteButton.addEventListener('click', function () {
      const confirmation = window.confirm('Apakah Anda yakin ingin menghapus buku ini?');
      if (confirmation) {
        removeBook(bookObject.id);
        alert('Buku berhasil dihapus.');
      } else {
        alert('Penghapusan buku dibatalkan.');
      }
    });

    container.append(toggleButton, deleteButton);
    return container;
  }

  function removeBook(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    const bookIndex = incompleteBookshelfList.findIndex((book) => book.id === bookId);
    if (bookIndex !== -1) {
      incompleteBookshelfList.splice(bookIndex, 1);
    } else {
      const completedIndex = completedBookshelfList.findIndex((book) => book.id === bookId);
      completedBookshelfList.splice(completedIndex, 1);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function toggleBookStatus(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = !bookTarget.isCompleted;

    if (bookTarget.isCompleted) {
      completedBookshelfList.push(bookTarget);
      incompleteBookshelfList.splice(incompleteBookshelfList.indexOf(bookTarget), 1);
    } else {
      incompleteBookshelfList.push(bookTarget);
      completedBookshelfList.splice(completedBookshelfList.indexOf(bookTarget), 1);
    }

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function findBook(bookId) {
    return incompleteBookshelfList.find((book) => book.id === bookId) || completedBookshelfList.find((book) => book.id === bookId);
  }

  document.addEventListener(RENDER_EVENT, function () {
    console.log(incompleteBookshelfList);
    console.log(completedBookshelfList);
    const unCompletedBookshelfList = document.getElementById('incompleteBookshelfList');
    unCompletedBookshelfList.innerHTML = '';

    for (const bookItem of incompleteBookshelfList) {
      const bookElement = createBook(bookItem);
      unCompletedBookshelfList.append(bookElement);
    }

    const completedBookshelfListContainer = document.getElementById('completeBookshelfList');
    completedBookshelfListContainer.innerHTML = '';

    for (const bookItem of completedBookshelfList) {
      const bookElement = createBook(bookItem);
      completedBookshelfListContainer.append(bookElement);
    }
  });

  const inputBookIsComplete = document.getElementById('inputBookIsComplete');
  inputBookIsComplete.addEventListener('change', function () {
    const bookSubmitButton = document.getElementById('bookSubmit');
    if (inputBookIsComplete.checked) {
      bookSubmitButton.innerText = 'Masukkan Buku ke rak Selesai Dibaca';
    } else {
      bookSubmitButton.innerText = 'Masukkan Buku ke rak Belum Selesai Dibaca';
    }
  });

  function saveData() {
    if (isStorageExist()) {
      const shelfData = {
        incomplete: incompleteBookshelfList,
        completed: completedBookshelfList,
      };
      const parsed = JSON.stringify(shelfData);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }
  function isStorageExist() {
    if (typeof Storage === 'undefined') {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData !== null) {
      const shelfData = JSON.parse(serializedData);
      if (Array.isArray(shelfData.incomplete)) {
        for (const book of shelfData.incomplete) {
          incompleteBookshelfList.push(book);
        }
      }
      if (Array.isArray(shelfData.completed)) {
        for (const book of shelfData.completed) {
          completedBookshelfList.push(book);
        }
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchBookInput = document.getElementById('searchBookTitle');
  searchBookInput.addEventListener('input', function () {
    searchBooks();
  });

  function searchBooks() {
    const searchInput = searchBookInput.value.trim().toLowerCase();
    const filteredIncompleteBooks = incompleteBookshelfList.filter((book) => book.title.toLowerCase().includes(searchInput));
    const filteredCompletedBooks = completedBookshelfList.filter((book) => book.title.toLowerCase().includes(searchInput));
    renderBooks(filteredIncompleteBooks, filteredCompletedBooks);
  }

  function renderBooks(incompleteBooks, completedBooks) {
    const unCompletedBookshelfList = document.getElementById('incompleteBookshelfList');
    unCompletedBookshelfList.innerHTML = '';

    for (const bookItem of incompleteBooks) {
      const bookElement = createBook(bookItem);
      unCompletedBookshelfList.append(bookElement);
    }

    const completedBookshelfListContainer = document.getElementById('completeBookshelfList');
    completedBookshelfListContainer.innerHTML = '';

    for (const bookItem of completedBooks) {
      const bookElement = createBook(bookItem);
      completedBookshelfListContainer.append(bookElement);
    }
  }
});
