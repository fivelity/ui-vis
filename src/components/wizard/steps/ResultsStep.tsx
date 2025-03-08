"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImmersiveCard } from '@/components/3d/ImmersiveCard';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Copy, Check, FileCode, ExternalLink, Archive } from 'lucide-react';
import { StaggerItem } from '@/components/animation/MotionSection';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useUIStore } from '@/lib/store';

interface ResultsStepProps {
  generatedFiles: any[];
  projectName: string;
}

export function ResultsStep({ generatedFiles, projectName }: ResultsStepProps) {
  const isDarkMode = useUIStore(state => state.isDarkMode);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Toggle file selection
  const toggleFileSelection = (filename: string) => {
    setSelectedFiles(prev => 
      prev.includes(filename)
        ? prev.filter(name => name !== filename)
        : [...prev, filename]
    );
  };
  
  // Select or deselect all files
  const toggleSelectAll = () => {
    if (selectedFiles.length === generatedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(generatedFiles.map(file => file.name || 'unnamed-file'));
    }
  };
  
  // Copy file content to clipboard
  const copyFileContent = () => {
    if (generatedFiles[activeFileIndex]?.content) {
      navigator.clipboard.writeText(generatedFiles[activeFileIndex].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Determine file language for syntax highlighting
  const getFileLanguage = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'jsx';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'tsx';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };
  
  return (
    <div className="space-y-6">
      <StaggerItem>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Project: {projectName || 'UI Project'}</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1">
              <Archive className="h-4 w-4" />
              <span>Download ZIP</span>
            </Button>
            <Button size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" />
              <span>Open Project</span>
            </Button>
          </div>
        </div>
      </StaggerItem>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <StaggerItem>
            <Card>
              <CardContent className="p-0">
                <div className="p-3 bg-muted font-medium text-sm flex items-center justify-between">
                  <span>Project Files ({generatedFiles.length})</span>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="select-all" 
                      checked={selectedFiles.length === generatedFiles.length && generatedFiles.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-xs cursor-pointer">
                      Select All
                    </Label>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto divide-y">
                  {generatedFiles.map((file, index) => {
                    const filename = file.name || `file-${index}.txt`;
                    const isSelected = selectedFiles.includes(filename);
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                          activeFileIndex === index ? 'bg-accent' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setActiveFileIndex(index)}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleFileSelection(filename)}
                          onClick={(e) => e.stopPropagation()}
                          className="data-[state=checked]:bg-primary"
                        />
                        
                        <FileCode className="h-5 w-5 text-primary" />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          
          <StaggerItem>
            <div className="bg-muted/40 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Project Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background rounded p-3">
                  <p className="text-xs text-muted-foreground">Total Files</p>
                  <p className="text-lg font-bold">{generatedFiles.length}</p>
                </div>
                <div className="bg-background rounded p-3">
                  <p className="text-xs text-muted-foreground">Total Size</p>
                  <p className="text-lg font-bold">
                    {Math.round(generatedFiles.reduce((acc, file) => acc + (file.size || 0), 0) / 1024)} KB
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>
        </div>
        
        <StaggerItem className="md:col-span-2">
          <ImmersiveCard
            depth={0.03}
            intensity={0.3}
            className="h-[500px]"
          >
            <Tabs defaultValue="code" className="h-full flex flex-col">
              <div className="border-b px-4">
                <TabsList className="justify-start h-12">
                  <TabsTrigger value="code" className="data-[state=active]:bg-muted">
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-muted">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="code" className="flex-1 p-0 m-0 relative overflow-hidden">
                {generatedFiles.length > 0 && (
                  <>
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={copyFileContent}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                        <span className="ml-1">Download</span>
                      </Button>
                    </div>
                    
                    <div className="w-full h-full overflow-auto p-4 pt-12">
                      <SyntaxHighlighter
                        language={getFileLanguage(generatedFiles[activeFileIndex].name || '')}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          backgroundColor: isDarkMode ? '#1E1E1E' : '#F8F8F8',
                        }}
                        wrapLines
                        wrapLongLines
                        showLineNumbers
                      >
                        {generatedFiles[activeFileIndex].content || '// No content available'}
                      </SyntaxHighlighter>
                    </div>
                  </>
                )}
                
                {generatedFiles.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No files to display
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 p-0 m-0 overflow-hidden flex items-center justify-center bg-[#f0f0f0] dark:bg-[#121212]">
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Preview not available for this file type
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </ImmersiveCard>
        </StaggerItem>
      </div>
      
      <StaggerItem>
        <motion.div 
          className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-medium mb-2">Next Steps</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Download your project files or open in the editor</li>
            <li>Review the generated code and make any necessary adjustments</li>
            <li>Deploy your project or continue developing locally</li>
            <li>Save this project to your account for future reference</li>
          </ul>
        </motion.div>
      </StaggerItem>
    </div>
  );
}

export default ResultsStep;
