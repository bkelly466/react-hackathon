import { useState } from 'react'
import './App.css'
import Query from "./component/Query"
import {useFlashCards} from '../Hooks/useFlashCards'

function App() {
  const [isStudyTime, setIsStudyTime] = useState(false);
  const { handleAddCard, handleUpdateSRS, cards } = useFlashCards()

  

  return (
    <>
      <div className="container my-5 text-dark">
        <div className="brand-header text-center">
          <h1 className="brand-title">KanJutsu</h1>
          <div className="brand-divider"></div>
          <p className="brand-subtitle">Kanji dictionary lookup</p>
        </div>

        {!isStudyTime ?
        <div className="container my-5 text-dark">
          <Query onAddCard={handleAddCard}/>
        </div>
        :
        <div>
          <StudySession updateSRS={handleUpdateSRS} cards={cards}/>
        </div>
        }
      </div>
    </>
  )
}

export default App;