'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  CreditCard,
  Check,
  X,
  Shield,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    name: string;
    display_name: string;
    price_monthly: number;
    features: string[];
  } | null;
  currentPlan: string;
  onPaymentSuccess: (newPlan: string) => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  currentPlan,
  onPaymentSuccess 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plan' | 'payment' | 'success' | 'error'>('plan');
  const [errorMessage, setErrorMessage] = useState('');

  // Simulazione dati carta di credito per sandbox
  const [cardData, setCardData] = useState({
    number: '4242424242424242', // Stripe test card
    expiry: '12/25',
    cvc: '123',
    name: 'Test User'
  });

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setPaymentStep('payment');

    try {
      // Simulazione chiamata API di pagamento (Stripe Sandbox)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulazione successo pagamento
      const success = Math.random() > 0.1; // 90% successo per demo

      if (success) {
        // Genera un payment ID sandbox
        const paymentId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Chiama l'API per aggiornare la subscription
        const upgradeResult = await apiService.upgradeSubscription(selectedPlan.name, paymentId);
        
        if (upgradeResult.error) {
          throw new Error(upgradeResult.error);
        }
        
        setPaymentStep('success');
        // Aggiorna la subscription nel frontend
        setTimeout(() => {
          onPaymentSuccess(selectedPlan.name);
          onClose();
          setPaymentStep('plan');
        }, 2000);
      } else {
        throw new Error('Pagamento rifiutato dalla banca');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Errore durante il pagamento');
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setPaymentStep('plan');
    setErrorMessage('');
    setIsProcessing(false);
  };

  if (!selectedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Aggiorna Subscription</span>
          </DialogTitle>
          <DialogDescription>
            {paymentStep === 'plan' && 'Conferma il tuo nuovo piano'}
            {paymentStep === 'payment' && 'Elaborazione pagamento...'}
            {paymentStep === 'success' && 'Pagamento completato!'}
            {paymentStep === 'error' && 'Errore nel pagamento'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Plan Confirmation */}
        {paymentStep === 'plan' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedPlan.display_name}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800">
                    €{selectedPlan.price_monthly}/mese
                  </Badge>
                </div>
                <CardDescription>
                  Upgrade da {currentPlan} a {selectedPlan.display_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Funzionalità incluse:</h4>
                  <ul className="space-y-1">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sandbox Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Modalità Sandbox</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Questo è un pagamento di test. Nessun addebito reale verrà effettuato.
              </p>
            </div>

            {/* Test Card Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2">Carta di test precompilata:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Numero:</span>
                  <p className="font-mono">4242 4242 4242 4242</p>
                </div>
                <div>
                  <span className="text-gray-600">Scadenza:</span>
                  <p className="font-mono">12/25</p>
                </div>
                <div>
                  <span className="text-gray-600">CVC:</span>
                  <p className="font-mono">123</p>
                </div>
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <p>Test User</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annulla
              </Button>
              <Button onClick={handlePayment} className="flex-1">
                Procedi al Pagamento
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Processing Payment */}
        {paymentStep === 'payment' && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="font-medium mb-2">Elaborazione pagamento...</h3>
            <p className="text-sm text-gray-600">
              Stiamo processando il tuo pagamento con Stripe (Sandbox)
            </p>
            <div className="mt-4 bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                💳 Simulazione pagamento in corso...
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {paymentStep === 'success' && (
          <div className="text-center py-8">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="font-medium mb-2">Pagamento Completato!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Il tuo piano è stato aggiornato a {selectedPlan.display_name}
            </p>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-700">
                ✅ Subscription attivata immediatamente
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Error */}
        {paymentStep === 'error' && (
          <div className="text-center py-8">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <X className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="font-medium mb-2">Errore nel Pagamento</h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">Suggerimenti:</span>
              </div>
              <ul className="text-xs text-red-700 mt-2 space-y-1">
                <li>• Verifica i dati della carta</li>
                <li>• Controlla il saldo disponibile</li>
                <li>• Riprova tra qualche minuto</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Chiudi
              </Button>
              <Button onClick={resetModal} className="flex-1">
                Riprova
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}