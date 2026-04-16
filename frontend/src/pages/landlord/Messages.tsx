import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CONTACTS = [
  {
    id: 1,
    name: 'Sarah Kinuthia',
    lastMessage: 'That works! See you at 3 PM.',
    time: '2m ago',
    online: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
    property: 'The Horizon Estate, Suite 402',
    bookingId: '#SH-98210',
    status: 'Confirmed'
  },
  {
    id: 2,
    name: 'David Omari',
    lastMessage: 'Is the parking space covered?',
    time: '1h ago',
    online: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Amina Juma',
    lastMessage: 'Thank you for the prompt tour!',
    time: 'Yesterday',
    online: false,
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80',
  }
];

export default function Messages() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 bg-surface-container-low border-b border-outline-variant/10">
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tighter text-sky-900 leading-tight">Messages</h1>
          <p className="text-sm text-on-surface-variant font-medium">Coordinate viewings and bookings</p>
        </div>

        {/* Context Card: Property being discussed */}
        <div className="hidden lg:flex items-center bg-surface-container-lowest rounded-xl p-3 shadow-sm max-w-sm border border-outline-variant/10">
          <img 
            alt="Property Preview" 
            className="w-12 h-12 rounded-lg object-cover" 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
          />
          <div className="ml-3">
            <p className="text-xs font-bold text-sky-900 truncate">{selectedContact.property || 'Viewing Discussion'}</p>
            <p className="text-[10px] text-on-surface-variant">Booking ID: {selectedContact.bookingId || 'N/A'}</p>
          </div>
          <div className="ml-6 pl-6 border-l border-surface-container-high">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">{selectedContact.status || 'Inquiry'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-slate-100 p-2 rounded-full transition-colors">notifications</button>
          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-white font-bold">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Contact List */}
        <section className="w-80 bg-surface flex flex-col border-r border-outline-variant/10">
          <div className="p-6">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                className="w-full bg-surface-container-high border-none rounded-xl pl-10 py-3 text-sm focus:ring-2 focus:ring-primary/20" 
                placeholder="Search conversations..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {CONTACTS.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`px-6 py-4 cursor-pointer transition-colors border-l-4 ${
                  selectedContact.id === contact.id ? 'bg-surface-container-low border-primary' : 'border-transparent hover:bg-surface-container-low/50'
                }`}
              >
                <div className="flex items-start">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-outline-variant/10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-slate-200">{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className={`text-sm font-bold truncate ${selectedContact.id === contact.id ? 'text-sky-900' : 'text-on-surface'}`}>
                        {contact.name}
                      </h3>
                      <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{contact.time}</span>
                    </div>
                    <p className={`text-xs truncate ${selectedContact.id === contact.id ? 'text-sky-800 font-medium' : 'text-on-surface-variant'}`}>
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chat Window */}
        <section className="flex-1 bg-white flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
          {/* Top Bar */}
          <div className="px-8 py-4 bg-surface-container-low/30 backdrop-blur-md flex items-center justify-between border-b border-outline-variant/10">
            <div className="flex items-center">
              <div className="flex flex-col">
                <h2 className="text-base font-bold text-sky-900 leading-none">{selectedContact.name}</h2>
                <span className={`text-[11px] font-bold mt-1 ${selectedContact.online ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {selectedContact.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-surface-container-highest p-2 rounded-lg hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">videocam</span>
              </button>
              <button className="bg-surface-container-highest p-2 rounded-lg hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">call</span>
              </button>
              <button className="bg-surface-container-highest p-2 rounded-lg hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">more_vert</span>
              </button>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="flex justify-center">
              <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Today</span>
            </div>

            {/* Received */}
            <div className="flex items-start max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1 border border-outline-variant/10">
                <AvatarImage src={selectedContact.avatar} />
                <AvatarFallback className="bg-slate-200">SK</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="bg-secondary-container text-on-secondary-container px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm">Hi there! I was looking at the suite availability for this Saturday. Is 2 PM still open for a quick viewing?</p>
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 ml-1">10:42 AM</span>
              </div>
            </div>

            {/* Sent */}
            <div className="flex flex-row-reverse items-start max-w-[80%] ml-auto">
              <div className="mr-3 text-right">
                <div className="bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-md">
                  <p className="text-sm">Hello {selectedContact.name.split(' ')[0]}! Yes, 2 PM is available. I've blocked it off for you. Would you like the gate directions sent via M-Pesa contact?</p>
                </div>
                <div className="flex items-center justify-end mt-1 gap-1">
                  <span className="text-[10px] text-on-surface-variant">10:45 AM</span>
                  <span className="material-symbols-outlined text-[12px] text-primary">done_all</span>
                </div>
              </div>
            </div>

            {/* Received */}
            <div className="flex items-start max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1 border border-outline-variant/10">
                <AvatarImage src={selectedContact.avatar} />
                <AvatarFallback className="bg-slate-200">SK</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="bg-secondary-container text-on-secondary-container px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm">Actually, can we push it to 3 PM? I have a meeting that might run late.</p>
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 ml-1">10:48 AM</span>
              </div>
            </div>
            
            {/* Sent */}
            <div className="flex flex-row-reverse items-start max-w-[80%] ml-auto">
              <div className="mr-3 text-right">
                <div className="bg-primary text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-md text-left">
                  <p className="text-sm">{selectedContact.lastMessage}</p>
                </div>
                <div className="flex items-center justify-end mt-1 gap-1">
                  <span className="text-[10px] text-on-surface-variant">10:50 AM</span>
                  <span className="material-symbols-outlined text-[12px] text-primary">done_all</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-8 bg-white border-t border-outline-variant/10">
            <div className="flex items-end gap-3 bg-surface-container-low rounded-2xl p-2 pr-4 shadow-sm border border-transparent focus-within:border-primary/10 transition-all">
              <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-highest p-2 rounded-full text-[20px]">add</button>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 resize-none max-h-32" 
                placeholder="Type your message..." 
                rows={1}
              />
              <div className="flex items-center gap-2">
                <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-highest p-2 rounded-full text-[20px]">mood</button>
                <button className="bg-primary hover:opacity-90 text-white p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
