import { useState } from 'react';
import './App.css';
import Query from './components/Query';
import DeckList from './components/DeckList';
import DeckDetail from './components/DeckDetail';
import StudySession from './components/StudySession';
import AddToDeckModal from './components/AddToDeckModal';
import { useDecks } from './hooks/useDecks';
import { getCardsForReview } from './utils/srs';
import logo from './assets/logo.png'

// View states for the "My Decks" tab
// 'list' | 'detail' | 'study'
function App() {
  const [activeTab, setActiveTab] = useState('dictionary');
  const [decksView, setDecksView] = useState('list');
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [deckPickerKanji, setDeckPickerKanji] = useState(null);

  const {
    decks,
    createDeck,
    updateDeck,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck,
    updateCardSRS,
  } = useDecks();

  const selectedDeck = decks.find(d => d.id === selectedDeckId);
  const totalDueCount = decks.reduce(
    (sum, d) => sum + getCardsForReview(d.cards).length,
    0
  );

  const handleSelectDeck = (deckId) => {
    setSelectedDeckId(deckId);
    setDecksView('detail');
  };

  const handleStudy = () => setDecksView('study');

  const handleBackToList = () => {
    setDecksView('list');
    setSelectedDeckId(null);
  };

  const handleBackToDetail = () => setDecksView('detail');

  const handleOpenDeckPicker = (kanjiData) => {
    setDeckPickerKanji(kanjiData);
  };

  const handleAddToDeck = (deckId, kanjiData) => {
    addCardToDeck(deckId, kanjiData);
  };

  const renderDecksContent = () => {
    if (decksView === 'study' && selectedDeck) {
      return (
        <StudySession
          deck={selectedDeck}
          onUpdateCardSRS={updateCardSRS}
          onBack={handleBackToDetail}
        />
      );
    }
    if (decksView === 'detail' && selectedDeck) {
      return (
        <DeckDetail
          deck={selectedDeck}
          onBack={handleBackToList}
          onStudy={handleStudy}
          onRemoveCard={removeCardFromDeck}
        />
      );
    }
    return (
      <DeckList
        decks={decks}
        onCreateDeck={createDeck}
        onUpdateDeck={updateDeck}
        onDeleteDeck={deleteDeck}
        onSelectDeck={handleSelectDeck}
      />
    );
  };

  return (
    <>
      <div className="container my-5 text-dark">
        <div className="brand-header text-center mb-5">
          <div className="brand-badge-container mt-5">
            <img src={logo} alt="Kanjutsu Logo" className="brand-logo-watermark" />
            <h1 className="brand-title">KanJutsu</h1>
          </div>
          <div className="brand-divider"></div>
        </div>

        {/* Tab navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'dictionary' ? 'active text-dark fw-semibold' : 'text-muted'}`}
              onClick={() => setActiveTab('dictionary')}
            >
              Dictionary
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'decks' ? 'active text-dark fw-semibold' : 'text-muted'}`}
              onClick={() => setActiveTab('decks')}
            >
              My Decks
              {totalDueCount > 0 && (
                <span className="badge bg-danger ms-2" style={{ fontSize: '0.65rem' }}>
                  {totalDueCount}
                </span>
              )}
            </button>
          </li>
        </ul>

        {activeTab === 'dictionary' ? (
          <Query onOpenDeckPicker={handleOpenDeckPicker} />
        ) : (
          renderDecksContent()
        )}

        {deckPickerKanji && (
          <AddToDeckModal
            decks={decks}
            kanjiData={deckPickerKanji}
            onAdd={handleAddToDeck}
            onCreateDeck={createDeck}
            onClose={() => setDeckPickerKanji(null)}
          />
        )}
      </div>
    </>
  );
}

export default App;
