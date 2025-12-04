import Header from '../components/Header.jsx'
import Spinner from '../components/GameWindow.jsx'
import { PrizeTable } from '../components/PrizeTable.jsx'
import { Snowfall } from "../components/Snowfall.jsx"
import Chat from '../components/Chat.jsx'
import './styles/Game.css'

function App() {
  return (
    <>
      <Header />
      <Snowfall/>
      <main className="main-content">
	<Chat />
        <Spinner />
        <PrizeTable />
      </main>
    </>
  );
}

export default App;
