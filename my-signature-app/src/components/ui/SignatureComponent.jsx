import React, { useRef, useState, useEffect } from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import SignaturePad from 'react-signature-canvas';

const fontStylesheet = document.createElement('link');
const fontFamily = "'Yellowtail', cursive";
fontStylesheet.href = 'https://fonts.googleapis.com/css2?family=Yellowtail&display=swap';
// const fontFamily = "'Dancing Script', cursive";
//fontStylesheet.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
fontStylesheet.rel = 'stylesheet';
document.head.appendChild(fontStylesheet);

const SignatureComponent = () => {
  const sigPadRef = useRef(null);
  const [typedName, setTypedName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  const handleSignatureChange = () => {
    if (sigPadRef.current) {
      setHasSignature(!sigPadRef.current.isEmpty());
    }
  };

  const clearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setHasSignature(false);
    }
    setTypedName('');
  };

  const renderTypedText = () => {
    if (!typedName.trim()) return;
    
    if (sigPadRef.current) {
      const canvas = sigPadRef.current.getCanvas();
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      // Clear canvas first
      sigPadRef.current.clear();
      
      const fontSize = 72;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = '#000000';
      
      // Center the text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;
      ctx.fillText(typedName, displayWidth / 2, displayHeight / 2);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && sigPadRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = sigPadRef.current.getCanvas();
          const ctx = canvas.getContext('2d');
          
          // Clear canvas first
          sigPadRef.current.clear();
          
          // Calculate scaling to fit the image
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          
          ctx.drawImage(
            img,
            x,
            y,
            img.width * scale,
            img.height * scale
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSignature = () => {
    if (sigPadRef.current) {
      // Get the original canvas
      const originalCanvas = sigPadRef.current.getCanvas();
      
      // Create a temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      // Set the same dimensions
      tempCanvas.width = originalCanvas.width;
      tempCanvas.height = originalCanvas.height;
      
      // Fill with white background
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the signature
      tempCtx.drawImage(originalCanvas, 0, 0);
      
      try {
        // Convert to PNG and download
        const dataUrl = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'signature.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error saving signature:', err);
      }
    }
  };

  useEffect(() => {
    const resizeCanvas = () => {
      if (sigPadRef.current) {
        const canvas = sigPadRef.current.getCanvas();
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set the canvas dimensions accounting for device pixel ratio
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext("2d");
        // Scale the context to account for the device pixel ratio
        ctx.scale(dpr, dpr);
        
        // Set the CSS size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        sigPadRef.current.clear();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    // Small delay to ensure proper initialization
    setTimeout(resizeCanvas, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="min-h-[20vh] flex items-center justify-center p-4 px-0 md:px-0">
      <Card className="w-full md:max-w-xl px-1 md:px-4">
        <CardHeader className="pb-0">
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Type your name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    renderTypedText();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={renderTypedText}
                variant="outline"
                className="whitespace-nowrap"
              >
                Add Text
              </Button>
            </div>

            <div className="border rounded-lg p-0">
              <SignaturePad
                ref={sigPadRef}
                onEnd={handleSignatureChange}
                canvasProps={{
                  className: "border border-gray-300 rounded-lg w-full",
                  style: { 
                    background: '#FFFFFF',
                    touchAction: 'none',
                    height: '200px',
                    display: 'block' // Ensure proper display
                  }
                }}
                options={{
                  dotSize: 2,
                  minWidth: 1,
                  maxWidth: 3,
                  throttle: 16,
                  velocityFilterWeight: 0.7,
                  penColor: 'black'
                }}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={clearSignature}
                variant="outline"
                className="flex-1 h-10"
              >
                Clear
              </Button>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="signature-upload"
                />
                <label
                  htmlFor="signature-upload"
                  className="flex h-10 items-center justify-center gap-2 w-full px-4 border rounded-md bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </label>
              </div>

              <Button
                onClick={saveSignature}
                variant="outline"
                className="flex-1 h-10"
                disabled={!hasSignature && !typedName}
              >
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureComponent;