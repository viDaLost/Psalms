import React, { useState, useEffect } from 'react';

function App() {
  const [currentScreen, setCurrentScreen] = useState('main-menu');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [wordSearchTerm, setWordSearchTerm] = useState('');
  const [psalmSearchTerm, setPsalmSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(1);
  const [selectedPsalmId, setSelectedPsalmId] = useState(null);
  const [fontSize, setFontSize] = useState('base');
  const [readingProgress, setReadingProgress] = useState({});
  const [books, setBooks] = useState([]);
  const [psalms, setPsalms] = useState([]);

  // Загрузка книг
  useEffect(() => {
    const loadBooks = async () => {
      const loadedBooks = [];
      for (let i = 1; i <= 3; i++) {
        const response = await fetch(`/books/book${i}.json`);
        const data = await response.json();
        loadedBooks.push(data);
      }
      setBooks(loadedBooks);
    };
    loadBooks();
  }, []);

  // Загрузка псалмов
  useEffect(() => {
    const loadPsalms = async () => {
      const files = ['1-en.json', '1-ru.json', '2.json', '3.json', '4.json', '5.json'];
      const loadedPsalms = [];
      for (const file of files) {
        const response = await fetch(`/psalms/${file}`);
        const data = await response.json();
        loadedPsalms.push(data);
      }
      setPsalms(loadedPsalms);
    };
    loadPsalms();
  }, []);

  // Прогресс чтения
  useEffect(() => {
    const savedProgress = localStorage.getItem('readingProgress');
    if (savedProgress) {
      setReadingProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('readingProgress', JSON.stringify(readingProgress));
  }, [readingProgress]);

  const currentBook = books.find(book => book.id === selectedBookId);
  const currentChapter = currentBook?.chapters.find(ch => ch.number === selectedChapterNumber);

  // Поиск книг
  const handleBookSearch = () => {
    if (!bookSearchTerm.trim()) return setSearchResults([]);
    setSearchResults(books.filter(b => b.title.toLowerCase().includes(bookSearchTerm.toLowerCase())));
  };

  // Поиск слова
  const handleWordSearch = () => {
    if (!wordSearchTerm.trim()) return setSearchResults([]);
    const results = books.map(book => {
      const matches = book.chapters.filter(ch => ch.content.toLowerCase().includes(wordSearchTerm.toLowerCase()));
      return matches.length ? {
        bookId: book.id,
        bookTitle: book.title,
        matches: matches.map(ch => ({
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          snippet: getSnippet(ch.content, wordSearchTerm)
        }))
      } : null;
    }).filter(r => r);
    setSearchResults(results);
  };

  const getSnippet = (text, term) => {
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    return idx === -1 ? text : text.substring(Math.max(0, idx - 30), idx + term.length + 30);
  };

  // Поиск псалмов
  const handlePsalmSearch = () => {
    if (!psalmSearchTerm.trim()) return setSearchResults([]);
    setSearchResults(psalms.filter(p => 
      p.title.toLowerCase().includes(psalmSearchTerm.toLowerCase()) ||
      p.number.toString().includes(psalmSearchTerm) ||
      p.content.toLowerCase().includes(psalmSearchTerm.toLowerCase())
    ));
  };

  // Выбор книги
  const handleSelectBook = (bookId) => {
    setSelectedBookId(bookId);
    const last = readingProgress[bookId];
    setSelectedChapterNumber(last?.chapterNumber || 1);
    setCurrentScreen('book-detail');
  };

  // Выбор главы
  const handleSelectChapter = (num) => {
    setSelectedChapterNumber(num);
    setReadingProgress(prev => ({ ...prev, [selectedBookId]: { chapterNumber: num } }));
  };

  // Размер текста
  const increaseFontSize = () => {
    if (fontSize === 'sm') setFontSize('base');
    else if (fontSize === 'base') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('xl');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xl') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('base');
    else if (fontSize === 'base') setFontSize('sm');
  };

  // Модальное окно псалма
  const handleSelectPsalm = (id) => {
    setSelectedPsalmId(id);
    setCurrentScreen('psalm-modal');
  };

  const handleClosePsalmModal = () => {
    setCurrentScreen('psalms');
    setSelectedPsalmId(null);
  };

  // Рендер экранов
  const renderMainMenu = () => (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-amber-900">Библиотека</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button onClick={() => setCurrentScreen('books')} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-4 px-6 rounded-lg transition-colors">
          Книги
        </button>
        <button onClick={() => setCurrentScreen('psalms')} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-4 px-6 rounded-lg transition-colors">
          Псалмы
        </button>
      </div>
    </div>
  );

  const renderBooks = () => (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setCurrentScreen('main-menu')} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-2 px-4 rounded mb-4">
          Главное меню
        </button>
        <h2 className="text-2xl font-bold mb-4 text-amber-900">Поиск книг</h2>
        {/* Остальные компоненты поиска */}
      </div>
    </div>
  );

  const renderBookDetail = () => {
    if (!currentBook || !currentChapter) return null;
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => setCurrentScreen('books')} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-2 px-4 rounded mb-4">
            Назад
          </button>
          {/* Остальные компоненты деталей книги */}
        </div>
      </div>
    );
  };

  const renderPsalms = () => (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setCurrentScreen('main-menu')} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-2 px-4 rounded mb-4">
          Главное меню
        </button>
        {/* Остальные компоненты поиска псалмов */}
      </div>
    </div>
  );

  const renderPsalmModal = () => {
    const selectedPsalm = psalms.find(p => p.id === selectedPsalmId);
    if (!selectedPsalm) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-amber-900">
              Псалом {selectedPsalm.number}: {selectedPsalm.title}
            </h3>
            <button onClick={handleClosePsalmModal} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-1 px-3 rounded">
              Закрыть
            </button>
          </div>
          <div className="mb-4 flex justify-end">
            <button onClick={increaseFontSize} className="bg-[#5C4033] hover:bg-[#4b3025] text-white font-medium py-1 px-3 rounded">
              A+
            </button>
          </div>
          <div className={`${fontSize === 'sm' ? 'text-sm' : fontSize === 'base' ? 'text-base' : fontSize === 'lg' ? 'text-lg' : 'text-xl'} text-amber-800 leading-relaxed whitespace-pre-wrap`}>
            {selectedPsalm.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'main-menu' && renderMainMenu()}
      {currentScreen === 'books' && renderBooks()}
      {currentScreen === 'book-detail' && renderBookDetail()}
      {currentScreen === 'psalms' && renderPsalms()}
      {currentScreen === 'psalm-modal' && renderPsalmModal()}
    </div>
  );
}

export default App;
