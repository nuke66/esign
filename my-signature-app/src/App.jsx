import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignatureComponent from './components/ui/SignatureComponent';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-0 text-center">E-sign</h1>
        <SignatureComponent />
      </div>
    </div>
  );
}

export default App;