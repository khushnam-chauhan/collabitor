import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import EditorPage from './pages/EditorPage';
import './App.css'

const App = () => {
  return (
    <>
    <div>
      <Toaster position='top-right'
      toastOptions={{
        success:{
          theme:{
            primary:'green',
          },
        },
      }}>

      </Toaster>
    </div>
    <Router>
      <div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
        
      </div>
    </Router>
    </>
  );
};

export default App;
