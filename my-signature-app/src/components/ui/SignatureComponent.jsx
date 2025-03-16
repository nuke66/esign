import React, { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Add Dancing Script font
const fontFamily = "'Dancing Script', cursive";
const fontStylesheet = document.createElement('link');
fontStylesheet.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap';
fontStylesheet.rel = 'stylesheet';
document.head.appendChild(fontStylesheet);

const SignatureComponent = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [signature, setSignature] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [typedName, setTypedName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    setCtx(context);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const renderTypedText = () => {
    if (!typedName.trim()) return;
    
    const canvas = canvasRef.current;
    const fontSize = 48; // Adjust this value to change text size
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#000000';
    
    // Center the text horizontally and vertically
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
    
    setSignature(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
    setUploadedImage(null);
    setTypedName('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate scaling to fit the image within canvas
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
          setSignature(canvas.toDataURL());
          setUploadedImage(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Electronic Signature</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="Type your name"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={renderTypedText}
              variant="secondary"
            >
              Add Text
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="border border-gray-300 rounded-lg w-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={clearCanvas}
              variant="outline"
              className="w-full"
            >
              Clear
            </Button>
            
            <div className="relative w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="signature-upload"
              />
              <label
                htmlFor="signature-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Upload Signature
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignatureComponent;