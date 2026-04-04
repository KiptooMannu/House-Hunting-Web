import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await register(form);
      if (user.role === 'landlord') navigate('/landlord');
      else navigate('/houses');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  const setUserType = (type) => {
    setForm({ ...form, role: type });
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] overflow-hidden mt-16 bg-surface">
      {/* Left Side: Register Form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-surface py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-primary mb-2">Modern Estate</h1>
            <p className="text-on-surface-variant font-medium">Create your secure account</p>
          </div>
          
          <div className="space-y-8">
            {/* Toggle Switch for Role */}
            <div className="flex p-1 bg-surface-container-low rounded-xl">
              <button 
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  form.role === 'user' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Property Seeker
              </button>
              <button 
                type="button"
                onClick={() => setUserType('landlord')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  form.role === 'landlord' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Verified Landlord
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Full Name</label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline transition-all" 
                    placeholder="John Doe" 
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Email Address</label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline transition-all" 
                    placeholder="name@example.com" 
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Phone Number</label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline transition-all" 
                    placeholder="+254700000000" 
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant ml-1">Password</label>
                  <input 
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline transition-all" 
                    placeholder="••••••••" 
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input className="rounded-lg border-outline-variant text-primary focus:ring-primary w-5 h-5 transition-all outline-none" type="checkbox" required />
                  <span className="text-sm text-on-surface-variant group-hover:text-on-surface">I agree to the Terms of Service</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Register'}</span>
                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
              </button>
            </form>
            
            <p className="text-center text-on-surface-variant text-sm mt-6">
              Already have an account? 
              <Link to="/login" className="text-tertiary font-bold hover:underline decoration-2 underline-offset-4 ml-1">Log In</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Imagery ... (reusing the same from Login) */}
      <section className="hidden lg:flex w-1/2 relative bg-primary items-end p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            alt="Modern architectural villa in Nairobi" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4du5sza5RaEbLadMAOgXj1ANsAd6NwAP_yF1QXxsvI4KJ7yKMAVF0CoMGJSj0SnmrncEFkKwsnHOSx5xT6aXLjWYqe_vTxAMXztmT0VZdgJeZLQxLwoFbsiHvuWbo4cq3FElM1BLxCuokJNj5ZYqAnbMzWjM7ShCdD4IIxD9eRUdspHQaFsh1pkjiYb6HlGqzza0Ak2NTqIi-YV2zWrck95IoKbZRqiIWzkJHfjV1WzYYTIn4fuorBJlMo_BoRPesXU1mYlyHHpI"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-12 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-medium">
            <span className="material-symbols-outlined mr-2 text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            Your Personal Curator Awaits
          </div>
          <h2 className="font-headline text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Finding home is now as simple as a <span className="text-secondary-fixed">conversation.</span>
          </h2>
          <p className="text-primary-fixed/80 text-lg mb-10 leading-relaxed font-light">
            Experience the future of Kenyan real estate. Our AI curator filters through verified listings to find exactly what matches your lifestyle.
          </p>
        </div>
      </section>
    </main>
  );
}
