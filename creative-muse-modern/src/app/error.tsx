'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full card-gradient shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Etwas ist schiefgelaufen</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es
            erneut.
          </p>
          {error.message && (
            <div className="p-3 bg-red-50 rounded-lg text-left">
              <p className="text-sm text-red-700 font-mono">{error.message}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Erneut versuchen
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Zur Startseite
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
