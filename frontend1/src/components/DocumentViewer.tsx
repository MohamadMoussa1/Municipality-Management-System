import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Image, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url?: string;
}

interface DocumentViewerProps {
  documents: Document[];
  title?: string;
}

export const DocumentViewer = ({ documents, title = "Documents" }: DocumentViewerProps) => {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeLabel = (type: string) => {
    if (type.includes('image')) return 'Image';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('doc')) return 'Document';
    return 'File';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No documents available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <Badge variant="secondary" className="text-xs">
                            {getFileTypeLabel(doc.type)}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{doc.name}</DialogTitle>
                            <DialogDescription>
                              {getFileTypeLabel(doc.type)} • {formatFileSize(doc.size)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                            {doc.type.includes('image') ? (
                              <img 
                                src={doc.url || '/placeholder.svg'} 
                                alt={doc.name}
                                className="max-w-full max-h-[60vh] object-contain"
                              />
                            ) : doc.type.includes('pdf') ? (
                              <div className="text-center space-y-4">
                                <FileText className="h-24 w-24 mx-auto text-muted-foreground" />
                                <p className="text-muted-foreground">PDF Preview</p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.name}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center space-y-4">
                                <File className="h-24 w-24 mx-auto text-muted-foreground" />
                                <p className="text-muted-foreground">File Preview Not Available</p>
                                <p className="text-sm text-muted-foreground">
                                  Download the file to view it
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
