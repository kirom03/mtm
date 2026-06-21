import React, { useState, useEffect } from 'react';
import { 
  MapPin, User, Car, Bike, Package, BookOpen, Eye, 
  Star, MessageSquare, Check, X, Camera, FileSpreadsheet, 
  Trash2, Edit, AlertCircle, LogOut, ChevronRight, Send, Map, Settings, Download, UserCog
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_DRIVERS = [
  { id: 1, name: 'Budi Santoso', vehicle: 'Honda Vario - AG 1234 XY', rating: 4.8, lat: -8.06, lng: 111.90, img: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Agus Motor', vehicle: 'Yamaha NMAX - AG 5678 ZA', rating: 4.9, lat: -8.07, lng: 111.91, img: 'https://i.pravatar.cc/150?u=2' },
];

const MOCK_REPORTS = [
  { id: 'ORD-001', driver: 'Budi Santoso', service: 'Antar Makanan', status: 'Selesai', ongkir: 15000, kas: 1500 },
  { id: 'ORD-002', driver: 'Agus Motor', service: 'Jasa Umum', status: 'Selesai', ongkir: 50000, kas: 5000 },
  { id: 'ORD-003', driver: 'Budi Santoso', service: 'Joki Tugas', status: 'Selesai', ongkir: 30000, kas: 3000 },
];

// --- HELPER FUNCTION: EXPORT TO CSV ---
const downloadCSV = (data, filename) => {
  const csvRows = [];
  // Ambil Header (Keys)
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  
  // Format Data per baris
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// --- KOMPONEN PENGUNGGAH GAMBAR (Bisa Preview) ---
const ImageUploader = ({ label, icon: Icon, value, onChange, containerClass, iconClass }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange(previewUrl);
    }
  };

  return (
    <label className={`relative overflow-hidden cursor-pointer flex flex-col items-center justify-center group ${containerClass}`}>
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value && <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 group-hover:opacity-20 transition-opacity" />}
      <div className="z-10 flex flex-col items-center justify-center gap-1 pointer-events-none">
        {value ? <Check className={`text-green-500 ${iconClass}`} /> : <Icon className={iconClass} />}
        <span className={`text-center font-bold text-xs ${value ? 'text-green-500' : 'text-zinc-400 group-hover:text-yellow-500'}`}>{value ? 'Terunggah' : label}</span>
      </div>
    </label>
  );
};

// --- MODAL PROFIL (Bisa Edit/Upload Foto Profil) ---
const ProfileModal = ({ user, onClose, onLogout, onSave }) => {
  const [photo, setPhoto] = useState(user.img || null);
  const [name, setName] = useState(user.name || '');
  
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col p-4 animate-in fade-in duration-300 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2 className="text-xl font-bold text-yellow-500">Profil & Pengaturan</h2>
        <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
      </div>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex flex-col items-center shadow-2xl">
        <ImageUploader label="Ubah Foto" icon={Camera} value={photo} onChange={setPhoto} containerClass="w-32 h-32 rounded-full border-2 border-zinc-600 bg-zinc-800 hover:border-yellow-500 shadow-lg transition-all" iconClass="w-8 h-8 text-zinc-500 transition-colors"/>
        <div className="w-full space-y-4 mt-6">
           <div>
             <label className="text-xs text-zinc-400 mb-1 block font-bold">Nama Lengkap</label>
             <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-yellow-500 transition-colors" />
           </div>
           <div>
             <label className="text-xs text-zinc-400 mb-1 block font-bold">Ubah Password</label>
             <input type="password" placeholder="Kosongkan jika tidak diubah" className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white outline-none focus:border-yellow-500 transition-colors" />
           </div>
           <button onClick={() => onSave({ ...user, name, img: photo })} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 mt-4 shadow-lg transition-colors">Simpan Profil</button>
           <button onClick={onLogout} className="w-full bg-transparent text-red-500 font-bold py-3 rounded-xl hover:bg-red-900/30 transition-colors flex justify-center items-center gap-2 mt-2 border border-red-900/50"><LogOut className="w-4 h-4"/> Logout Keluar</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [currentView, setCurrentView] = useState('login'); 
  const [showProfile, setShowProfile] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  
  const forceLogin = (role) => {
    setCurrentUser({ 
      role, 
      name: `Demo ${role}`, 
      location: 'Tulungagung',
      img: role === 'driver' ? 'https://i.pravatar.cc/150?u=10' : null 
    });
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {isDevOpen && (
          <div className="bg-zinc-800 p-3 rounded-xl border border-yellow-500 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-bottom-2">
            <span className="text-xs text-yellow-500 font-bold text-center border-b border-yellow-500/30 pb-1 mb-1">Dev Panel</span>
            <button onClick={() => {forceLogin('user'); setIsDevOpen(false)}} className="text-xs bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 transition-colors">Login User</button>
            <button onClick={() => {forceLogin('driver'); setIsDevOpen(false)}} className="text-xs bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 transition-colors">Login Driver</button>
            <button onClick={() => {forceLogin('admin'); setIsDevOpen(false)}} className="text-xs bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 transition-colors">Login Admin</button>
            <button onClick={() => {forceLogin('superadmin'); setIsDevOpen(false)}} className="text-xs bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600 transition-colors">Login SuperAdmin</button>
            <button onClick={() => {setCurrentUser(null); setCurrentView('login'); setIsDevOpen(false)}} className="text-xs bg-red-900 px-4 py-2 rounded hover:bg-red-800 transition-colors">Logout</button>
          </div>
        )}
        <button onClick={() => setIsDevOpen(!isDevOpen)} className={`p-3 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-colors border ${isDevOpen ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-zinc-800 text-yellow-500 border-zinc-600 hover:border-yellow-500'}`}>
          {isDevOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
        </button>
      </div>

      {!currentUser && currentView === 'login' && <LoginView setView={setCurrentView} doLogin={forceLogin} />}
      {!currentUser && currentView === 'register' && <RegisterView setView={setCurrentView} />}
      
      {currentUser && (
        <div className="max-w-md mx-auto bg-zinc-900 min-h-screen shadow-2xl relative pb-20 border-x border-zinc-800 overflow-x-hidden">
          <TopNav user={currentUser} onOpenProfile={() => setShowProfile(true)} />
          
          {showProfile && (
            <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onSave={(updatedUser) => { setCurrentUser(updatedUser); setShowProfile(false); }} onLogout={() => { setCurrentUser(null); setCurrentView('login'); setShowProfile(false); }} />
          )}
          
          <div className="p-4">
            {currentUser.role === 'user' && <UserFlow />}
            {currentUser.role === 'driver' && <DriverFlow />}
            {currentUser.role === 'admin' && <AdminFlow />}
            {currentUser.role === 'superadmin' && <SuperAdminFlow />}
          </div>
        </div>
      )}
    </div>
  );
}

const TopNav = ({ user, onOpenProfile }) => (
  <div className="bg-black p-4 flex justify-between items-center border-b border-yellow-500/30 sticky top-0 z-40">
    <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenProfile}>
      {user.img ? (
        <img src={user.img} alt="Profile" className="w-10 h-10 rounded-full border border-yellow-500 object-cover" />
      ) : (
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-lg">
          {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
        </div>
      )}
      <div>
        <h1 className="font-bold text-yellow-500 text-sm">Mas Tulung Mas</h1>
        <p className="text-xs text-zinc-400 capitalize">{user.role} - {user.name.split(' ')[0]}</p>
      </div>
    </div>
    <div className="flex gap-3">
      <Settings onClick={onOpenProfile} className="w-5 h-5 text-zinc-500 cursor-pointer hover:text-yellow-500 transition-colors" />
    </div>
  </div>
);

const LoginView = ({ setView, doLogin }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-yellow-500/50 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-zinc-800 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
        <Bike className="w-12 h-12 text-black" />
      </div>
      <h1 className="text-3xl font-black text-yellow-500 mb-2">MAS TULUNG MAS</h1>
      <p className="text-zinc-400 mb-8">Aplikasi Layanan Masyarakat Tulungagung</p>
      <div className="space-y-4">
        <input type="email" placeholder="Email" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none transition-colors text-white" />
        <input type="password" placeholder="Password" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none transition-colors text-white" />
        <button onClick={() => doLogin('user')} className="w-full bg-yellow-500 text-black font-bold p-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg">LOGIN SEKARANG</button>
      </div>
      <p className="mt-6 text-zinc-400 text-sm">Belum punya akun? <span onClick={() => setView('register')} className="text-yellow-500 cursor-pointer font-bold hover:underline">Daftar disini</span></p>
    </div>
  </div>
);

const RegisterView = ({ setView }) => {
  const [type, setType] = useState('user');
  const [driverPhotos, setDriverPhotos] = useState({ diri: null, ktp: null, sim: null });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-yellow-500/50 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-yellow-500 mb-6 text-center">Daftar Akun Baru</h2>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setType('user')} className={`flex-1 p-2 rounded-lg font-bold transition-all ${type === 'user' ? 'bg-yellow-500 text-black shadow-md' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Customer</button>
          <button onClick={() => setType('driver')} className={`flex-1 p-2 rounded-lg font-bold transition-all ${type === 'driver' ? 'bg-yellow-500 text-black shadow-md' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Mitra Driver</button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Nama Lengkap" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none text-white transition-colors" />
          <input type="email" placeholder="Gmail Aktif" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none text-white transition-colors" />
          <input type="password" placeholder="Password" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none text-white transition-colors" />
          {type === 'driver' && (
            <div className="space-y-4 pt-4 border-t border-zinc-700 animate-in fade-in duration-300">
              <p className="text-sm text-yellow-500 font-semibold">Data Tambahan Mitra:</p>
              <input type="text" placeholder="Nomor HP / WA" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none text-white transition-colors" />
              <input type="text" placeholder="Informasi Kendaraan (ex: Vario Merah AG 123)" className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 focus:border-yellow-500 outline-none text-white transition-colors" />
              <div className="grid grid-cols-2 gap-2">
                <ImageUploader label="Foto Diri" icon={Camera} value={driverPhotos.diri} onChange={(val) => setDriverPhotos({...driverPhotos, diri: val})} containerClass="bg-zinc-800 p-3 rounded-lg border border-zinc-700 h-24 hover:border-yellow-500 transition-colors" iconClass="w-5 h-5 text-zinc-400" />
                <ImageUploader label="Foto KTP" icon={Camera} value={driverPhotos.ktp} onChange={(val) => setDriverPhotos({...driverPhotos, ktp: val})} containerClass="bg-zinc-800 p-3 rounded-lg border border-zinc-700 h-24 hover:border-yellow-500 transition-colors" iconClass="w-5 h-5 text-zinc-400" />
                <ImageUploader label="Foto SIM" icon={Camera} value={driverPhotos.sim} onChange={(val) => setDriverPhotos({...driverPhotos, sim: val})} containerClass="col-span-2 bg-zinc-800 p-3 rounded-lg border border-zinc-700 h-24 hover:border-yellow-500 transition-colors" iconClass="w-5 h-5 text-zinc-400" />
              </div>
            </div>
          )}
          <button onClick={() => setView('login')} className="w-full bg-yellow-500 text-black font-bold p-3 rounded-lg hover:bg-yellow-400 mt-4 transition-colors shadow-lg">DAFTAR SEKARANG</button>
          <button onClick={() => setView('login')} className="w-full bg-transparent text-zinc-400 font-bold p-3 rounded-lg hover:text-white transition-colors">Kembali ke Login</button>
        </div>
      </div>
    </div>
  );
};

// --- USER FLOW ---
const UserFlow = () => {
  const [step, setStep] = useState('home'); 
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [agreedPrice, setAgreedPrice] = useState(0); 
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  if (step === 'home') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><MapPin className="text-yellow-500 w-5 h-5"/> Pilih Lokasi Anda</h2>
          <div className="grid grid-cols-3 gap-2">
            {['Tulungagung', 'Kediri', 'Trenggalek'].map(loc => (
              <button key={loc} onClick={() => setLocation(loc)} className={`p-2 text-sm rounded-lg font-bold transition-all duration-300 ${location === loc ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-yellow-500'}`}>{loc}</button>
            ))}
          </div>
        </div>
        <div className={`transition-all duration-500 ${location ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-4'}`}>
          <h2 className="text-lg font-bold text-white mb-3 border-t border-zinc-800 pt-6">Layanan Kami</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {id: 'makanan', name: 'Antar Makanan', icon: Package},
              {id: 'orang', name: 'Antar Orang', icon: Car},
              {id: 'umum', name: 'Jasa Umum', icon: MapPin},
              {id: 'tugas', name: 'Joki Tugas', icon: BookOpen},
              {id: 'mata', name: 'Mata-Mata', icon: Eye}, 
            ].map(srv => (
              <button key={srv.id} onClick={() => { setService(srv.name); setStep('map'); }} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex flex-col items-center justify-center gap-2 hover:border-yellow-500 hover:text-yellow-500 transition-all hover:-translate-y-1 shadow-lg group">
                <srv.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-center">{srv.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'map') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setStep('home')} className="text-zinc-400 text-sm flex items-center mb-2 hover:text-white transition-colors">{'< Kembali'}</button>
        <div className="bg-zinc-800 h-64 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-700 shadow-inner">
          <Map className="w-32 h-32 text-zinc-700 opacity-30 absolute" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-bounce"><Car className="w-4 h-4 text-black"/></div>
          <div className="absolute top-2/3 left-2/3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"><Bike className="w-4 h-4 text-black"/></div>
          <div className="absolute top-2 bg-black/80 text-yellow-500 px-4 py-1.5 rounded-full text-xs border border-yellow-500/30">Mencari di {location}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep('chat')} className="flex-1 bg-yellow-500 text-black font-bold p-3 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:bg-yellow-400 transition-colors">Pilih Terdekat Otomatis</button>
        </div>
        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-bold text-zinc-400">Atau Pilih Driver Tersedia:</h3>
          {MOCK_DRIVERS.map(drv => (
            <div key={drv.id} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 flex items-center gap-3 hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => setStep('chat')}>
              <img src={drv.img} alt="driver" className="w-12 h-12 rounded-full border-2 border-zinc-600" />
              <div className="flex-1">
                <h4 className="font-bold text-white">{drv.name}</h4>
                <p className="text-xs text-zinc-400">{drv.vehicle}</p>
                <div className="flex items-center text-yellow-500 text-xs mt-1"><Star className="w-3 h-3 fill-current mr-1" /> {drv.rating}</div>
              </div>
              <button className="bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 hover:text-black transition-colors">Pilih</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'chat') {
    return <ChatInterface onDeal={(price) => { setAgreedPrice(price); setStep('track'); }} onCancel={() => { setStep('home'); setLocation(''); }} />
  }

  if (step === 'track') {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-yellow-500/10 border border-yellow-500 p-4 rounded-xl text-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <h2 className="text-yellow-500 font-bold text-lg mb-1 flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>Live Tracking Berjalan</h2>
          <p className="text-xs text-zinc-400 mb-2">Pesanan tidak dapat dibatalkan karena sudah DEAL.</p>
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-lg p-2 inline-block">
             <span className="text-xs text-zinc-400">Ongkir Disepakati: </span>
             <span className="text-sm font-bold text-yellow-500">Rp {agreedPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="bg-zinc-800 h-64 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-700 shadow-inner">
           <Map className="w-32 h-32 text-zinc-700 opacity-20 absolute" />
           <div className="absolute w-full h-1 bg-zinc-700 top-1/2 transform -translate-y-1/2 overflow-hidden"><div className="h-full bg-yellow-500 w-2/3 rounded-r-full transition-all duration-1000"></div></div>
           <div className="absolute left-[10%] w-4 h-4 bg-blue-500 rounded-full border-2 border-black"></div>
           <div className="absolute left-[66%] w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center z-10 animate-bounce shadow-xl"><Bike className="w-4 h-4 text-black"/></div>
        </div>
        <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <img src={MOCK_DRIVERS[0].img} alt="driver" className="w-12 h-12 rounded-full" />
            <div>
              <h4 className="font-bold text-white">{MOCK_DRIVERS[0].name}</h4>
              <p className="text-xs text-zinc-400">{MOCK_DRIVERS[0].vehicle}</p>
            </div>
          </div>
          <button className="bg-zinc-700 p-3 rounded-full hover:bg-yellow-500 hover:text-black transition-colors"><MessageSquare className="w-5 h-5"/></button>
        </div>
        <button onClick={() => setStep('rate')} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] mt-8 transition-colors">SIMULASI: Driver Menyelesaikan Pesanan</button>
      </div>
    );
  }

  if (step === 'rate') {
    return (
      <div className="text-center space-y-6 pt-10 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]"><Check className="w-12 h-12" /></div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Pesanan Selesai!</h2>
          <p className="text-zinc-400 text-sm">Bagaimana pelayanan driver kami?</p>
        </div>
        <div className="flex justify-center gap-2">
          {[1,2,3,4,5].map(star => (
             <Star key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className={`w-12 h-12 cursor-pointer transition-all duration-300 ${star <= (hoverRating || rating) ? 'text-yellow-500 fill-current drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110' : 'text-zinc-600 hover:text-yellow-500/50'}`} />
          ))}
        </div>
        <textarea placeholder="Tambahkan komentar opsional..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-sm min-h-[100px] outline-none focus:border-yellow-500 text-white transition-colors"></textarea>
        <button onClick={() => {setStep('home'); setLocation(''); setRating(0);}} className="w-full bg-yellow-500 text-black font-bold p-4 rounded-xl shadow-lg hover:bg-yellow-400 transition-colors">Kirim Penilaian & Kembali</button>
      </div>
    );
  }
};

const DriverFlow = () => {
  const [isReady, setIsReady] = useState(false);
  const [step, setStep] = useState('dashboard'); 
  const [agreedPrice, setAgreedPrice] = useState(0); 
  const [proofPhoto, setProofPhoto] = useState(null);
  const [transferPhoto, setTransferPhoto] = useState(null);

  if (step === 'dashboard') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 flex flex-col items-center shadow-lg relative overflow-hidden">
          {isReady && <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${isReady ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] bg-green-900/20' : 'border-zinc-600 bg-zinc-900'} mb-4 transition-all duration-500 z-10`}>
            <Bike className={`w-10 h-10 ${isReady ? 'text-green-500' : 'text-zinc-600'} transition-colors duration-500`} />
          </div>
          <h2 className="text-xl font-bold text-white mb-4 z-10">{isReady ? 'Sedang Online & Siap' : 'Sedang Offline'}</h2>
          <button onClick={() => setIsReady(!isReady)} className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 z-10 ${isReady ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-yellow-500 text-black hover:bg-yellow-400 scale-105'}`}>
            {isReady ? 'Matikan Status' : 'Mulai Narik'}
          </button>
        </div>
        <div className={`space-y-4 transition-opacity duration-300 ${isReady ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <div>
            <h3 className="font-bold text-yellow-500 text-sm mb-2">Area Operasi:</h3>
            <select className="w-full bg-zinc-800 p-3 rounded-lg border border-zinc-700 text-white outline-none focus:border-yellow-500 transition-colors">
              <option>Tulungagung</option>
              <option>Kediri</option>
              <option>Trenggalek</option>
            </select>
          </div>
          <div>
            <h3 className="font-bold text-yellow-500 text-sm mb-2">Jasa Aktif:</h3>
            <div className="space-y-2">
              {['Antar Makanan', 'Antar Orang', 'Jasa Umum', 'Joki Tugas', 'Mata-Mata'].map((jasa, i) => (
                <label key={i} className="flex items-center gap-3 bg-zinc-800 p-3 rounded-lg border border-zinc-700 cursor-pointer hover:border-zinc-500 transition-colors">
                  <input type="checkbox" defaultChecked={i < 2} className="w-5 h-5 accent-yellow-500 rounded" /><span className="text-sm font-medium">{jasa}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {isReady && (
          <button onClick={() => setStep('order_incoming')} className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]">SIMULASI: Ada Order Masuk!</button>
        )}
        <div className="pt-4 border-t border-zinc-800">
           <button onClick={() => setStep('kas')} className="w-full bg-zinc-800 p-4 rounded-xl flex items-center justify-between border border-zinc-700 hover:border-yellow-500 transition-colors group shadow-md">
             <div className="flex items-center gap-3"><FileSpreadsheet className="text-yellow-500 group-hover:scale-110 transition-transform" /><span className="font-bold">Laporan Kas Harian</span></div>
             <ChevronRight className="text-zinc-500 group-hover:text-yellow-500 transition-colors" />
           </button>
        </div>
      </div>
    );
  }

  if (step === 'order_incoming') {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-yellow-500 p-6 text-center space-y-6 shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-xl"><Package className="w-12 h-12 text-black" /></div>
          <div><h2 className="text-3xl font-black text-white mb-1">ORDER BARU!</h2><p className="text-yellow-500 font-bold text-lg">Antar Makanan</p></div>
          <div className="text-left bg-zinc-800 p-4 rounded-lg border border-zinc-700 space-y-2 text-sm shadow-inner">
             <p className="flex justify-between border-b border-zinc-700 pb-2"><span className="text-zinc-400">Customer:</span> <span className="font-bold text-white">Bos Besar</span></p>
             <p className="flex justify-between"><span className="text-zinc-400">Jarak Jemput:</span> <span className="font-bold text-yellow-500">2.5 km</span></p>
          </div>
          <div className="flex gap-3 pt-2">
             <button onClick={() => setStep('dashboard')} className="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-bold border border-zinc-700 hover:bg-red-900 hover:border-red-500 transition-colors">Tolak</button>
             <button onClick={() => setStep('chat')} className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-green-400 transition-colors">Terima</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'chat') {
    return <ChatInterface onDeal={(price) => { setAgreedPrice(price); setStep('active'); }} isDriver={true} />
  }

  if (step === 'active') {
    return (
       <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-green-500/10 border border-green-500 p-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <h2 className="text-green-500 font-bold text-lg mb-1 flex items-center gap-2"><Check className="w-5 h-5"/> Status: Sedang Berjalan</h2>
            <p className="text-xs text-zinc-400">Kesepakatan Ongkir: <strong className="text-white">Rp {agreedPrice.toLocaleString('id-ID')}</strong></p>
            <p className="text-xs text-yellow-500 mt-1 font-medium">Potongan Kas (10%): Rp {(agreedPrice * 0.1).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-zinc-800 h-48 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-700 shadow-inner">
             <Map className="w-20 h-20 text-zinc-700 opacity-40 mb-2" />
             <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-500 rounded-full border border-black"></div>
             <div className="absolute top-1/2 left-3/4 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse shadow-lg"><Bike className="w-3 h-3 text-black"/></div>
             <div className="absolute w-1/2 h-1 bg-zinc-700 top-1/2 left-1/4"></div>
             <div className="absolute bottom-2 text-xs font-medium text-yellow-500 bg-black/60 px-3 py-1 rounded-full border border-yellow-500/30">Tracking Navigasi Aktif</div>
          </div>
          <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 shadow-lg">
             <h3 className="font-bold text-white mb-2 text-sm flex items-center gap-2"><Camera className="text-yellow-500 w-4 h-4"/> Bukti Penyelesaian Order</h3>
             <p className="text-xs text-zinc-400 mb-4">Harap unggah foto bukti saat pesanan telah diantar atau tugas selesai.</p>
             <ImageUploader label="Unggah Foto Bukti Order" icon={Camera} value={proofPhoto} onChange={setProofPhoto} containerClass="w-full bg-zinc-900 border-2 border-dashed border-zinc-600 p-8 rounded-xl hover:border-yellow-500 transition-all mb-4" iconClass="w-10 h-10 mb-2 transition-transform" />
             <button disabled={!proofPhoto} onClick={() => { setStep('dashboard'); setProofPhoto(null); }} className={`w-full font-bold p-4 rounded-xl shadow-lg transition-all duration-300 ${proofPhoto ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
                {proofPhoto ? 'Selesaikan Order & Kembali' : 'Unggah Foto Bukti Dahulu'}
             </button>
          </div>
       </div>
    )
  }

  if (step === 'kas') {
    return (
      <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
        <button onClick={() => setStep('dashboard')} className="text-zinc-400 text-sm flex items-center mb-4 hover:text-white transition-colors">{'< Kembali'}</button>
        <div className="bg-zinc-800 p-8 rounded-xl border border-yellow-500/50 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><FileSpreadsheet className="w-24 h-24 text-yellow-500"/></div>
          <p className="text-zinc-400 text-sm mb-2 font-medium">Tagihan Kas Hari Ini (10%)</p>
          <h2 className="text-4xl font-black text-yellow-500 mb-2">Rp 12.500</h2>
          <p className="text-xs text-zinc-500 bg-zinc-900 inline-block px-3 py-1 rounded-full border border-zinc-700">Dari total 3 order (Rp 125.000)</p>
        </div>
        <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 space-y-4 shadow-lg">
          <div><h3 className="font-bold text-white text-sm mb-1">Instruksi Pembayaran</h3><p className="text-xs text-zinc-400 leading-relaxed">Transfer sesuai nominal di atas ke rekening <strong className="text-white">BCA 123456789</strong> a.n Mas Tulung Mas. Pastikan nominal sesuai.</p></div>
          <ImageUploader label="Upload Bukti Transfer Kas" icon={Camera} value={transferPhoto} onChange={setTransferPhoto} containerClass="w-full bg-zinc-900 border-2 border-dashed border-zinc-600 p-6 rounded-xl hover:border-yellow-500 transition-colors" iconClass="w-8 h-8 mb-2" />
          <button disabled={!transferPhoto} onClick={() => { setStep('dashboard'); setTransferPhoto(null); }} className={`w-full font-bold p-4 rounded-xl shadow-lg transition-all duration-300 ${transferPhoto ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
             {transferPhoto ? 'Konfirmasi Setoran' : 'Unggah Bukti Dahulu'}
          </button>
        </div>
      </div>
    )
  }
};

const AdminFlow = () => {
  const [tab, setTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState(null); 

  // Fitur Download Laporan Kas CSV
  const handleDownloadExcel = () => {
    downloadCSV(MOCK_REPORTS, 'Laporan_Kas_Order_MTM');
    alert('Mockup file laporan berhasil diunduh!'); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => setTab('dashboard')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${tab === 'dashboard' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Dashboard</button>
        <button onClick={() => setTab('drivers')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${tab === 'drivers' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Kelola Driver</button>
        <button onClick={() => setTab('reports')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${tab === 'reports' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Laporan Order</button>
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-zinc-800 p-6 rounded-xl border border-yellow-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-500/10 p-3 rounded-full"><FileSpreadsheet className="text-yellow-500 w-6 h-6"/></div>
            <h3 className="text-zinc-400 text-sm mb-2 font-medium">Pemasukan Kas (Bulan Ini)</h3>
            <div className="text-4xl font-black text-yellow-500 mb-6">Rp 4.500.000</div>
            
            {/* Download Data Action */}
            <button onClick={handleDownloadExcel} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20">
               <Download className="w-5 h-5"/> Unduh Data Excel / CSV
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 shadow-md flex flex-col justify-center">
              <h3 className="text-zinc-400 text-xs mb-1 font-medium">Total Driver Aktif</h3>
              <div className="text-2xl font-bold text-white flex items-center gap-2"><Bike className="w-5 h-5 text-zinc-500"/> 45</div>
            </div>
            <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 shadow-md flex flex-col justify-center">
              <h3 className="text-zinc-400 text-xs mb-1 font-medium">Order Selesai (Harian)</h3>
              <div className="text-2xl font-bold text-green-500 flex items-center gap-2"><Check className="w-5 h-5"/> 128</div>
            </div>
            <div className="col-span-2 bg-zinc-800 p-5 rounded-xl border border-red-900/30 shadow-md flex justify-between items-center">
              <div>
                <h3 className="text-zinc-400 text-xs mb-1 font-medium">Order Cancel (Harian)</h3>
                <div className="text-2xl font-bold text-red-500">3 Order</div>
              </div>
              <X className="w-8 h-8 text-red-500/20" />
            </div>
          </div>
        </div>
      )}

      {tab === 'drivers' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white text-sm">Daftar Mitra Driver</h3>
            <input type="text" placeholder="Cari nama..." className="bg-zinc-900 border border-zinc-700 text-xs px-3 py-1.5 rounded-full text-white outline-none focus:border-yellow-500"/>
          </div>
          {MOCK_DRIVERS.map(drv => (
            <div key={drv.id} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <img src={drv.img} className="w-12 h-12 rounded-full border border-zinc-600 object-cover" alt="driver" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{drv.name}</h4>
                    <p className="text-xs text-zinc-400 mb-1">{drv.vehicle}</p>
                    <div className="flex items-center text-yellow-500 text-xs font-bold bg-yellow-500/10 px-2 py-0.5 rounded w-fit">
                      <Star className="w-3 h-3 fill-current mr-1" /> {drv.rating}
                    </div>
                  </div>
                </div>
                <span className="bg-green-500/10 border border-green-500/30 text-green-500 px-3 py-1 rounded-full text-xs font-bold">Aktif</span>
              </div>
              <div className="flex gap-2 border-t border-zinc-700 pt-3">
                <button className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"><Edit className="w-3 h-3"/> Edit</button>
                <button className="flex-1 bg-orange-900/30 hover:bg-orange-900/50 text-orange-500 border border-orange-900/50 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"><AlertCircle className="w-3 h-3"/> Suspend</button>
                <button className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-500 border border-red-900/50 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"><Trash2 className="w-3 h-3"/> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
           <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 flex justify-between items-center shadow-md">
             <span className="text-sm font-bold text-white flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-yellow-500"/> Filter Data:</span>
             <select className="bg-zinc-900 border border-zinc-600 text-xs p-1.5 rounded text-white outline-none focus:border-yellow-500">
               <option>Hari Ini</option>
               <option>Minggu Ini</option>
               <option>Bulan Ini</option>
             </select>
           </div>
           
           {MOCK_REPORTS.map((rep, i) => (
             <div key={i} className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 text-sm shadow-md hover:border-zinc-500 transition-colors">
               <div className="flex justify-between border-b border-zinc-700 pb-3 mb-3 items-center">
                 <span className="font-black text-yellow-500 text-base">{rep.id}</span>
                 <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold border border-green-500/30">{rep.status}</span>
               </div>
               <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-zinc-300">
                 <div><p className="text-zinc-500 text-xs mb-0.5">Driver</p><p className="font-medium text-white">{rep.driver}</p></div>
                 <div><p className="text-zinc-500 text-xs mb-0.5">Layanan</p><p className="font-medium text-white">{rep.service}</p></div>
                 <div><p className="text-zinc-500 text-xs mb-0.5">Ongkir Final</p><p className="font-medium text-white">Rp {rep.ongkir.toLocaleString('id-ID')}</p></div>
                 <div><p className="text-yellow-500 text-xs mb-0.5 font-bold">Kas (10%)</p><p className="font-black text-yellow-500">Rp {rep.kas.toLocaleString('id-ID')}</p></div>
               </div>
               <button onClick={() => setSelectedReport(rep)} className="w-full mt-4 bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 py-2.5 rounded-lg text-xs font-bold text-white transition-colors flex justify-center items-center gap-2">
                 <Camera className="w-4 h-4 text-zinc-400"/> Lihat Detail & Foto Bukti
               </button>
             </div>
           ))}
        </div>
      )}

      {/* MODAL: DETAIL LAPORAN ORDER */}
      {selectedReport && (
         <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-yellow-500/50 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
               <div className="flex justify-between items-center border-b border-zinc-700 pb-3">
                  <h3 className="font-bold text-yellow-500 text-lg">Detail Order: {selectedReport.id}</h3>
                  <button onClick={() => setSelectedReport(null)} className="p-1 hover:text-white text-zinc-400 transition-colors"><X/></button>
               </div>
               
               <div className="w-full h-48 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 relative flex items-center justify-center group">
                  <img src={`https://placehold.co/600x400/27272a/eab308?text=Bukti+Foto+${selectedReport.id}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Bukti Selesai" />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-bold text-yellow-500 flex items-center gap-1"><Check className="w-3 h-3"/> Terverifikasi</div>
               </div>

               <div className="space-y-3 text-sm text-zinc-300 bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                  <p className="flex justify-between"><span className="text-zinc-500">Driver:</span> <span className="font-bold text-white">{selectedReport.driver}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Layanan:</span> <span className="font-bold text-white">{selectedReport.service}</span></p>
                  <p className="flex justify-between"><span className="text-zinc-500">Ongkir:</span> <span className="font-bold text-white">Rp {selectedReport.ongkir.toLocaleString('id-ID')}</span></p>
                  <div className="border-t border-zinc-700 pt-2 mt-2"></div>
                  <p className="flex justify-between text-base"><span className="text-yellow-500 font-bold">Potongan Kas Masuk:</span> <span className="font-black text-yellow-500">Rp {selectedReport.kas.toLocaleString('id-ID')}</span></p>
               </div>

               <button onClick={() => setSelectedReport(null)} className="w-full bg-yellow-500 text-black font-bold p-3.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg">Tutup Detail</button>
            </div>
         </div>
      )}
    </div>
  )
}

const SuperAdminFlow = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-red-900/20 border border-red-500 p-6 rounded-xl text-center shadow-[0_0_20px_rgba(239,68,68,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <h2 className="text-red-500 font-black text-2xl tracking-wider mb-1">SUPER ADMIN</h2>
        <p className="text-xs text-red-300 font-medium">Akses Penuh Keseluruhan Sistem MTM</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 hover:border-yellow-500 hover:bg-zinc-700 text-left transition-all shadow-md group">
          <User className="text-yellow-500 mb-3 w-7 h-7 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white text-sm mb-1">Kelola Akun User</h3>
          <p className="text-xs text-zinc-500">CRUD Data Customer</p>
        </button>
        <button className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 hover:border-yellow-500 hover:bg-zinc-700 text-left transition-all shadow-md group">
          <Bike className="text-yellow-500 mb-3 w-7 h-7 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white text-sm mb-1">Kelola Akun Driver</h3>
          <p className="text-xs text-zinc-500">Verifikasi & CRUD</p>
        </button>
        <button className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 hover:border-red-500 hover:bg-zinc-700 text-left transition-all shadow-md group">
          <UserCog className="text-red-500 mb-3 w-7 h-7 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white text-sm mb-1">Manajemen Admin</h3>
          <p className="text-xs text-zinc-500">Buat/Hapus Akun Admin</p>
        </button>
        <button className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 hover:border-orange-500 hover:bg-zinc-700 text-left transition-all shadow-md group">
          <AlertCircle className="text-orange-500 mb-3 w-7 h-7 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white text-sm mb-1">Log Error Sistem</h3>
          <p className="text-xs text-zinc-500">Pantau bug aplikasi</p>
        </button>
      </div>

      <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 shadow-lg">
        <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-zinc-400"/> Laporan Error Terkini (Realtime)</h3>
        <div className="space-y-3">
          <div className="bg-zinc-900 p-3 rounded-lg border-l-4 border-l-red-500 border-y border-r border-zinc-800 text-xs shadow-inner">
            <div className="flex justify-between mb-1"><span className="text-red-500 font-bold">[API_ERR_MAPS]</span> <span className="text-zinc-500">20:45 WIB</span></div>
            <p className="text-zinc-300">Gagal memuat API Google Maps di area Kediri. Response timeout.</p>
          </div>
          <div className="bg-zinc-900 p-3 rounded-lg border-l-4 border-l-orange-500 border-y border-r border-zinc-800 text-xs shadow-inner">
            <div className="flex justify-between mb-1"><span className="text-orange-500 font-bold">[WARN_LATENCY]</span> <span className="text-zinc-500">18:30 WIB</span></div>
            <p className="text-zinc-300">Keterlambatan respon database (latency &gt; 500ms) saat sinkronisasi kas.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ChatInterface = ({ onDeal, onCancel, isDriver = false }) => {
  const MIN_PRICE = 7000;
  
  const [messages, setMessages] = useState([
    { text: `Sistem: Memulai fitur negosiasi harga. Minimal Ongkir adalah Rp ${MIN_PRICE.toLocaleString('id-ID')}`, sender: 'system' }
  ]);
  const [textInput, setTextInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [proposedPrice, setProposedPrice] = useState(0); 
  const [isDeal, setIsDeal] = useState(false);
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ price: 0, role: '', type: '' });

  const sendTextMessage = () => {
    if (!textInput.trim()) return;
    setMessages([...messages, { text: textInput, sender: 'me' }]);
    setTextInput('');
  };

  const sendPriceProposal = () => {
    const numericPrice = parseInt(priceInput);
    if (!numericPrice || numericPrice < MIN_PRICE) {
      setMessages(prev => [...prev, { text: `Sistem: Maaf, harga minimal adalah Rp ${MIN_PRICE.toLocaleString('id-ID')}`, sender: 'system' }]);
      setPriceInput('');
      return;
    }

    setProposedPrice(numericPrice);
    setMessages(prev => [...prev, { text: `Tawaran Ongkir: Rp ${numericPrice.toLocaleString('id-ID')}`, sender: 'me', isPrice: true }]);
    setPriceInput('');

    setTimeout(() => {
      const isAgree = Math.random() > 0.6; 
      const otherRole = isDriver ? 'Customer' : 'Driver';

      if (isAgree) {
         setPopupData({ price: numericPrice, role: otherRole, type: 'agreed' });
         setShowPopup(true);
      } else {
         let calcCounter = isDriver ? numericPrice - 2000 : numericPrice + 2000;
         if (calcCounter < MIN_PRICE) calcCounter = MIN_PRICE + 1000; 

         setProposedPrice(calcCounter);
         setMessages(prev => [...prev, { text: `Tawaran Ongkir: Rp ${calcCounter.toLocaleString('id-ID')}`, sender: 'other', isPrice: true }]);
         
         setPopupData({ price: calcCounter, role: otherRole, type: 'offer' });
         setShowPopup(true);
      }
    }, 1500);
  };

  const handlePopupAccept = () => {
     setShowPopup(false);
     setIsDeal(true);
     setMessages(prev => [...prev, { text: `Sistem: KESEPAKATAN HARGA (Rp ${popupData.price.toLocaleString('id-ID')}) telah disetujui kedua belah pihak!`, sender: 'system' }]);
     
     setTimeout(() => {
       onDeal(popupData.price); 
     }, 2500);
  };

  const handlePopupReject = () => {
     setShowPopup(false);
     setMessages(prev => [...prev, { text: `Sistem: Anda menolak tawaran Rp ${popupData.price.toLocaleString('id-ID')}. Silakan ajukan harga baru.`, sender: 'system' }]);
  };

  return (
    <div className="flex flex-col h-[85vh] bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
      
      {showPopup && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-zinc-900 border border-yellow-500 p-6 rounded-2xl w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
              <h3 className="text-xl font-black text-yellow-500 mb-2">
                 {popupData.type === 'agreed' ? 'DEAL DISEPAKATI!' : 'PENAWARAN BARU!'}
              </h3>
              <p className="text-zinc-300 mb-4 text-sm">
                 {popupData.role} {popupData.type === 'agreed' ? 'telah menyetujui harga' : 'mengajukan tawaran harga'}:
              </p>
              
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl py-4 mb-6 shadow-inner">
                 <div className="text-3xl font-black text-white">Rp {popupData.price.toLocaleString('id-ID')}</div>
              </div>

              <div className="flex gap-3">
                 {popupData.type === 'offer' ? (
                   <>
                      <button onClick={handlePopupReject} className="flex-1 bg-red-900 text-white font-bold py-3.5 rounded-xl hover:bg-red-800 transition-colors border border-red-500/50">Tolak & Nego Lagi</button>
                      <button onClick={handlePopupAccept} className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-500 transition-colors">Setujui Deal</button>
                   </>
                 ) : (
                   <button onClick={handlePopupAccept} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:bg-green-500 transition-colors flex justify-center items-center gap-2">
                     <Check className="w-5 h-5"/> Lanjutkan Perjalanan
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
            {isDriver ? <User className="w-5 h-5 text-white" /> : <Bike className="w-5 h-5 text-yellow-500" />}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{isDriver ? 'Customer (Bos Besar)' : 'Driver Mas Tulung Mas'}</h3>
            <p className="text-xs text-yellow-500 font-medium">Ruang Nego Ongkir</p>
          </div>
        </div>
        {!isDriver && !isDeal && (
           <button onClick={onCancel} className="text-xs bg-red-900/30 hover:bg-red-900/80 text-red-500 border border-red-500/50 px-3 py-1.5 rounded-lg transition-colors font-bold">Batalkan Order</button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/40 pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'system' ? 'justify-center' : msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${
              msg.sender === 'system' ? 'bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/30 rounded-full px-4 text-center font-medium' : 
              msg.sender === 'me' ? (msg.isPrice ? 'bg-green-600 text-white rounded-tr-sm font-bold border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-yellow-500 text-black rounded-tr-sm font-medium') : 
              'bg-zinc-800 text-white rounded-tl-sm border border-zinc-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isDeal && (
          <div className="text-center text-xs text-green-500 font-bold animate-pulse mt-6 bg-green-500/10 py-2 rounded-full border border-green-500/30">Menyimpan harga ke database... Meneruskan ke tracking...</div>
        )}
      </div>

      <div className="absolute bottom-0 w-full bg-zinc-800 border-t border-zinc-700 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-10">
        {!isDeal ? (
          <div className="flex flex-col gap-3 p-3">
             <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded-lg border border-yellow-500/30">
               <span className="text-xs text-zinc-400 font-medium">Harga Penawaran Terakhir:</span>
               <span className="text-sm font-black text-yellow-500">
                 {proposedPrice > 0 ? `Rp ${proposedPrice.toLocaleString('id-ID')}` : 'Belum ditentukan'}
               </span>
             </div>

             <div className="flex gap-2">
               <span className="bg-zinc-700 flex items-center justify-center px-4 rounded-xl text-sm font-bold text-zinc-300">Rp</span>
               <input 
                 type="number" 
                 value={priceInput}
                 onChange={(e) => setPriceInput(e.target.value)}
                 placeholder="Min. 7000" 
                 className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-yellow-500 transition-colors font-bold tracking-wider"
               />
               <button onClick={sendPriceProposal} className="bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-md">Ajukan Harga</button>
             </div>

             <div className="flex gap-2 border-t border-zinc-700 pt-3">
               <input 
                 type="text" 
                 value={textInput}
                 onChange={(e) => setTextInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                 placeholder="Ketik pesan biasa..." 
                 className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500 transition-colors"
               />
               <button onClick={sendTextMessage} className="bg-zinc-700 hover:bg-zinc-600 text-yellow-500 p-3 rounded-xl transition-colors"><Send className="w-5 h-5"/></button>
             </div>
          </div>
        ) : (
          <div className="text-center text-sm font-bold text-zinc-500 p-5 flex items-center justify-center gap-2 bg-zinc-900">
             <MapPin className="w-4 h-4"/> Fitur Nego Terkunci (Order Diproses)
          </div>
        )}
      </div>
    </div>
  )
}