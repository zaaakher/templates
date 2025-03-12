import TemplateGrid from "./components/TemplateGrid";
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Search />
      <TemplateGrid />
    </div>
  );
}

export default App;
