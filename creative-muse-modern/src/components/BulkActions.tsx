'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trash2, Download, Star, Archive, Copy } from 'lucide-react';

export interface BulkActionsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkExport: (ids: string[]) => void;
  onBulkRate: (ids: string[], rating: number) => void;
  onBulkArchive: (ids: string[]) => void;
  totalItems: number;
}

export function BulkActions({
  selectedIds,
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  onBulkRate,
  onBulkArchive,
  totalItems,
}: BulkActionsProps) {
  const { t } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const isAllSelected = selectedIds.length === totalItems && totalItems > 0;
  // const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < totalItems;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      // This would need to be implemented by the parent component
      // For now, we'll just clear the selection
      onSelectionChange([]);
    }
  };

  const handleBulkRate = (rating: number) => {
    onBulkRate(selectedIds, rating);
    setShowRatingDialog(false);
  };

  const handleBulkDelete = () => {
    onBulkDelete(selectedIds);
    setShowDeleteDialog(false);
    onSelectionChange([]);
  };

  const handleBulkExport = () => {
    onBulkExport(selectedIds);
  };

  const handleBulkArchive = () => {
    onBulkArchive(selectedIds);
    onSelectionChange([]);
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <Card className="shadow-2xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    {selectedIds.length} {t('bulk.selected')}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{t('bulk.actions')}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <CardDescription>{t('bulk.description')}</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>{t('bulk.export')}</span>
              </Button>

              {/* Rate */}
              <Dialog
                open={showRatingDialog}
                onOpenChange={setShowRatingDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Star className="h-4 w-4" />
                    <span>{t('bulk.rate')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('bulk.rateTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('bulk.rateDescription')} ({selectedIds.length}{' '}
                      {t('bulk.items')})
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center space-x-2 py-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="outline"
                        size="lg"
                        onClick={() => handleBulkRate(rating)}
                        className="flex items-center space-x-1 hover:bg-yellow-50"
                      >
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span>{rating}</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Archive */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                className="flex items-center space-x-1"
              >
                <Archive className="h-4 w-4" />
                <span>{t('bulk.archive')}</span>
              </Button>

              {/* Copy */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Implement copy functionality
                  navigator.clipboard.writeText(
                    `${selectedIds.length} ideas selected for copying`
                  );
                }}
                className="flex items-center space-x-1"
              >
                <Copy className="h-4 w-4" />
                <span>{t('bulk.copy')}</span>
              </Button>

              {/* Delete */}
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{t('bulk.delete')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('bulk.deleteTitle')}</DialogTitle>
                    <DialogDescription>
                      {t('bulk.deleteDescription')} ({selectedIds.length}{' '}
                      {t('bulk.items')})
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleBulkDelete}>
                      {t('bulk.confirmDelete')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Checkbox component for individual items
export function SelectableIdeaCard({
  children,
  isSelected,
  onSelectionChange,
  ideaId,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
  ideaId: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked: boolean) =>
            onSelectionChange(ideaId, !!checked)
          }
          className="bg-white shadow-md data-[state=checked]:bg-blue-600"
        />
      </div>
      <div
        className={`transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
