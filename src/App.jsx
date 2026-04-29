import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';

function App() {
  const [soru, setSoru] = useState('');
  const [cevap, setCevap] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const textareaRef = useRef(null);


  const handleInputYazma = (e) => {
    setSoru(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '45px'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const AI_Sor = async () => {
    if (!soru.trim()) return;
    
    const gonderilecekSoru = soru;
    setSoru('');
    setCevap('');
    setYukleniyor(true);
    

    if (textareaRef.current) {
      textareaRef.current.style.height = '45px';
    }

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-coder:6.7b',
          prompt: "Sadece kodu ve gerekliyse çok kısa net açıklamayı ver: " + gonderilecekSoru,
          stream: true
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.response) {
              setCevap(prev => prev + json.response);
            }
          } catch (e) { 
            
          }
        }
      }
    } catch (err) {
      setCevap("Sistem Hatası: Yapay zeka motoruna ulaşılamıyor. Ollama'nın açık olduğundan emin ol.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="app-container">
      
      {/* 1. HEADER KISMI */}
      <div className="header">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEd5xe4SCj-oTcVLg7qG8vbrFKI36SzAYLFA&s" 
          alt="App Logo" 
          className="app-logo"
        />
        <h1>GhostWriter</h1>
      </div>

      {/* 2. MAIN KISMI (Hero - Cevapların Aktığı Yer) */}
      <div className="main-content">
        {cevap && (
          <div className="ai-response">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ 
                        margin: '15px 0', 
                        borderRadius: '8px',
                        fontSize: '14px',
                        wordBreak: 'break-word', 
                        whiteSpace: 'pre-wrap',  
                        overflowX: 'hidden'      
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {cevap}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* 3. FOOTER KISMI (Soru Sorma Alanı) */}
      <div className="footer">
        <textarea 
          ref={textareaRef}
          className="ask-input"
          value={soru}
          onChange={handleInputYazma}
          placeholder="Yapay zekaya ne kodlatmak istersin?..."
          rows={1}
        />
        <button 
          className="ask-btn" 
          onClick={AI_Sor} 
          disabled={yukleniyor || !soru.trim()}
        >
          {yukleniyor ? 'Düşünüyor...' : 'Gönder'}
        </button>
      </div>

    </div>
  );
}

export default App;