import Header from '../components/Header.jsx'
import Spinner from '../components/GameWindow.jsx'
import { PrizeTable } from '../components/PrizeTable.jsx'
import Snow, { Snowfall } from "../components/Snowfall.jsx"
import './styles/Game.css'

function App() {
  return (
    <>
      <Header />
      <Snowfall/>
      <main className="main-content">
        <Spinner />
        <PrizeTable />
      </main>
    </>
  );
}

export default App;
