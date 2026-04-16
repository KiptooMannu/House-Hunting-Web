import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const checkoutId = searchParams.get('checkoutId');

    const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [amount, setAmount] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    useEffect(() => {
        if (!checkoutId) {
            setStatus('failed');
            return;
        }

        let pollInterval: number; // ✅ Fixed
        let attempts = 0;
        const maxAttempts = 30;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/payments/status/${checkoutId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await res.json();

                if (data.status === 'completed') {
                    setStatus('success');
                    setAmount(data.amount || 'KSh 2,500.00');
                    setTransactionId(data.transactionId || data.mpesaReceiptNumber || 'N/A');
                    clearInterval(pollInterval);
                } else if (data.status === 'failed') {
                    setStatus('failed');
                    clearInterval(pollInterval);
                }
                attempts++;
                if (attempts >= maxAttempts) {
                    setStatus('failed');
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error(err);
            }
        };

        pollInterval = setInterval(checkStatus, 3000);
        checkStatus();

        return () => clearInterval(pollInterval);
    }, [checkoutId]);

    if (!checkoutId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-surface-container-lowest rounded-xl p-8 text-center">
                    <p className="text-on-surface-variant">Invalid transaction reference.</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
            {/* Top App Bar */}
            <header className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="transition-all duration-300 active:scale-95 text-primary p-2 hover:bg-slate-200/50 rounded-full"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-primary font-headline font-bold tracking-tight text-lg">Transaction Detail</h1>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20">
                    <img
                        className="w-full h-full object-cover"
                        alt="profile"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzurY6CMXDVhl67LLOT2xWrL9X1Q8e1PiaXsycelLQnKjvVcK1I3ByW-JzTSHjWOy_mcGStF5hL04buhXJk-2B4yh0xXvu7Aa8xZsBczb6dnVQhSx7eJMBybsTcQLRap8P3NTRpOIPY4H5yW-5962cd8pm56SWrvm0tOHIWoyhC7gBIO682KC1ac1vWCl8_h1p8FpAJPA_So7kuT_y7UhEOAmWkNKPQ-sQiJecH6T4u2kxADGNID_dprqwTqSWYClGBtXi07RAbw8"
                    />
                </div>
            </header>

            <main className="flex-grow pt-24 pb-32 px-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md space-y-12">
                    {/* SUCCESS STATE */}
                    {status === 'success' && (
                        <section className="relative group">
                            <div className="absolute -inset-4 bg-surface-container-low rounded-xl -z-10 opacity-50"></div>
                            <div className="bg-surface-container-lowest rounded-xl p-8 tonal-layering-shadow flex flex-col items-center text-center space-y-8 border border-outline-variant/10">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container relative z-10">
                                        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            check_circle
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-tertiary-fixed-dim blur-2xl opacity-20 -z-0"></div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-headline font-bold tracking-tight text-on-surface">Payment Successful!</h2>
                                    <p className="text-on-surface-variant text-lg leading-relaxed">
                                        Your property booking is confirmed. We've sent the digital receipt to your registered email.
                                    </p>
                                </div>
                                <div className="w-full bg-surface-container-low rounded-lg p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Transaction ID</span>
                                        <span className="text-on-surface font-mono font-bold">{transactionId}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Amount Paid</span>
                                        <span className="text-on-surface font-bold text-xl">{amount || 'KSh 2,500.00'}</span>
                                    </div>
                                    <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-center gap-2">
                                        <div className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            Verified via M-Pesa
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full space-y-4">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full py-5 bg-primary text-on-primary rounded-xl font-bold tracking-wide transition-all duration-300 hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        Return to Dashboard
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full py-5 bg-transparent text-primary rounded-xl font-bold tracking-wide hover:bg-surface-container-high transition-colors"
                                    >
                                        Download Receipt
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* PROCESSING STATE */}
                    {status === 'pending' && (
                        <section>
                            <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 border-4 border-primary-fixed border-t-primary rounded-full animate-spin"></div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-headline font-bold">Processing Your Transaction...</h3>
                                    <p className="text-sm text-on-surface-variant">
                                        Please check your M-Pesa and enter your PIN if prompted.
                                    </p>
                                </div>
                                <p className="text-xs text-on-surface-variant/70">Waiting for confirmation...</p>
                            </div>
                        </section>
                    )}

                    {/* FAILURE STATE */}
                    {status === 'failed' && (
                        <section>
                            <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">error</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-headline font-bold">Payment Failed</h3>
                                    <p className="text-sm text-on-surface-variant">
                                        Something went wrong with your M-Pesa transaction. Please try again.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="mt-4 bg-primary text-white px-6 py-3 rounded-full font-bold"
                                >
                                    Go Back & Retry
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 w-full h-24 z-50 flex justify-around items-center px-8 pb-4 bg-white/70 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] border-t border-white/20">
                <a className="flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-colors" href="/">
                    <span className="material-symbols-outlined">search</span>
                    <span className="font-body text-[10px] font-medium uppercase tracking-widest mt-1">Explore</span>
                </a>
                <a className="flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-colors" href="/saved">
                    <span className="material-symbols-outlined">favorite</span>
                    <span className="font-body text-[10px] font-medium uppercase tracking-widest mt-1">Saved</span>
                </a>
                <a className="scale-110 transition-transform duration-200 flex flex-col items-center justify-center bg-primary text-white rounded-full w-14 h-14" href="/">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                </a>
                <a className="flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-colors" href="/profile">
                    <span className="material-symbols-outlined">person</span>
                    <span className="font-body text-[10px] font-medium uppercase tracking-widest mt-1">Account</span>
                </a>
            </nav>
        </div>
    );
}
