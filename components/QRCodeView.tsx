
import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Copy, QrCode, Scan } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeViewProps {
  onBack: () => void;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'scan'>('code');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);

  React.useEffect(() => {
    if (activeTab === 'scan') {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const qrCodeSuccessCallback = (decodedText: string) => {
            setScanResult(decodedText);
            console.log("QR Decoded:", decodedText);
          };

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            () => { }
          );
        } catch (err) {
          console.error("Scanner error:", err);
        }
      };

      startScanner();
    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Stop error:", err));
      }
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Unmount stop error:", err));
      }
    };
  }, [activeTab]);

  return (
    <div className="bg-[#14143a] min-h-screen flex flex-col text-white">
      <header className="flex items-center px-4 py-8">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="px-8 flex-1 flex flex-col items-center">
        {/* Tabs style fidel à l'image */}
        <div className="w-full max-w-[320px] bg-white/5 p-1 rounded-2xl backdrop-blur-md flex mb-12">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'code' ? 'bg-white text-[#1D1D4B] shadow-lg' : 'text-gray-400'}`}
          >
            <QrCode size={16} /> Mon Code
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'scan' ? 'bg-white text-[#1D1D4B] shadow-lg' : 'text-gray-400'}`}
          >
            <Scan size={16} /> Scanner
          </button>
        </div>

        {activeTab === 'code' ? (
          <>
            <div className="relative mb-8">
              <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-900/20">
                <div className="w-48 h-48 bg-[#1D1D4B] rounded-xl flex items-center justify-center p-2">
                  <div className="w-full h-full bg-white rounded-lg flex flex-wrap p-1">
                    {[...Array(64)].map((_, i) => (
                      <div key={i} className={`w-[12.5%] h-[12.5%] ${Math.random() > 0.5 ? 'bg-[#1D1D4B]' : 'bg-transparent'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#22C55E] border-4 border-[#14143a] rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck size={20} className="text-white" />
              </div>
            </div>

            <div className="text-center mb-10">
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 mb-6">TR-8842-X9Y</p>
              <h3 className="text-lg font-bold mb-3">Scanner pour valider</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[280px]">
                Présentez ce code au voyageur lors de la remise du colis. Cela débloquera automatiquement le paiement.
              </p>
            </div>

            <button className="flex items-center gap-3 text-[#FF5722] font-bold text-sm active:opacity-70 transition-opacity">
              <Copy size={18} />
              <span>Copier le code manuel</span>
            </button>
          </>
        ) : (
          <div className="w-full flex-1 flex flex-col items-center">
            <div className="w-full aspect-square max-w-[320px] relative mb-12">
              {/* Scanner Frame */}
              <div className="absolute inset-0 border-2 border-white/20 rounded-[40px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-scan"></div>

                {/* Corners */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg"></div>

                {/* Simulation de camera */}
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <div id="reader" className="w-full h-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Scan size={64} className="text-white/20" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              {scanResult ? (
                <div className="bg-green-500/20 text-green-400 px-6 py-4 rounded-2xl border border-green-500/30">
                  <p className="text-sm font-bold">Code détecté !</p>
                  <p className="text-[10px] opacity-70 mt-1">{scanResult}</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-3">Placez le code au centre</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-[240px]">
                    Scannez le code QR du destinataire pour confirmer la livraison.
                  </p>
                </>
              )}
            </div>

            <div className="mt-12 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeView;
