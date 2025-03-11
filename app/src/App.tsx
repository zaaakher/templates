import TemplateGrid from "./components/TemplateGrid";
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import { useStore } from "./store";
import "./App.css";

function App() {
  const view = useStore((state) => state.view);

  return (
    <div className="min-h-screen">
      <Navigation />
      <Search />
      <TemplateGrid view={view} />
    </div>
  );
}

export default App;
