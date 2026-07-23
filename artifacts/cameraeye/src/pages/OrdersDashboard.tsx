import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { Package, Download, Truck, Clock, Mail } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import type { OrderStatus } from '@/types/commerce';

const STATUS_STEPS: { key: OrderStatus; label: string; description: string }[] = [
  { key: 'received', label: '접수 (Received)', description: 'Order logged & manual darkroom verification' },
  { key: 'production', label: '제작 (In Production)', description: 'Archival pigment printing & hand signing' },
  { key: 'shipped', label: '배송 (Shipped)', description: 'Hand-packed & dispatched with tracking' },
  { key: 'completed', label: '완료 (Completed)', description: 'Delivered or digital asset accessed' },
];

export default function OrdersDashboard() {
  useDocumentTitle('Order Tracking & Collector Dashboard — CamerEye');
  const { user, orders, updateOrderStatus } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);

  return (
    <PageTransition className="bg-background text-foreground pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen">
      <div className="mb-12 border-b border-white/10 pb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-white/50">Collector Portal</span>
        <h1 className="font-serif text-4xl md:text-6xl font-light mt-2">Order History & Tracking</h1>
        {user && (
          <div className="mt-2 text-xs text-white/60 font-mono">
            Logged in as <span className="text-white">{user.name}</span> ({user.email})
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center border border-white/10 bg-white/5 p-12">
          <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl mb-2">No Acquisition History Found</h2>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            You haven't placed any fine art print or digital master orders yet. Explore our portfolio to acquire limited edition prints.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Orders List Column */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Your Orders ({orders.length})</h2>
            {orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`w-full p-5 text-left border transition-all relative ${
                    isSelected
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/10 hover:border-white/30 text-white/70'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{ord.id}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-white/20 bg-black/40">
                      {ord.status}
                    </span>
                  </div>
                  <div className="font-serif text-lg font-light text-white mb-1">
                    {ord.items[0]?.projectTitle}
                  </div>
                  <div className="text-[11px] text-white/50 font-mono flex justify-between">
                    <span>{ord.createdAt}</span>
                    <span>${ord.totalUsd} / ₩{ord.totalKrw.toLocaleString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Order Detail Column */}
          {selectedOrder && (
            <div className="lg:col-span-7 border border-white/20 bg-zinc-900/80 p-6 md:p-8 space-y-8 backdrop-blur-md">
              <div className="flex flex-wrap justify-between items-start border-b border-white/10 pb-6 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Order Detail</span>
                  <h2 className="font-mono text-2xl text-emerald-400 font-bold">{selectedOrder.id}</h2>
                  <div className="text-xs text-white/60 font-mono mt-1">Placed on {selectedOrder.createdAt}</div>
                </div>

                {/* Status Simulator Toggle */}
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Update Status (Demo)</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="bg-black border border-white/30 text-xs text-white px-2 py-1 focus:outline-none"
                  >
                    <option value="received">1. 접수 (Received)</option>
                    <option value="production">2. 제작 (In Production)</option>
                    <option value="shipped">3. 배송 (Shipped)</option>
                    <option value="completed">4. 완료 (Completed)</option>
                  </select>
                </div>
              </div>

              {/* Status Tracking Timeline */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Fulfillment Pipeline</span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const stepIndexes = { received: 0, production: 1, shipped: 2, completed: 3 };
                    const currentIdx = stepIndexes[selectedOrder.status];
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 border text-xs transition-all ${
                          isCurrent
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400'
                            : isPassed
                            ? 'border-white/30 bg-white/5 text-white'
                            : 'border-white/10 text-white/30 opacity-60'
                        }`}
                      >
                        <div className="font-mono text-[10px] opacity-60 mb-1">STEP 0{idx + 1}</div>
                        <div className="font-sans font-bold text-xs mb-1">{step.label}</div>
                        <div className="text-[10px] leading-tight opacity-75">{step.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Acquired Items</h3>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-4 border border-white/10 p-4 bg-black/40 items-center">
                    <img
                      src={item.coverImageUrl}
                      alt={item.projectTitle}
                      className="w-16 h-16 object-cover border border-white/20"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-serif text-base text-white">{item.projectTitle}</div>
                      <div className="text-[11px] text-white/60 font-mono capitalize">
                        Type: {item.type} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 mt-1">
                        ${item.priceUsd} / ₩{item.priceKrw.toLocaleString()}
                      </div>
                    </div>

                    {item.digitalDownloadUrl && (
                      <a
                        href={item.digitalDownloadUrl}
                        download
                        className="inline-flex items-center gap-1.5 bg-emerald-500 text-black font-sans uppercase text-[11px] font-bold px-4 py-2 hover:bg-emerald-400 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ZIP</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Shipping & Email Notification Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-t border-white/10 pt-6">
                {selectedOrder.shippingDetails ? (
                  <div className="p-4 border border-white/10 bg-white/5 space-y-1">
                    <div className="text-white/50 uppercase text-[10px] tracking-widest flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" /> Shipping Info
                    </div>
                    <div className="text-white font-bold">{selectedOrder.shippingDetails.recipientName}</div>
                    <div className="text-white/70">{selectedOrder.shippingDetails.address}, {selectedOrder.shippingDetails.city}</div>
                    <div className="text-white/70">Tracking: {selectedOrder.trackingNumber || 'Pending'}</div>
                  </div>
                ) : (
                  <div className="p-4 border border-white/10 bg-white/5 space-y-1">
                    <div className="text-white/50 uppercase text-[10px] tracking-widest flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Digital Fulfillment
                    </div>
                    <div className="text-emerald-300">Instant Automated Master Asset Link</div>
                    <div className="text-white/70">Delivered to {selectedOrder.customerEmail}</div>
                  </div>
                )}

                <div className="p-4 border border-white/10 bg-white/5 space-y-1">
                  <div className="text-white/50 uppercase text-[10px] tracking-widest flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Status Updates
                  </div>
                  <div className="text-white/80">Notification Sent: <span className="text-emerald-400">Order Confirmed</span></div>
                  <div className="text-white/60 text-[10px]">Updates automatically dispatched on darkroom status change.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
