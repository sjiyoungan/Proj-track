'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2, Palette } from 'lucide-react';
import { OKRItem } from '@/types/project';

interface OKRModalProps {
  okrItems: OKRItem[];
  onOKRChange: (okrItems: OKRItem[]) => void;
  children: React.ReactNode;
}

const predefinedColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export function OKRModal({ okrItems, onOKRChange, children }: OKRModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<OKRItem[]>(okrItems);

  const addNewItem = () => {
    const newItem: OKRItem = {
      id: `okr-${Date.now()}`,
      text: '',
      color: predefinedColors[0],
      order: items.length
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    onOKRChange(newItems);
  };

  const updateItem = (id: string, updates: Partial<OKRItem>) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ).filter(item => item.text.trim() !== ''); // Remove empty items
    
    setItems(newItems);
    onOKRChange(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    onOKRChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    
    // Update order
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setItems(updatedItems);
    onOKRChange(updatedItems);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage OKRs</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                </div>
                
                {/* Color Picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={item.color}
                    onChange={(e) => updateItem(item.id, { color: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <Palette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white pointer-events-none" />
                </div>
                
                {/* Text Input */}
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  placeholder="Enter OKR..."
                  className="flex-1"
                />
                
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Add New Item Button */}
          <Button
            variant="outline"
            onClick={addNewItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another OKR
          </Button>
          
          {/* Color Palette */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Color Palette:</label>
            <div className="flex gap-2 flex-wrap">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    if (items.length > 0) {
                      const lastItem = items[items.length - 1];
                      updateItem(lastItem.id, { color });
                    }
                  }}
                  className="w-8 h-8 rounded border border-slate-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
