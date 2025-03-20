'use client';

import React, { useState, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Result } from '@zxing/library';

export function QRScanner({
  onScan,
  disabled,
}: {
  onScan: (text: string) => Promise<boolean>;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  // Note: The `ref` prop is not working
  // const scannerRef = useRef<any>(null);

  const handleResult = useCallback(
    async (
      result: Result | null | undefined,
      error: Error | null | undefined
    ) => {
      if (error) return;
      if (result && !isScanning) {
        const text = result.getText();
        setIsScanning(true);
        const stopScan = await onScan(text);

        if (stopScan) {
          setIsOpen(false);
          // Note: The `ref` prop is not working
          // scannerRef.current.stop();
          window.location.reload();
        } else {
          console.log('continue scan');
          setIsScanning(false);
        }
        return;
      }
    },
    [onScan, isScanning]
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      // Note: The `ref` prop is not working
      // scannerRef.current.stop();
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-black text-white"
          disabled={disabled}
        >
          <Camera className="mr-2 h-4 w-4" />
          Scan Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Ticket</DialogTitle>
        </DialogHeader>
        <div className="aspect-square w-full overflow-hidden rounded-lg">
          {isOpen && (
            <QrReader
              // Note: The `ref` prop is not working
              // ref={scannerRef}
              onResult={handleResult}
              constraints={{ facingMode: 'environment' }}
              videoStyle={{ width: '100%', height: '100%' }}
              scanDelay={500}
              videoId="qr-reader-video"
            />
          )}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Position the QR code in the center of the camera
        </p>
      </DialogContent>
    </Dialog>
  );
}
