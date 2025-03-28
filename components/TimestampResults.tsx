import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";

interface TimestampResultsProps {
  isLoading: boolean;
  content: string;
}

export function TimestampResults({ isLoading, content }: TimestampResultsProps) {
  const [progress, setProgress] = useState(0);
  const [parsedSections, setParsedSections] = useState<{ timestamp: string; isNew?: boolean }[]>(
    []
  );
  const prevContentRef = useRef<string>("");

  // Simulate progress when loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          // Keep progress between 0-95% while loading
          // We'll set it to 100% when loading is complete
          const newValue = prev + Math.random() * 15;
          return Math.min(newValue, 95);
        });
      }, 200);

      return () => {
        clearInterval(interval);
      };
    } else if (content) {
      // Set progress to 100% when we have content and loading is complete
      setProgress(100);
    }
  }, [isLoading, content]);

  // Parse timestamp content and handle streaming updates
  useEffect(() => {
    const parseLines = (text: string) => {
      if (!text) return [];

      // Split by lines and filter empty lines
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && /^\d{2}:\d{2}:\d{2}\s*-\s*.+/.test(line))
        .map((line) => ({ timestamp: line }));
    };

    // If there's new content
    if (content !== prevContentRef.current) {
      const currentLines = parseLines(content);
      const previousLines = parseLines(prevContentRef.current);

      // Find new lines that weren't in the previous content
      if (currentLines.length > previousLines.length) {
        const newSections = currentLines.map((line, index) => {
          // Mark as new if it's a line we haven't seen before
          const isNew = index >= previousLines.length;
          return {
            ...line,
            isNew: isNew,
          };
        });

        setParsedSections(newSections);

        // After a delay, remove the "new" flag to stop the animation
        if (newSections.some((s) => s.isNew)) {
          const timer = setTimeout(() => {
            setParsedSections((prev) => prev.map((section) => ({ ...section, isNew: false })));
          }, 1000);
          return () => clearTimeout(timer);
        }
      }

      prevContentRef.current = content;
    }
  }, [content]);

  // Function to copy all timestamps to clipboard
  const copyToClipboard = () => {
    const timestampsText = parsedSections.map((section) => section.timestamp).join("\n");
    navigator.clipboard.writeText(timestampsText);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Generated Timestamps</CardTitle>
        {content && !isLoading && (
          <Button onClick={copyToClipboard} variant="outline" size="sm">
            Copy All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className={isLoading ? "space-y-4 p-4" : "hidden"}>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Analyzing your SRT file and generating timestamps...
          </p>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-600 text-sm mt-2">
              This may take a moment depending on file size
            </div>
          </div>
        </div>

        {/* Now we show results even while loading if we have some content */}
        {parsedSections.length > 0 ? (
          <div className="animate-in fade-in duration-500">
            <div className="space-y-2 mt-2">
              {parsedSections.map((section, index) => (
                <div
                  key={index}
                  className={`border-b py-2 last:border-0 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md px-3 transition-colors ${
                    section.isNew
                      ? "animate-in slide-in-from-right-5 fade-in duration-300 scale-in-100"
                      : ""
                  }`}
                  style={
                    section.isNew
                      ? {
                          animationDelay: `${index * 100}ms`,
                          backgroundColor: section.isNew
                            ? "rgba(147, 197, 253, 0.1)"
                            : "transparent",
                          transition: "background-color 1s ease-out",
                        }
                      : undefined
                  }
                >
                  <p className="text-base text-gray-800 dark:text-gray-200">{section.timestamp}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => navigator.clipboard.writeText(section.timestamp)}
                        >
                          <span className="sr-only">Copy</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-copy"
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy timestamp</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !isLoading &&
          !content && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Upload an SRT file to generate timestamps
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
