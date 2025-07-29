import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotebookList } from './components/NotebookList';
import { NotebookView } from './components/NotebookView';
import { PageEditor } from './components/PageEditor';

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-50 flex flex-col">
        <Routes>
          <Route path="/" element={<NotebookList />} />
          <Route path="/notebook/:notebookId" element={<NotebookView />} />
          <Route path="/page/:pageId" element={<PageEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;