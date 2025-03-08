"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface TextDescriptionProps {
  onDescriptionChange: (description: string) => void;
  initialValue?: string;
  isOptional?: boolean;
}

/**
 * TextDescription component for capturing user's design description or preferences
 */
export function TextDescription({
  onDescriptionChange,
  initialValue = "",
  isOptional = true,
}: TextDescriptionProps) {
  const [description, setDescription] = useState(initialValue);
  const [characterCount, setCharacterCount] = useState(0);
  const maxLength = 1000;

  // Update character count when description changes
  useEffect(() => {
    setCharacterCount(description.length);
  }, [description]);

  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Limit to max length
    if (value.length <= maxLength) {
      setDescription(value);
      onDescriptionChange(value);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description" className="text-sm font-medium">
              {isOptional 
                ? "Description (Optional)" 
                : "Design Description"}
            </Label>
            <motion.span
              className={`text-xs ${
                characterCount > maxLength * 0.9
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
              animate={{
                scale: characterCount > maxLength * 0.9 ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {characterCount}/{maxLength}
            </motion.span>
          </div>
          <Textarea
            id="description"
            placeholder={
              isOptional
                ? "Add details about your design or specific requirements (optional)"
                : "Describe your UI design in detail..."
            }
            className="resize-y min-h-[100px]"
            value={description}
            onChange={handleChange}
            aria-describedby="description-hint"
          />
          <p
            id="description-hint"
            className="text-xs text-muted-foreground"
          >
            {isOptional
              ? "Include any specific elements, colors, or styles you want to emphasize or clarify from your image."
              : "Provide a detailed description of your UI design, including layout, colors, components, and any special requirements."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TextDescription;
