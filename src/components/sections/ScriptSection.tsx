'use client';

import React from 'react';
import { useEffect } from 'react';

interface ScriptSectionProps {
  scriptData?: {
    id: number;
    name: string;
    description?: string;
    scriptType: string;
    scriptContent: string;
    placement: string;
    isActive: boolean;
    loadAsync: boolean;
    loadDefer: boolean;
    priority: number;
  };
  placement?: string; // Filter scripts by placement
  className?: string;
}

export default function ScriptSection({ 
  scriptData, 
  placement = 'footer',
  className = '' 
}: ScriptSectionProps) {
  useEffect(() => {
    if (!scriptData || !scriptData.isActive) {
      return;
    }

    // Only render scripts that match the specified placement
    if (scriptData.placement !== placement) {
      return;
    }

    // Create a script element and inject it into the DOM
    const scriptElement = document.createElement('div');
    scriptElement.innerHTML = scriptData.scriptContent;
    
    // Find the target container based on placement
    let targetContainer: HTMLElement | null = null;
    
    switch (placement) {
      case 'header':
        targetContainer = document.head;
        break;
      case 'footer':
        targetContainer = document.body;
        break;
      case 'body-start':
        targetContainer = document.body;
        break;
      case 'body-end':
        targetContainer = document.body;
        break;
      default:
        targetContainer = document.body;
    }

    if (targetContainer) {
      // Extract script tags and execute them properly
      const scripts = scriptElement.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Set async/defer attributes if specified
        if (scriptData.loadAsync) {
          newScript.async = true;
        }
        if (scriptData.loadDefer) {
          newScript.defer = true;
        }
        
        // Copy content
        newScript.textContent = oldScript.textContent;
        
        // Append to target container
        if (placement === 'body-start') {
          targetContainer.insertBefore(newScript, targetContainer.firstChild);
        } else {
          targetContainer.appendChild(newScript);
        }
      });

      // Also append any non-script content (like style tags, etc.)
      const nonScriptElements = scriptElement.querySelectorAll(':not(script)');
      nonScriptElements.forEach(element => {
        if (placement === 'body-start') {
          targetContainer.insertBefore(element.cloneNode(true), targetContainer.firstChild);
        } else {
          targetContainer.appendChild(element.cloneNode(true));
        }
      });
    }

    // Cleanup function to remove scripts when component unmounts
    return () => {
      // Note: Removing dynamically added scripts is complex and may not always work
      // as expected, especially for tracking scripts that have already executed
    };
  }, [scriptData, placement]);

  // This component doesn't render anything visible
  // It only injects scripts into the DOM
  return null;
}

// Helper component to render multiple scripts for a specific placement
interface ScriptRendererProps {
  scripts: ScriptSectionProps['scriptData'][];
  placement: string;
  className?: string;
}

export function ScriptRenderer({ scripts, placement, className }: ScriptRendererProps) {
  if (!scripts || scripts.length === 0) {
    return null;
  }

  // Filter and sort scripts by priority and placement
  const filteredScripts = scripts
    .filter(script => script && script.isActive && script.placement === placement)
    .sort((a, b) => (a?.priority || 0) - (b?.priority || 0));

  return (
    <div className={className}>
      {filteredScripts.map((script) => (
        script && (
          <ScriptSection
            key={script.id}
            scriptData={script}
            placement={placement}
          />
        )
      ))}
    </div>
  );
} 