'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/InputField';
import { GripVertical, Plus, Trash2, Palette, X } from 'lucide-react';
import { KRItem } from '@/types/project';

interface KRModalProps {
  krItems: KRItem[];
  onKRChange: (krItems: KRItem[]) => void;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const predefinedColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export function KRModal({ krItems, onKRChange, children, isOpen: externalIsOpen, onClose }: KRModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fill' | 'text'>('fill');
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onClose ? onClose : setInternalIsOpen;

  // Always use the current krItems from props instead of local state
  const items = krItems;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerOpen && !(event.target as Element).closest('.color-picker-container')) {
        setColorPickerOpen(null);
      }
    };

    if (colorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [colorPickerOpen]);

  // Muted color palette
  const mutedColors = [
    'no-fill', // Special case for no fill
    '#000000', // Black
    '#FFFFFF', // White
    '#808080', // Lighter dark grey
    '#A0A0A0', // Medium grey (between dark and light)
    '#f3f4f6', // Not started color (gray-100)
    '#F0E6D2', // Lighter dusty red
    '#E6F0D2', // Lighter dusty green
    '#D2E6F0', // Lighter dusty blue
    '#F0D2E6', // Lighter dusty pink
    '#E6D2F0', // Lighter dusty purple
    '#D2F0E6'  // Light muted teal
  ];

  const addNewItem = () => {
    const newItem: KRItem = {
      id: `kr-${krItems.length + 1}`,
      text: '',
      fillColor: '#f3f4f6',
      textColor: '#000000',
      order: krItems.length
    };
    const newItems = [...krItems, newItem];
    onKRChange(newItems);
  };

  const updateItem = (id: string, updates: Partial<KRItem>) => {
    const newItems = krItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ).filter(item => item.text.trim() !== ''); // Remove empty items
    
    // Update local color state based on active tab
    if (updates.fillColor !== undefined) {
      setFillColor(updates.fillColor);
    }
    if (updates.textColor !== undefined) {
      setTextColor(updates.textColor);
    }
    
    onKRChange(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = krItems.filter(item => item.id !== id);
    onKRChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...krItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Update order
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    onKRChange(updatedItems);
  };

  const getTextColor = (backgroundColor: string) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <div onClick={() => setInternalIsOpen(true)}>
          {children}
        </div>
      )}
      
      {isOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-6 border bg-background p-6 shadow-lg rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold leading-none tracking-tight">Manage KRs</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                    </div>
                    
                    {/* Color Picker */}
                    <div className="relative color-picker-container">
                      <button
                        onClick={() => {
                          if (colorPickerOpen === item.id) {
                            setColorPickerOpen(null);
                          } else {
                            // Initialize colors from the item when opening
                            setFillColor(item.fillColor || '#f3f4f6');
                            setTextColor(item.textColor || '#000000');
                            setColorPickerOpen(item.id);
                          }
                        }}
                        className="w-8 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-colors bg-transparent flex items-center justify-center"
                        style={{ 
                          height: '32px',
                          paddingTop: '2px',
                          paddingBottom: '2px',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          boxSizing: 'border-box'
                        }}
                      >
                        <Palette className="h-3 w-3 text-slate-500 hover:text-slate-700" />
                      </button>
                      
                      {colorPickerOpen === item.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-3 w-fit relative">
                          {/* Visual Preview */}
                          <div className="absolute top-2 right-2 flex items-end h-8">
                            <div className="h-7 px-3 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-medium"
                                 style={{ 
                                   backgroundColor: fillColor === 'no-fill' ? '#f3f4f6' : fillColor,
                                   color: textColor,
                                   width: 'fit-content',
                                   border: (fillColor === '#FFFFFF' || fillColor === '#ffffff' || fillColor === '#FFF' || fillColor === '#fff') ? '1px solid #E5E5E5' : undefined
                                 }}>
                              Example
                            </div>
                          </div>
                          
                          {/* Tabs */}
                          <div className="flex mb-6 h-8 items-center">
                            <button
                              onClick={() => setActiveTab('fill')}
                              className={`px-2 py-1 text-xs mr-1 h-8 flex items-center border-b-2 ${
                                activeTab === 'fill' 
                                  ? 'border-black text-black' 
                                  : 'border-transparent text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Fill
                            </button>
                            <button
                              onClick={() => setActiveTab('text')}
                              className={`px-2 py-1 text-xs h-8 flex items-center border-b-2 ${
                                activeTab === 'text' 
                                  ? 'border-black text-black' 
                                  : 'border-transparent text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Text
                            </button>
                          </div>
                          
                          {/* Hex Input */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">Color:</span>
                              <input
                                type="text"
                                value={activeTab === 'fill' ? (fillColor === 'no-fill' ? '#f3f4f6' : fillColor) : textColor}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                    if (activeTab === 'fill') {
                                      updateItem(item.id, { fillColor: hex });
                                    } else {
                                      updateItem(item.id, { textColor: hex });
                                    }
                                  }
                                }}
                                className="w-20 h-6 px-2 text-xs border border-slate-200 dark:border-slate-700 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                          
                          {/* Quick Colors */}
                          <div className="grid grid-cols-6 gap-2">
                            {mutedColors.map((color) => {
                              const currentColor = activeTab === 'fill' ? fillColor : textColor;
                              const isSelected = color === currentColor;
                              const isBlack = color === '#000000';
                              
                              return (
                                <button
                                  key={color}
                                  onClick={() => {
                                    if (activeTab === 'fill') {
                                      // For fill color, convert 'no-fill' to default color
                                      updateItem(item.id, { fillColor: color === 'no-fill' ? '#f3f4f6' : color });
                                    } else {
                                      // For text color, ensure it's not 'no-fill'
                                      updateItem(item.id, { textColor: color === 'no-fill' ? '#000000' : color });
                                    }
                                  }}
                                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                  style={{ 
                                    backgroundColor: color === 'no-fill' ? 'transparent' : color,
                                    backgroundImage: color === 'no-fill' ? 'linear-gradient(45deg, transparent 48%, #ff0000 48%, #ff0000 52%, transparent 52%)' : undefined,
                                    border: isSelected ? (isBlack ? '1px solid #808080' : '1px solid #000000') : '1px solid #E5E7EB'
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Text Input */}
                    <InputField
                      value={item.text}
                      onChange={(value) => updateItem(item.id, { text: value })}
                      placeholder="Enter KR..."
                      className="flex-1"
                      width="fill"
                    />
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-slate-400 hover:text-slate-400 hover:bg-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:border rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Add New Item Button */}
              <div className={`flex ${items.length === 0 ? 'justify-center' : 'justify-end'}`}>
                <Button
                  variant={items.length === 0 ? "ghost" : "outline"}
                  onClick={addNewItem}
                  className={`w-auto ${items.length === 0 ? 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400' : ''}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add KR
                </Button>
              </div>
              
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
