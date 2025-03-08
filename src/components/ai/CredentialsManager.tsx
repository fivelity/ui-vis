"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Key, AlertTriangle, CheckCircle, Save } from "lucide-react";
import { AIModelConfig } from "@/lib/types";

interface Credentials {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
}

// Initial credentials state with default values for local providers
const defaultCredentials: Credentials[] = [
  { provider: "openai", apiKey: "", baseUrl: "https://api.openai.com/v1" },
  { provider: "togetherai", apiKey: "", baseUrl: "https://api.together.xyz" },
  { provider: "lmstudio", apiKey: "lm-studio", baseUrl: "http://localhost:1234/v1" },
  { provider: "ollama", apiKey: "", baseUrl: "http://localhost:11434" },
];

interface CredentialsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: Credentials[]) => void;
  currentProvider?: string;
}

export function CredentialsManager({
  isOpen,
  onClose,
  onSave,
  currentProvider,
}: CredentialsManagerProps) {
  const [credentials, setCredentials] = useState<Credentials[]>(defaultCredentials);
  const [activeTab, setActiveTab] = useState<string>(currentProvider || "openai");
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  
  // Load credentials from localStorage on component mount
  useEffect(() => {
    const storedCredentials = localStorage.getItem("ai-credentials");
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials);
        // Merge with default credentials to ensure all providers are present
        const merged = defaultCredentials.map(defaultCred => {
          const stored = parsed.find((c: Credentials) => c.provider === defaultCred.provider);
          return stored ? { ...defaultCred, ...stored } : defaultCred;
        });
        setCredentials(merged);
      } catch (error) {
        console.error("Failed to parse stored credentials:", error);
      }
    }
  }, []);

  // Set active tab to current provider when changed
  useEffect(() => {
    if (currentProvider) {
      setActiveTab(currentProvider);
    }
  }, [currentProvider]);

  const handleCredentialChange = (provider: string, field: "apiKey" | "baseUrl", value: string) => {
    setCredentials(prev => prev.map(cred => 
      cred.provider === provider ? { ...cred, [field]: value } : cred
    ));
  };

  const handleSave = () => {
    try {
      // Save to localStorage (encrypt in production)
      localStorage.setItem("ai-credentials", JSON.stringify(credentials));
      
      // Notify parent component
      onSave(credentials);
      
      // Show success message
      setSaveMessage({
        type: "success",
        message: "Credentials saved successfully"
      });
      
      // Clear message after delay
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to save credentials:", error);
      setSaveMessage({
        type: "error",
        message: "Failed to save credentials"
      });
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={backdropVariants}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-labelledby="credentials-title"
        >
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 id="credentials-title" className="text-lg font-semibold flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>AI Provider Credentials</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs for different providers */}
          <div className="border-b dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {credentials.map((cred) => (
                <button
                  key={cred.provider}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap
                            ${activeTab === cred.provider 
                              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  onClick={() => setActiveTab(cred.provider)}
                >
                  {cred.provider.charAt(0).toUpperCase() + cred.provider.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Active provider settings */}
          <div className="p-4">
            {credentials.map((cred) => (
              <div
                key={cred.provider}
                className={activeTab === cred.provider ? 'block' : 'hidden'}
              >
                <div className="space-y-4">
                  {/* Info for local providers */}
                  {(cred.provider === "lmstudio" || cred.provider === "ollama") && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-800 dark:text-blue-300">
                        {cred.provider === "lmstudio" 
                          ? "LM Studio is a local provider. Make sure LM Studio is running and serving API requests." 
                          : "Ollama is a local provider. Make sure Ollama is running and the model is downloaded."}
                      </p>
                    </div>
                  )}

                  {/* API Key */}
                  <div>
                    <label
                      htmlFor={`${cred.provider}-api-key`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      API Key {(cred.provider === "lmstudio" || cred.provider === "ollama") && "(Optional)"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Key className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        id={`${cred.provider}-api-key`}
                        type="password"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 
                                  rounded-md shadow-sm text-sm
                                  bg-white dark:bg-gray-800 
                                  focus:ring-blue-500 focus:border-blue-500"
                        value={cred.apiKey || ''}
                        onChange={(e) => handleCredentialChange(cred.provider, "apiKey", e.target.value)}
                        placeholder={`${cred.provider.toUpperCase()} API Key`}
                      />
                    </div>
                  </div>

                  {/* Base URL */}
                  <div>
                    <label
                      htmlFor={`${cred.provider}-base-url`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Base URL
                    </label>
                    <input
                      id={`${cred.provider}-base-url`}
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                rounded-md shadow-sm text-sm
                                bg-white dark:bg-gray-800 
                                focus:ring-blue-500 focus:border-blue-500"
                      value={cred.baseUrl || ''}
                      onChange={(e) => handleCredentialChange(cred.provider, "baseUrl", e.target.value)}
                      placeholder="https://api.example.com"
                    />
                  </div>

                  {/* Provider-specific notes */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {cred.provider === "openai" && (
                      <p>OpenAI API key can be found in your <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI dashboard</a>.</p>
                    )}
                    {cred.provider === "togetherai" && (
                      <p>Together AI API key can be found in your <a href="https://api.together.xyz/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Together AI dashboard</a>.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Save button and message */}
            <div className="flex items-center justify-between mt-6">
              <AnimatePresence>
                {saveMessage && (
                  <motion.div
                    className={`text-sm flex items-center ${saveMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {saveMessage.type === "success" ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-1" />
                    )}
                    {saveMessage.message}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center"
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Credentials
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CredentialsManager;
