'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Plus, Edit, Edit2, Edit3, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/InputField';

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

interface LinkManagerProps {
  figmaLink: string;
  prdLink: string;
  customLinks: CustomLink[];
  onFigmaChange: (value: string) => void;
  onPRDChange: (value: string) => void;
  onCustomLinksChange: (links: CustomLink[]) => void;
}

export function LinkManager({ 
  figmaLink, 
  prdLink, 
  customLinks = [],
  onFigmaChange, 
  onPRDChange,
  onCustomLinksChange 
}: LinkManagerProps) {
  const [figmaDropdownOpen, setFigmaDropdownOpen] = useState(false);
  const [prdDropdownOpen, setPrdDropdownOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingCustomLink, setEditingCustomLink] = useState<CustomLink | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  
  const figmaRef = useRef<HTMLDivElement>(null);
  const prdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (figmaRef.current && !figmaRef.current.contains(event.target as Node)) {
        setFigmaDropdownOpen(false);
      }
      if (prdRef.current && !prdRef.current.contains(event.target as Node)) {
        setPrdDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [originalLabel, setOriginalLabel] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');

  const openCustomModal = (link?: CustomLink) => {
    if (link) {
      setEditingCustomLink(link);
      setCustomLabel(link.label);
      setCustomUrl(link.url);
      setOriginalLabel(link.label);
      setOriginalUrl(link.url);
    } else {
      setEditingCustomLink(null);
      setCustomLabel('');
      setCustomUrl('');
      setOriginalLabel('');
      setOriginalUrl('');
    }
    setCustomModalOpen(true);
  };

  const saveCustomLink = () => {
    if (!customLabel || !customUrl) return;

    if (editingCustomLink) {
      // Update existing link
      onCustomLinksChange(
        customLinks.map(link => 
          link.id === editingCustomLink.id 
            ? { ...link, label: customLabel, url: customUrl }
            : link
        )
      );
    } else {
      // Add new link
      const newLink: CustomLink = {
        id: `custom-${Date.now()}`,
        label: customLabel,
        url: customUrl
      };
      onCustomLinksChange([...customLinks, newLink]);
    }

    setCustomModalOpen(false);
    setCustomLabel('');
    setCustomUrl('');
    setEditingCustomLink(null);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const confirmDelete = (linkId: string) => {
    setLinkToDelete(linkId);
    setShowDeleteConfirm(true);
  };

  const deleteCustomLink = () => {
    if (linkToDelete) {
      onCustomLinksChange(customLinks.filter(link => link.id !== linkToDelete));
      setShowDeleteConfirm(false);
      setLinkToDelete(null);
      setCustomModalOpen(false);
    }
  };

  const LinkRow = ({ 
    label, 
    url, 
    isOpen, 
    setIsOpen, 
    onUrlChange, 
    dropdownRef,
    showDelete = false,
    onDelete
  }: { 
    label: string;
    url: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onUrlChange: (value: string) => void;
    dropdownRef: React.RefObject<HTMLDivElement>;
    showDelete?: boolean;
    onDelete?: () => void;
  }) => {
  const [tempUrl, setTempUrl] = useState(url);

  const handleSave = () => {
    onUrlChange(tempUrl);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempUrl(url);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  useEffect(() => {
    setTempUrl(url);
  }, [url, isOpen]);

  return (
    <div ref={dropdownRef} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md transition-all" style={{ height: '34px' }}>
      {!isOpen && !url && (
        <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap" style={{ fontSize: '12px' }}>
          {label}
        </span>
      )}
      
      {isOpen ? (
        <>
          <input
            type="text"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleCancel}
            placeholder="https://..."
            autoFocus
            className="flex-1 px-2 py-0.5 text-sm border-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent blur from firing
              handleSave();
            }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Check className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </>
      ) : (
        <>
          {url ? (
            <div className="flex items-center gap-0">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1 px-2 -ml-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                style={{ height: '22px' }}
              >
                <span className="font-medium text-slate-700 dark:text-slate-300" style={{ fontSize: '12px' }}>
                  {label}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              </a>
              <button
                onClick={() => setIsOpen(true)}
                className="p-1 pr-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="p-1 pr-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              style={{ height: '22px' }}
            >
              <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Add Custom Link button - moved to the left */}
        <button
          onClick={() => openCustomModal()}
          className="flex items-center justify-center px-2 py-1.5 border border-transparent rounded-md text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          style={{ height: '34px' }}
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Custom links - displayed to the left of Figma/PRD */}
        {customLinks.map((link) => (
        <div key={link.id} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md" style={{ height: '34px' }}>
          <div className="flex items-center gap-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-1 px-2 -ml-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              style={{ height: '22px' }}
            >
              <span className="font-medium text-slate-700 dark:text-slate-300" style={{ fontSize: '12px' }}>
                {link.label}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </a>
            <button
              onClick={() => openCustomModal(link)}
              className="p-1 pr-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>
        ))}

        <LinkRow
          label="Figma"
          url={figmaLink}
          isOpen={figmaDropdownOpen}
          setIsOpen={setFigmaDropdownOpen}
          onUrlChange={onFigmaChange}
          dropdownRef={figmaRef}
        />

        <LinkRow
          label="PRD"
          url={prdLink}
          isOpen={prdDropdownOpen}
          setIsOpen={setPrdDropdownOpen}
          onUrlChange={onPRDChange}
          dropdownRef={prdRef}
        />
      </div>

      {/* Custom Link Modal */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md pt-6 px-6 pb-0">
            {showDeleteConfirm ? (
              <>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Delete Link
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 pb-1">
                  Are you sure you want to delete this link? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pb-6">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    size="sm"
                    className="border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={deleteCustomLink}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <>
            <div className="space-y-3">
              <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                <InputField
                  value={customLabel}
                  onChange={setCustomLabel}
                  placeholder="Label"
                  width="fill"
                />
              </div>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                <InputField
                  value={customUrl}
                  onChange={setCustomUrl}
                  placeholder="Link"
                  width="fill"
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 mt-6 pb-6">
              {editingCustomLink && (
                <button
                  onClick={() => confirmDelete(editingCustomLink.id)}
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </button>
              )}
              <div className={`flex ${editingCustomLink ? 'ml-auto' : 'w-full justify-end'} gap-2`}>
              <Button
                onClick={() => {
                  setCustomModalOpen(false);
                  setCustomLabel('');
                  setCustomUrl('');
                  setEditingCustomLink(null);
                }}
                variant="outline"
                size="sm"
                className="border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCustomLink}
                size="sm"
                disabled={!customLabel || !customUrl || (editingCustomLink !== null && customLabel === originalLabel && customUrl === originalUrl)}
                className={`min-w-[73px] ${
                  !customLabel || !customUrl || (editingCustomLink !== null && customLabel === originalLabel && customUrl === originalUrl)
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 cursor-not-allowed'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 border border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-200'
                }`}
              >
                Save
              </Button>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

