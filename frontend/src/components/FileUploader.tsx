import { useCallback, useState } from 'react';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { useRecipientsStore } from '../stores/recipientsStore';
import { apiClient } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function FileUploader() {
  const { setRecipients } = useRecipientsStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await apiClient.uploadCsv(file);

      if (result.errors.length > 0) {
        toast.warning(`Uploaded with ${result.errors.length} errors`, {
          description: result.errors.slice(0, 3).join('\n'),
        });
      } else {
        toast.success(`Imported ${result.recipients.length} recipients`);
      }

      setRecipients(result.recipients);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${isDragging ? 'border-amber-500 dark:border-amber-400 bg-amber-500/5 dark:bg-amber-400/5' : 'border-gray-400 dark:border-gray-600'}
            ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-400/50'}
          `}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center gap-4">
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-amber-500 dark:text-amber-400 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            )}

            <div>
              <p className="text-lg font-medium">
                {isUploading ? 'Uploading...' : 'Drop your CSV or Excel file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Supported formats: .csv, .xlsx, .xls</p>
              <p>Required columns: Name, Message (or similar)</p>
              <p className="text-amber-600 dark:text-amber-400">✓ Bulk upload multiple recipients at once</p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href="/template.csv" download="template.csv">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Template
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
