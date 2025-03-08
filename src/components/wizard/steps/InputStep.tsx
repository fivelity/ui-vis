"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropZone } from '@/components/upload/DropZone';
import { DesignInput } from '@/lib/types';
import { Upload, Pencil } from 'lucide-react';
import { StaggerItem } from '@/components/animation/MotionSection';

interface InputStepProps {
  input: DesignInput | null;
  setInput: (input: DesignInput) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  projectDescription: string;
  setProjectDescription: (desc: string) => void;
}

export function InputStep({
  input,
  setInput,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription
}: InputStepProps) {
  const [activeTab, setActiveTab] = useState<string>(input?.type === 'text' ? 'text' : 'image');

  // Handle image file upload
  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setInput({
            type: 'image',
            content: e.target.result as string,
            filename: files[0].name
          });
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Handle text input
  const handleTextInput = (text: string) => {
    if (text.trim()) {
      setInput({
        type: 'text',
        content: text
      });
    }
  };

  return (
    <div className="space-y-6">
      <StaggerItem>
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="space-y-2">
          <Label htmlFor="project-description">Project Description (Optional)</Label>
          <Textarea
            id="project-description"
            placeholder="Enter a brief description of your project"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="resize-none h-20"
          />
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className="space-y-2">
          <Label>Design Input</Label>
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Image Upload
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Text Description
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-4">
              <DropZone
                onFilesAccepted={handleImageUpload}
                maxFiles={1}
                maxSize={3 * 1024 * 1024} // 3MB
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.webp']
                }}
                className="min-h-[200px]"
              />

              {input?.type === 'image' && (
                <motion.div 
                  className="mt-4 p-2 rounded-md border bg-muted/50 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-muted-foreground">
                    Image will be analyzed for UI components and layout
                  </p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder="Describe the UI design in detail. Include information about layout, components, colors, and functionality."
                className="min-h-[200px] resize-none"
                value={input?.type === 'text' ? input.content : ''}
                onChange={(e) => handleTextInput(e.target.value)}
              />

              {input?.type === 'text' && (
                <motion.div 
                  className="mt-4 p-2 rounded-md border bg-muted/50 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-muted-foreground">
                    Your description will be used to generate a UI design
                  </p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </StaggerItem>
    </div>
  );
}

export default InputStep;
