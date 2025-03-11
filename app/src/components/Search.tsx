import { Input } from "./ui/input";
import { useStore } from "../store";
import { SearchIcon, XIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";

const Search = () => {
  const { templates, searchQuery, setSearchQuery } = useStore();
  const selectedTags = useStore((state) => state.selectedTags);
  const addSelectedTag = useStore((state) => state.addSelectedTag);
  const removeSelectedTag = useStore((state) => state.removeSelectedTag);
  const [open, setOpen] = React.useState(false);
  const [tagSearch, setTagSearch] = React.useState("");

  // Get all unique tags, safely handle empty templates
  const uniqueTags = React.useMemo(() => {
    if (!templates || templates.length === 0) return [];
    return Array.from(
      new Set(templates.flatMap((template) => template.tags || []))
    ).sort();
  }, [templates]);

  // Filter tags based on search
  const filteredTags = React.useMemo(() => {
    if (!tagSearch) return uniqueTags;
    return uniqueTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [uniqueTags, tagSearch]);

  return (
    <div className="max-w-xl mx-auto p-12">
      <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-center mb-8">
        Available Templates ({templates?.length || 0})
      </h1>
      <div className="max-w-xl mx-auto">
        <div className="flex flex-row gap-2">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {searchQuery.length > 0 ? (
              <div
                className="cursor-pointer"
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            ) : (
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            )}
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
              >
                Tags
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search tags..."
                  value={tagSearch}
                  onValueChange={setTagSearch}
                />
                <CommandList>
                  <CommandEmpty>No tags found.</CommandEmpty>
                  <CommandGroup>
                    {filteredTags.map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={(value) => {
                          if (selectedTags.includes(value)) {
                            removeSelectedTag(value);
                          } else {
                            addSelectedTag(value);
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTags.includes(tag)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer pr-1 flex items-center gap-1"
              >
                {tag}
                <div
                  className="hover:bg-primary-foreground/20 rounded-full p-1"
                  onClick={() => removeSelectedTag(tag)}
                >
                  <XIcon className="h-3 w-3" />
                </div>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
