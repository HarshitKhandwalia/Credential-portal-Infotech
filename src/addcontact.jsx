import React from 'react';

export default function AddContactPage() {
  const contactData = {
    name: "Rishita Alluri",
    company: "Enterprise Infotech",
    phone: "+917981557871",
    email: "rishita.alluri@enterprise-infotech.com",
    linkedin: "linkedin.com/in/rishita-alluri-6ab5861",
    website: "enterprise-infotech.com"
  };

  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${contactData.name}
ORG:${contactData.company}
TEL;TYPE=CELL:${contactData.phone}
EMAIL;TYPE=WORK:${contactData.email}
URL;TYPE=LinkedIn:https://${contactData.linkedin.trim()}
URL;TYPE=Website:https://${contactData.website.trim()}
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contactData.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      {/* Contact Card Container */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        
        {/* Card Header */}
        <div className="bg-[#F8FAFB] border-b border-slate-100 p-8 flex flex-col items-center text-center">
          {/* Avatar Circle using the Teal color */}
          <div className="w-20 h-20 rounded-full bg-[#2A5959] text-white flex items-center justify-center text-xl font-bold tracking-wider shadow-md mb-4">
            RK
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">{contactData.name}</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{contactData.company}</p>
        </div>

        {/* Contact Details List */}
        <div className="p-6 space-y-4">
          {/* Phone */}
          <a 
            href={`tel:${contactData.phone}`} 
            className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EAF2F2] text-[#2A5959] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile</span>
              <span className="text-sm font-semibold text-[#0F172A] break-words">{contactData.phone}</span>
            </div>
          </a>

          {/* Email */}
          <a 
            href={`mailto:${contactData.email}`} 
            className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EAF2F2] text-[#2A5959] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</span>
              <span className="text-sm font-semibold text-[#0F172A] break-all">{contactData.email}</span>
            </div>
          </a>

          {/* LinkedIn */}
          <a 
            href={`https://${contactData.linkedin.trim()}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EAF2F2] text-[#2A5959] flex items-center justify-center shrink-0 font-bold text-sm shadow-sm">
              in
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn</span>
              <span className="text-sm font-semibold text-[#0F172A] break-all">{contactData.linkedin}</span>
            </div>
          </a>

          {/* Website */}
          <a 
            href={`https://${contactData.website.trim()}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EAF2F2] text-[#2A5959] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.6 9h16.8M3.6 15h16.8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Website</span>
              <span className="text-sm font-semibold text-[#0F172A] break-all">{contactData.website}</span>
            </div>
          </a>
        </div>

        {/* Action Button & Footer */}
        <div className="p-6 pt-2 flex flex-col items-center">
          <button
            onClick={handleDownloadVCard}
            className="w-full bg-[#2A5959] hover:bg-[#1F4343] text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <span>+ Add to Contacts</span>
          </button>
          
          <p className="text-xs text-slate-400 mt-4 text-center">
            Save Rohit's contact details directly to your phone.
          </p>
          <span className="text-xs font-semibold text-slate-500 mt-1">
            Enterprise Infotech
          </span>
        </div>

      </div>
    </div>
  );
}