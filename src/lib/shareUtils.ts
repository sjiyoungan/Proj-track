// Utility functions for sharing and syncing data via URL

export function generateShareableUrl(data: any): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const encodedData = encodeURIComponent(JSON.stringify(data));
  return `${baseUrl}?shared=${encodedData}`;
}

export function getSharedDataFromUrl(): any | null {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedData = urlParams.get('shared');
  
  if (sharedData) {
    try {
      // Handle malformed URI by using try-catch for decodeURIComponent
      let decodedData;
      try {
        decodedData = decodeURIComponent(sharedData);
      } catch (uriError) {
        console.error('URI malformed, trying alternative decoding:', uriError);
        // Fallback: try to fix common URI issues
        decodedData = sharedData.replace(/%20/g, ' ').replace(/%22/g, '"');
      }
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Error parsing shared data:', error);
      return null;
    }
  }
  
  return null;
}

export function updateUrlWithData(data: any): void {
  try {
    // Don't update URL if data is too large (URLs have length limits)
    const jsonData = JSON.stringify(data);
    if (jsonData.length > 10000) { // 10KB limit
      console.log('Data too large for URL, skipping URL update');
      return;
    }
    
    const encodedData = encodeURIComponent(jsonData);
    const newUrl = `${window.location.origin}${window.location.pathname}?shared=${encodedData}`;
    
    // Check if URL would be too long
    if (newUrl.length > 2000) {
      console.log('URL too long, skipping URL update');
      return;
    }
    
    window.history.replaceState({}, '', newUrl);
    console.log('URL updated with data');
  } catch (error) {
    console.error('Error updating URL:', error);
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(true);
    } catch (error) {
      document.body.removeChild(textArea);
      return Promise.resolve(false);
    }
  }
}
