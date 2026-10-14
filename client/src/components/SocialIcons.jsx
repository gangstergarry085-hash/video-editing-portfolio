import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
  FaTiktok,
  FaVimeoV,
  FaDiscord,
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaWhatsapp,
} from 'react-icons/fa6';

export function getSocialIcon(platform) {
  const p = (platform || '').toLowerCase().trim();
  if (p.includes('whatsapp') || p === 'wa') return FaWhatsapp;
  if (p.includes('instagram') || p === 'ig') return FaInstagram;
  if (p.includes('linkedin')) return FaLinkedinIn;
  if (p.includes('youtube') || p === 'yt') return FaYoutube;
  if (p.includes('twitter') || p === 'x') return FaXTwitter;
  if (p.includes('tiktok')) return FaTiktok;
  if (p.includes('vimeo')) return FaVimeoV;
  if (p.includes('discord')) return FaDiscord;
  if (p.includes('github')) return FaGithub;
  if (p.includes('mail') || p.includes('email')) return FaEnvelope;
  return FaGlobe;
}

export function getSocialBrandColor(platform) {
  const p = (platform || '').toLowerCase().trim();
  if (p.includes('whatsapp') || p === 'wa') return 'hover:text-[#25D366] hover:border-[#25D366]/50 hover:shadow-[0_0_15px_rgba(37,211,102,0.35)]';
  if (p.includes('instagram') || p === 'ig') return 'hover:text-[#E4405F] hover:border-[#E4405F]/50 hover:shadow-[0_0_15px_rgba(228,64,95,0.3)]';
  if (p.includes('linkedin')) return 'hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:shadow-[0_0_15px_rgba(10,102,194,0.3)]';
  if (p.includes('youtube') || p === 'yt') return 'hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]';
  if (p.includes('twitter') || p === 'x') return 'hover:text-white hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]';
  if (p.includes('tiktok')) return 'hover:text-[#EE1D52] hover:border-[#EE1D52]/50';
  if (p.includes('vimeo')) return 'hover:text-[#1AB7EA] hover:border-[#1AB7EA]/50';
  if (p.includes('discord')) return 'hover:text-[#5865F2] hover:border-[#5865F2]/50';
  if (p.includes('github')) return 'hover:text-white hover:border-white/50';
  return 'hover:text-accent hover:border-accent/50';
}
