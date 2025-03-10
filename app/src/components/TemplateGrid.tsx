import React, { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import copy from 'copy-to-clipboard';
interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  logo?: string;
  links: {
    github?: string;
    website?: string;
    docs?: string;
  };
  tags: string[];
}

interface TemplateFiles {
  dockerCompose: string | null;
  config: string | null;
}

const TemplateGrid: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateFiles, setTemplateFiles] = useState<TemplateFiles | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/meta.json');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const fetchTemplateFiles = async (templateId: string) => {
    setModalLoading(true);
    try {
      const [dockerComposeRes, configRes] = await Promise.all([
        fetch(`/blueprints/${templateId}/docker-compose.yml`),
        fetch(`/blueprints/${templateId}/template.yml`)
      ]);

      const dockerCompose = dockerComposeRes.ok ? await dockerComposeRes.text() : null;
      const config = configRes.ok ? await configRes.text() : null;

      setTemplateFiles({ dockerCompose, config });
    } catch (err) {
      console.error('Error fetching template files:', err);
      setTemplateFiles({ dockerCompose: null, config: null });
    } finally {
      setModalLoading(false);
    }
  };

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateFiles(null); // Reset previous files
    fetchTemplateFiles(template.id);
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBase64Config = () => {
    if (!templateFiles?.dockerCompose && !templateFiles?.config) return '';
    
    const configObj = {
      compose: templateFiles.dockerCompose || '',
      config: templateFiles.config || ''
    };

    return btoa(JSON.stringify(configObj, null, 2));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Loading templates...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Error</h1>
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-center text-gray-900 mb-8">
          Available Templates ({templates.length})
        </h1>
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 h-fit"
                onClick={() => handleTemplateClick(template)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">
                    <img 
                      src={`/blueprints/${template.id}/${template.logo}`} 
                      alt={template.name}
                      className="w-12 h-12 object-contain"
                    />
                    {template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">v{template.version}</span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No templates found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-[90vw] w-full lg:max-w-7xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedTemplate?.logo && (
                <img 
                  src={`/blueprints/${selectedTemplate.id}/${selectedTemplate.logo}`} 
                  alt={selectedTemplate.name}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <DialogTitle className="text-2xl">{selectedTemplate?.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">v{selectedTemplate?.version}</span>
                  <div className="flex gap-2">
                    {selectedTemplate?.links.github && (
                      <a
                        href={selectedTemplate.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        GitHub
                      </a>
                    )}
                    {selectedTemplate?.links.docs && (
                      <a
                        href={selectedTemplate.links.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Docs
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogDescription className="text-base">
              {selectedTemplate?.description}
            </DialogDescription>
            <div className="flex flex-wrap gap-1">
              {selectedTemplate?.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </DialogHeader>
          
          {modalLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading template files...</p>
            </div>
          ) : (
            <div className="grid gap-8 mt-6">
              {templateFiles?.dockerCompose && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    Docker Compose
                    <span className="text-xs font-normal text-gray-500">docker-compose.yml</span>
                  </h3>
                  <pre className="bg-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                    <code className="font-mono">{templateFiles.dockerCompose}</code>
                  </pre>
                </div>
              )}
              {templateFiles?.config && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    Configuration
                    <span className="text-xs font-normal text-gray-500">template.yml</span>
                  </h3>
                  <pre className="bg-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                    <code className="font-mono">{templateFiles.config}</code>
                  </pre>
                </div>
              )}
              {(templateFiles?.dockerCompose || templateFiles?.config) && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    Base64 Configuration
                    <span className="text-xs font-normal text-gray-500">Encoded template files</span>
                  </h3>
                  <div className="relative">
                    <textarea
                      readOnly
                      className="w-full h-32 p-4 bg-gray-100 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={getBase64Config()}
                    />
                    <Button
                      onClick={() => {
                        toast.success('Copied to clipboard')
                        copy(getBase64Config())
                      }}
                      className="absolute top-2 right-2 px-3 py-1 text-white text-sm cursor-pointer"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              {!templateFiles?.dockerCompose && !templateFiles?.config && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No configuration files available for this template.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateGrid; 