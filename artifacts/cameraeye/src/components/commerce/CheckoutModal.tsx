import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Download, Truck, CreditCard } from 'lucide-react';
import type { PrintEdition, PrintSizeOption, ProductType, Order, ShippingCountry } from '@/types/commerce';
import { calculateShippingFee } from '@/lib/shipping';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectId: string;
  coverImageUrl: string;
  edition: PrintEdition;
}

export function CheckoutModal({
  isOpen,
  onClose,
  projectTitle,
  projectId,
  coverImageUrl,
  edition,
}: CheckoutModalProps) {
  const { user, addOrder } = useAuth();
  const { toast } = useToast();

  const [productType, setProductType] = useState<ProductType>('print');
  const [selectedSize, setSelectedSize] = useState<PrintSizeOption>(
    edition.sizeOptions[0] || {
      id: 'default',
      name: 'A3 Limited Edition',
      dimensionsCm: { width: 30, height: 42 },
      weightKg: 0.8,
      priceUsd: 250,
      priceKrw: 337500,
    }
  );

  const [country, setCountry] = useState<ShippingCountry>('KR');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const isSoldOut = edition.remainingStock <= 0 && productType === 'print';
  const shippingInfo = calculateShippingFee({
    country,
    totalWeightKg: productType === 'print' ? selectedSize.weightKg : 0,
    isDigitalOnly: productType === 'digital',
  });

  const subtotalUsd = productType === 'print' ? selectedSize.priceUsd : edition.digitalPriceUsd;
  const subtotalKrw = productType === 'print' ? selectedSize.priceKrw : edition.digitalPriceKrw;

  const totalUsd = subtotalUsd + shippingInfo.feeUsd;
  const totalKrw = subtotalKrw + shippingInfo.feeKrw;

  const handleSimulatedCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSoldOut) return;

    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        customerEmail,
        status: productType === 'digital' ? 'completed' : 'received',
        paymentMethod: 'Stripe (Mocked)',
        shippingFeeUsd: shippingInfo.feeUsd,
        shippingFeeKrw: shippingInfo.feeKrw,
        totalUsd,
        totalKrw,
        items: [
          {
            id: `item-${Date.now()}`,
            projectId,
            projectTitle,
            coverImageUrl,
            type: productType,
            selectedSize: productType === 'print' ? selectedSize.name : undefined,
            priceUsd: subtotalUsd,
            priceKrw: subtotalKrw,
            digitalDownloadUrl:
              productType === 'digital'
                ? `/downloads/${projectTitle.toLowerCase().replace(/\s+/g, '-')}-master-fullres.zip`
                : undefined,
          },
        ],
        shippingDetails:
          productType === 'print'
            ? {
                recipientName,
                phone,
                address,
                city,
                postalCode,
                country,
              }
            : undefined,
        trackingNumber:
          productType === 'print' ? `LX-${Math.floor(1000000 + Math.random() * 9000000)}-KR` : undefined,
      };

      addOrder(newOrder);
      setCompletedOrder(newOrder);
      setIsProcessing(false);

      toast({
        title: productType === 'digital' ? 'Digital Download Ready!' : 'Print Order Confirmed',
        description:
          productType === 'digital'
            ? 'Your high-resolution master file link is generated.'
            : `Order ${orderId} registered for darkroom printing & manual inspection.`,
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/20 p-6 md:p-8 rounded-none text-white my-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="space-y-6 text-center py-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="font-serif text-3xl font-light">
              {completedOrder.items[0].type === 'digital' ? 'Download Ready' : 'Order Received'}
            </h2>
            <p className="text-xs text-white/60 font-mono">
              Order Number: <span className="text-white">{completedOrder.id}</span>
            </p>

            <div className="border border-white/10 p-4 bg-black/40 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Item</span>
                <span className="font-serif">{projectTitle} ({completedOrder.items[0].type.toUpperCase()})</span>
              </div>
              {completedOrder.items[0].selectedSize && (
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/50">Size Option</span>
                  <span>{completedOrder.items[0].selectedSize}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/50">Total Amount</span>
                <span className="font-mono text-emerald-400">
                  ${completedOrder.totalUsd} / ₩{completedOrder.totalKrw.toLocaleString()}
                </span>
              </div>
              {completedOrder.shippingDetails && (
                <div className="flex justify-between">
                  <span className="text-white/50">Estimated Shipping</span>
                  <span>1–2 Days (Domestic Manual Inspection)</span>
                </div>
              )}
            </div>

            {completedOrder.items[0].digitalDownloadUrl ? (
              <a
                href={completedOrder.items[0].digitalDownloadUrl}
                download
                className="inline-flex items-center gap-2 bg-emerald-500 text-black font-sans uppercase text-xs tracking-[0.2em] px-8 py-3.5 hover:bg-emerald-400 transition-colors w-full justify-center"
              >
                <Download className="w-4 h-4" />
                Download High-Res ZIP (450 MB TIFF + JPEG)
              </a>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed">
                Your limited edition fine art print order has been assigned to darkroom production. Tracking updates will be delivered to <span className="underline">{completedOrder.customerEmail}</span>.
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full border border-white/20 uppercase text-xs tracking-[0.2em] py-3 text-white/70 hover:text-white"
            >
              Close Window
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Acquire Fine Art</span>
                <h2 className="font-serif text-2xl font-light">{projectTitle}</h2>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-emerald-400">
                  Limited Edition
                </div>
                <div className="text-[11px] font-mono text-white/70">
                  {edition.remainingStock} of {edition.totalLimit} Available
                </div>
              </div>
            </div>

            <form onSubmit={handleSimulatedCheckout} className="space-y-6 text-xs">
              {/* Format Selection (Print vs Digital) */}
              <div>
                <label className="block text-white/50 uppercase tracking-widest text-[10px] mb-2">Select Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductType('print')}
                    className={`p-3 text-left border transition-all ${
                      productType === 'print'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    <div className="font-serif text-sm text-white mb-1">Archival Print</div>
                    <div className="text-[10px] text-white/60">Limited Edition / Hand Signed</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductType('digital')}
                    className={`p-3 text-left border transition-all ${
                      productType === 'digital'
                        ? 'border-white bg-white/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    <div className="font-serif text-sm text-white mb-1">Digital Master License</div>
                    <div className="text-[10px] text-white/60">Instant ZIP Download (TIFF/JPEG)</div>
                  </button>
                </div>
              </div>

              {/* Print Size Selection */}
              {productType === 'print' && (
                <div>
                  <label className="block text-white/50 uppercase tracking-widest text-[10px] mb-2">Print Size</label>
                  <div className="space-y-2">
                    {edition.sizeOptions.map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setSelectedSize(opt)}
                        className={`flex justify-between items-center p-3 border cursor-pointer transition-all ${
                          selectedSize.id === opt.id
                            ? 'border-white bg-white/10'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div>
                          <div className="font-serif text-sm">{opt.name}</div>
                          <div className="text-[10px] text-white/50 font-mono">
                            {opt.dimensionsCm.width} x {opt.dimensionsCm.height} cm • {opt.weightKg} kg
                          </div>
                        </div>
                        <div className="font-mono text-emerald-400 text-sm">
                          ${opt.priceUsd} / ₩{opt.priceKrw.toLocaleString()}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Calculator & Address Form */}
              {productType === 'print' && (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 uppercase tracking-widest text-[10px]">Shipping Destination</span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value as ShippingCountry)}
                      className="bg-black border border-white/20 text-white px-3 py-1 text-xs focus:outline-none"
                    >
                      <option value="KR">Korea (국내 배송)</option>
                      <option value="US">United States (해외 배송)</option>
                      <option value="JP">Japan (해외 배송)</option>
                      <option value="EU">Europe (해외 배송)</option>
                      <option value="WW">Worldwide Express</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Recipient Full Name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Shipping Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Customer Email for Digital or Print */}
              <div>
                <label className="block text-white/50 uppercase tracking-widest text-[10px] mb-1">Email for Receipt & Updates</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              {/* Price Summary Box */}
              <div className="p-4 bg-black/60 border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${subtotalUsd} / ₩{subtotalKrw.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    Shipping Fee ({shippingInfo.estimatedDays})
                  </span>
                  <span>${shippingInfo.feeUsd} / ₩{shippingInfo.feeKrw.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white pt-2 border-t border-white/10 font-bold text-sm">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">${totalUsd} / ₩{totalKrw.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              {isSoldOut ? (
                <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-300 text-center uppercase tracking-widest">
                  Sold Out (Limited Edition Reached)
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-white text-black font-sans uppercase text-xs tracking-[0.2em] py-4 hover:bg-white/90 transition-colors flex items-center justify-center gap-2 font-bold"
                >
                  <CreditCard className="w-4 h-4" />
                  {isProcessing ? 'Processing Order...' : `Pay $${totalUsd} (Simulated Checkout)`}
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted Checkout • Hand-Inspected Archival Printing</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
