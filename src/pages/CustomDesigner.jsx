import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as fabric from 'fabric'; // Cambio importante aquí
import { useCart } from '../utils/useCart';
import axios from '../utils/axios';
import './CustomDesigner.css';

const CustomDesigner = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Cambiar addItem por addToCart
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  
  // Estado del diseño
  const [selectedColor, setSelectedColor] = useState('white'); // white / black
  const [uploadedImage, setUploadedImage] = useState(null);
  const [designImage, setDesignImage] = useState(null); // Objeto Fabric
  const [saving, setSaving] = useState(false);
  
  // Precios - AJUSTAR SEGÚN TU NEGOCIO
  const PRECIO_BASE = 12000; // Precio de la remera base
  const PRECIO_ESTAMPADO = 3500; // Costo adicional del estampado
  const precioTotal = PRECIO_BASE + PRECIO_ESTAMPADO;

  // Inicializar canvas
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: 'transparent'
    });
    
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Manejar subida de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy pesada. Máximo 5MB.');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor subí una imagen válida.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      
      // Crear imagen en canvas
      fabric.FabricImage.fromURL(event.target.result).then((img) => {
        // Si ya hay una imagen, removerla
        if (designImage) {
          canvas.remove(designImage);
        }

        // Escalar imagen para que quepa bien
        const maxWidth = 300;
        const maxHeight = 350;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        
        img.scale(scale);
        img.set({
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerSize: 12,
          transparentCorners: false,
          cornerColor: '#3498db',
          borderColor: '#3498db'
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        setDesignImage(img);
      });
    };
    
    reader.readAsDataURL(file);
  };

  // Eliminar diseño
  const handleRemoveDesign = () => {
    if (designImage && canvas) {
      canvas.remove(designImage);
      setDesignImage(null);
      setUploadedImage(null);
      canvas.renderAll();
    }
  };

  // Rotar imagen
  const handleRotate = () => {
    if (designImage) {
      const currentAngle = designImage.angle || 0;
      designImage.rotate(currentAngle + 90);
      canvas.renderAll();
    }
  };

  // Centrar imagen
  const handleCenter = () => {
    if (designImage) {
      canvas.centerObject(designImage);
      canvas.renderAll();
    }
  };

  // Guardar y agregar al carrito
  const handleSaveDesign = async () => {
    if (!designImage) {
      alert('Por favor subí un diseño primero.');
      return;
    }

    setSaving(true);

    try {
      // Obtener imagen del canvas como base64
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 0.8
      });

      // Subir a Cloudinary
      const formData = new FormData();
      
      // Convertir base64 a blob
      const blob = await fetch(dataURL).then(r => r.blob());
      formData.append('images', blob, 'diseno-custom.png');

      const { data } = await axios.post('/products/upload-custom-design', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = data.url;

      // Crear objeto de producto personalizado
      const customProduct = {
        _id: `custom-${Date.now()}`, // ID único temporal
        nombre: `Remera ${selectedColor === 'white' ? 'Blanca' : 'Negra'} Personalizada`,
        descripcion: 'Remera con diseño personalizado',
        precio: precioTotal,
        imagenes: [{ url: imageUrl }],
        categoria: { nombre: 'Personalizado' },
        esPersonalizado: true,
        disenoCustom: {
          imagenCliente: imageUrl,
          colorRemera: selectedColor,
          canvas: canvas.toJSON() // Guardar estado del canvas por si se quiere editar
        },
        talles: [{ talle: 'M', stock: 999 }] // Stock "infinito" para custom
      };

      // Agregar al carrito
      addToCart(customProduct, 'M', 1);

      // Redirigir al carrito
      navigate('/carrito');
      
    } catch (error) {
      console.error('Error al guardar diseño:', error);
      alert('Error al guardar el diseño. Intentá de nuevo.');
      setSaving(false);
    }
  };

  return (
    <div className="custom-designer-page">
      <div className="designer-container">
        {/* Header */}
        <div className="designer-header">
          <h1>🎨 Diseñá Tu Prenda</h1>
          <p>Elegí el color de la remera, subí tu diseño y llevátela única</p>
        </div>

        <div className="designer-content">
          {/* Panel izquierdo - Controles */}
          <div className="designer-controls">
            {/* Selector de color */}
            <div className="control-section">
              <h3>1. Elegí el Color</h3>
              <div className="color-selector">
                <button
                  className={`color-btn white ${selectedColor === 'white' ? 'active' : ''}`}
                  onClick={() => setSelectedColor('white')}
                >
                  <div className="color-preview white"></div>
                  <span>Blanca</span>
                </button>
                <button
                  className={`color-btn black ${selectedColor === 'black' ? 'active' : ''}`}
                  onClick={() => setSelectedColor('black')}
                >
                  <div className="color-preview black"></div>
                  <span>Negra</span>
                </button>
              </div>
            </div>

            {/* Subir diseño */}
            <div className="control-section">
              <h3>2. Subí Tu Diseño</h3>
              <div className="upload-section">
                <input
                  type="file"
                  id="design-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <label htmlFor="design-upload" className="upload-btn">
                  📁 Elegir Imagen
                </label>
                <p className="upload-help">
                  Formatos: JPG, PNG, SVG (Máx 5MB)
                </p>
              </div>
            </div>

            {/* Herramientas de edición */}
            {designImage && (
              <div className="control-section">
                <h3>3. Ajustá el Diseño</h3>
                <div className="tools-section">
                  <button onClick={handleCenter} className="tool-btn">
                    📍 Centrar
                  </button>
                  <button onClick={handleRotate} className="tool-btn">
                    🔄 Rotar
                  </button>
                  <button onClick={handleRemoveDesign} className="tool-btn danger">
                    🗑️ Eliminar
                  </button>
                </div>
                <p className="tools-help">
                  💡 Podés mover, agrandar y rotar el diseño arrastrándolo
                </p>
              </div>
            )}

            {/* Precio */}
            <div className="price-section">
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Remera base:</span>
                  <span>${PRECIO_BASE}</span>
                </div>
                <div className="price-item">
                  <span>Estampado:</span>
                  <span>${PRECIO_ESTAMPADO}</span>
                </div>
                <div className="price-total">
                  <span>Total:</span>
                  <span>${precioTotal}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="action-buttons">
              <button 
                onClick={() => navigate('/')} 
                className="btn-secondary"
              >
                ← Volver
              </button>
              <button 
                onClick={handleSaveDesign}
                disabled={!designImage || saving}
                className="btn-primary"
              >
                {saving ? 'Guardando...' : '🛒 Agregar al Carrito'}
              </button>
            </div>
          </div>

          {/* Panel derecho - Preview */}
          <div className="designer-preview">
            <div className="preview-container">
              <h3>Preview de Tu Remera</h3>
              
              <div className={`tshirt-mockup ${selectedColor}`}>
                {/* Imagen de remera de fondo */}
                <div className="tshirt-base">
                  <img 
                    src={selectedColor === 'white' 
                      ? '/remera-blanca.jpg' 
                      : '/remera-negra.jpg'
                    } 
                    alt="Remera"
                    className="tshirt-img"
                  />
                </div>
                
                {/* Canvas para el diseño */}
                <div className="design-area">
                  <canvas ref={canvasRef} />
                </div>
              </div>

              {!uploadedImage && (
                <div className="preview-placeholder">
                  <p>👆 Subí una imagen para ver el preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDesigner;