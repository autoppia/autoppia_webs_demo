"use client";

const categories = [
  { label: "Riders", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><rect x="3" y="11" width="34" height="21" rx="7" stroke="#222" strokeWidth="2"/><circle cx="12.5" cy="28.5" r="2.5" fill="#222"/><circle cx="27.5" cy="28.5" r="2.5" fill="#222"/></svg>
  ) },
  { label: "Driving & Delivering", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" stroke="#222" strokeWidth="2"/><path d="M13 28l4.2-8.6a3 3 0 0 1 2.7-1.7h4.2a3 3 0 0 1 2.7 1.7l4.2 8.6" stroke="#222" strokeWidth="2"/><circle cx="15.5" cy="28.5" r="2.5" fill="#222"/><circle cx="24.5" cy="28.5" r="2.5" fill="#222"/></svg>
  ) },
  { label: "Uber Eats", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><rect x="7" y="13" width="26" height="16" rx="4" stroke="#222" strokeWidth="2"/><rect x="9" y="18" width="8" height="4" rx="2" fill="#222"/><rect x="23" y="18" width="8" height="4" rx="2" fill="#222"/></svg>
  ) },
  { label: "Merchants & Restaurants", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><rect x="8" y="16" width="24" height="14" rx="4" stroke="#222" strokeWidth="2"/><rect x="12" y="19" width="4" height="7" fill="#222"/><rect x="24" y="19" width="4" height="7" fill="#222"/></svg>
  ) },
  { label: "Bikes & Scooters", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><circle cx="13" cy="27" r="3" stroke="#222" strokeWidth="2"/><circle cx="27" cy="27" r="3" stroke="#222" strokeWidth="2"/><path d="M13 27h14" stroke="#222" strokeWidth="2"/><path d="M20 14v9" stroke="#222" strokeWidth="2"/></svg>
  ) },
  { label: "Uber for Business", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><rect x="11" y="22" width="18" height="7" rx="2" stroke="#222" strokeWidth="2"/><rect x="15" y="11" width="10" height="7" rx="2" stroke="#222" strokeWidth="2"/></svg>
  ) },
  { label: "Freight", icon: (
    <svg width="42" height="42" fill="none" viewBox="0 0 40 40"><rect x="10" y="18" width="20" height="8" rx="2" stroke="#222" strokeWidth="2"/><rect x="15" y="14" width="10" height="4" rx="2" stroke="#222" strokeWidth="2"/></svg>
  ) },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full h-[54px] flex items-center justify-between px-10 bg-black border-b border-black">
        <div className="text-white font-medium text-[24px] tracking-tight">Uber</div>
        <nav className="flex items-center gap-5">
          <span className="text-white text-[15px]">🌐 EN</span>
          <span className="text-white text-[15px] flex items-center"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#fff" strokeWidth="1.4"/></svg> <span className="ml-1">Log in</span></span>
        </nav>
      </header>
      <div className="w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-8">
          <span className="text-2xl font-medium text-black border-b-2 border-black pb-2">Help</span>
        </div>
      </div>
      <main className="flex-1 flex flex-col items-center justify-start pt-16 pb-0 px-4 w-full">
        <h1 className="text-5xl font-bold text-black mb-4">Welcome to Uber Support</h1>
        <div className="text-gray-800 text-lg mb-12 text-center max-w-3xl">
          We're here to help. Looking for customer service contact information? Explore support resources for the relevant products below to find the best way to reach out about your issue.
        </div>
        <div className="flex flex-wrap items-stretch justify-center gap-8 w-full max-w-[1400px]">
          {categories.map((cat) => (
            <div key={cat.label} className="bg-[#f6f6f6] rounded-md flex flex-col items-center justify-center w-[190px] h-[180px] p-5 transition hover:bg-gray-200 cursor-pointer">
              <span>{cat.icon}</span>
              <span className="font-bold text-lg text-black mt-7 text-center ">{cat.label}</span>
            </div>
          ))}
        </div>
      </main>
      <div className="flex-1" />
      <footer className="w-full bg-black text-white pt-14 pb-7 px-2 mt-16">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-12 justify-between items-start">
          <div className="mb-10 mr-12">
            <div className="mb-3 text-xl font-bold">Uber</div>
            <div className="flex flex-col gap-5 mt-6">
              <div>
                <span className="block font-semibold mb-2">Company</span>
                <ul className="text-sm space-y-1 opacity-80">
                  <li>About us</li>
                  <li>Newsroom</li>
                  <li>Investors</li>
                  <li>Blog</li>
                  <li>Careers</li>
                </ul>
              </div>
              <div className="mt-7">
                <span className="block font-semibold mb-2">Products</span>
                <ul className="text-sm space-y-1 opacity-80">
                  <li>Ride</li>
                  <li>Drive</li>
                  <li>Eat</li>
                  <li>Uber for Business</li>
                  <li>Uber Freight</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mb-10">
            <span className="block font-semibold mb-2">Global Citizenship</span>
            <ul className="text-sm space-y-1 opacity-80">
              <li>Safety</li>
              <li>Security</li>
              <li>Diversity</li>
              <li>Transparency</li>
            </ul>
          </div>
          <div className="mb-10">
            <span className="block font-semibold mb-2">Innovation</span>
            <ul className="text-sm space-y-1 opacity-80">
              <li>AI</li>
            </ul>
          </div>
          <div className="mb-10 flex flex-col items-center justify-between gap-3 min-w-[220px]">
            <div className="flex gap-5 mt-5 pb-4">
              <span className="inline-block"><svg width='20' height='20' fill='none' viewBox='0 0 20 20'><circle cx='10' cy='10' r='9.5' stroke='#fff' strokeWidth='1.3'/></svg></span>
              <span className="inline-block"><svg width='20' height='20' fill='none' viewBox='0 0 20 20'><rect x='4' y='8' width='12' height='8' rx='4' fill='#fff'/></svg></span>
              <span className="inline-block"><svg width='20' height='20' fill='none' viewBox='0 0 20 20'><rect x='4' y='4' width='12' height='12' rx='6' fill='#fff'/></svg></span>
              <span className="inline-block"><svg width='20' height='20' fill='none' viewBox='0 0 20 20'><circle cx='10' cy='10' r='9.5' stroke='#fff' strokeWidth='1.3'/></svg></span>
              <span className="inline-block"><svg width='20' height='20' fill='none' viewBox='0 0 20 20'><circle cx='10' cy='10' r='6' stroke='#fff' strokeWidth='1.3'/></svg></span>
            </div>
            <div className="flex gap-4 mb-4">
              <img className="h-10" alt="Google Play" src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" />
              <img className="h-10" alt="App Store" src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" />
            </div>
            <div className="flex gap-4 mt-3">
              <span className="text-white opacity-80 text-sm">© 2025 Uber Technologies Inc.</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-row flex-wrap items-center justify-between mt-10 gap-3 opacity-70 text-sm">
          <div className="flex flex-row gap-7 items-center">
            <span>Privacy</span> <span>Accessibility</span> <span>Terms</span>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <span>🌐 EN</span> <span><svg width='16' height='16' fill='none' viewBox='0 0 16 16'><circle cx='8' cy='8' r='7' stroke='#fff' strokeWidth='1.5'/></svg></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
