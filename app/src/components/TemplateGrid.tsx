import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import copy from "copy-to-clipboard";
import { CodeEditor } from "./ui/code-editor";
import { useStore } from "../store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Clipboard } from "lucide-react";

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
  const { templates, setTemplates } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [templateFiles, setTemplateFiles] = useState<TemplateFiles | null>(
    null
  );
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/meta.json");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [setTemplates]);

  const fetchTemplateFiles = async (templateId: string) => {
    setModalLoading(true);
    try {
      const [dockerComposeRes, configRes] = await Promise.all([
        fetch(`/blueprints/${templateId}/docker-compose.yml`),
        fetch(`/blueprints/${templateId}/template.yml`),
      ]);

      const dockerCompose = dockerComposeRes.ok
        ? await dockerComposeRes.text()
        : null;
      const config = configRes.ok ? await configRes.text() : null;

      setTemplateFiles({ dockerCompose, config });
    } catch (err) {
      console.error("Error fetching template files:", err);
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
    if (!templateFiles?.dockerCompose && !templateFiles?.config) return "";

    const configObj = {
      compose: templateFiles.dockerCompose || "",
      config: templateFiles.config || "",
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
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Error
        </h1>
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-center  mb-8">
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
                className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full"
                onClick={() => handleTemplateClick(template)}
              >
                <CardHeader>
                  <CardTitle className="text-xl ">
                    <img
                      src={`/blueprints/${template.id}/${template.logo}`}
                      alt={template.name}
                      className="w-12 h-12 object-contain mb-2"
                    />
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
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
                  <span className="text-sm text-gray-500">
                    v{template.version}
                  </span>
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

      <Dialog
        open={!!selectedTemplate}
        onOpenChange={() => setSelectedTemplate(null)}
      >
        <DialogContent className="max-w-[90vw] w-full lg:max-w-[90vw] max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="space-y-4 border-b sticky top-0 p-4 bg-background z-10">
            <div className="flex items-center gap-4">
              {selectedTemplate?.logo && (
                <img
                  src={`/blueprints/${selectedTemplate.id}/${selectedTemplate.logo}`}
                  alt={selectedTemplate.name}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <DialogTitle className="text-2xl">
                  {selectedTemplate?.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {selectedTemplate?.version}
                  </span>
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

                    <a
                      href={`https://github.com/Dokploy/templates/tree/main/blueprints/${selectedTemplate?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Edit Template
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 pt-3  flex flex-col gap-2">
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

            {modalLoading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading template files...</p>
              </div>
            ) : (
              <div className="grid gap-4 mt-6">
                {(templateFiles?.dockerCompose || templateFiles?.config) && (
                  <div className="flex flex-col gap-3">
                    <Label className=" flex  flex-col items-start w-fit justify-start gap-1">
                      <span className="leading-tight text-xl font-semibold">
                        Base64 Configuration
                      </span>
                      <span className="leading-tight text-sm  text-gray-500">
                        Encoded template file
                      </span>
                    </Label>
                    <div className="relative">
                      <Button
                        // variant={"outline"}
                        className="absolute end-0
                     "
                        size={"icon"}
                        onClick={() => {
                          toast.success("Copied to clipboard");
                          copy(getBase64Config());
                        }}
                      >
                        <Clipboard />
                      </Button>
                      <Input
                        value={getBase64Config()}
                        className="max-w-6xl w-full pe-10"
                      />
                    </div>
                  </div>
                )}
                <Tabs defaultValue="docker-compose">
                  <TabsList>
                    <TabsTrigger value="docker-compose">
                      Docker Compose
                    </TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                  </TabsList>
                  <TabsContent value="docker-compose">
                    {templateFiles?.dockerCompose && (
                      <div className="max-w-6xl w-full relative">
                        <Label className=" flex mb-2 flex-col items-start w-fit justify-start gap-1">
                          <span className="leading-tight text-xl font-semibold">
                            Docker Compose
                          </span>
                          <span className="leading-tight text-sm  text-gray-500">
                            docker-compose.yml
                          </span>
                        </Label>

                        <CodeEditor
                          value={templateFiles.dockerCompose || ""}
                          language="yaml"
                          className="font-mono"
                        />
                        <Button
                          onClick={() => {
                            toast.success("Copied to clipboard");
                            copy(templateFiles.dockerCompose || "");
                          }}
                          className="absolute top-10 right-2 px-3 py-1  text-sm cursor-pointer"
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="config">
                    {templateFiles?.config && (
                      <div className="max-w-6xl w-full relative">
                        <Label className=" flex mb-2 flex-col items-start w-fit justify-start gap-1">
                          <span className="leading-tight text-xl font-semibold">
                            Configuration
                          </span>
                          <span className="leading-tight text-sm  text-gray-500">
                            template.yml
                          </span>
                        </Label>

                        <CodeEditor
                          value={templateFiles.config || ""}
                          language="yaml"
                          className="font-mono"
                        />

                        <Button
                          onClick={() => {
                            toast.success("Copied to clipboard");
                            copy(templateFiles.config || "");
                          }}
                          className="absolute top-10 right-2 px-3 py-1  text-sm cursor-pointer"
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {!templateFiles?.dockerCompose && !templateFiles?.config && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No configuration files available for this template.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplateGrid;
