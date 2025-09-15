'use client';

import { useState } from 'react';
import { Share2, Twitter, Linkedin, Facebook, Link, Copy, X } from 'lucide-react';

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    icon: string;
    tier: string;
  };
  shareUrl: string;
}

export default function SocialShare({ isOpen, onClose, achievement, shareUrl }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 I just unlocked the "${achievement.title}" achievement on Top Placed! ${achievement.description} #TopPlaced #Achievement #CareerGrowth`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'hover:bg-blue-500/20 hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
      color: 'hover:bg-blue-600/20 hover:text-blue-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: 'hover:bg-blue-700/20 hover:text-blue-600'
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600/20 border-amber-600/30';
      case 'silver': return 'bg-gray-400/20 border-gray-400/30';
      case 'gold': return 'bg-yellow-400/20 border-yellow-400/30';
      case 'platinum': return 'bg-purple-400/20 border-purple-400/30';
      default: return 'bg-gray-400/20 border-gray-400/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-[#00FFB2]/30 rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#00FFB2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 size={32} className="text-[#00FFB2]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Share Your Achievement</h2>
          <p className="text-gray-400">Let others know about your success!</p>
        </div>

        {/* Achievement Preview */}
        <div className={`glass-card p-4 mb-6 ${getTierBg(achievement.tier)}`}>
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{achievement.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold">{achievement.title}</h3>
              <p className="text-sm text-gray-400">{achievement.description}</p>
              <span className={`text-xs font-medium ${getTierColor(achievement.tier)}`}>
                {achievement.tier.toUpperCase()} TIER
              </span>
            </div>
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Share on social media:</h3>
          <div className="grid grid-cols-3 gap-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center p-4 rounded-lg border border-gray-700 transition-all ${social.color}`}
                >
                  <IconComponent size={24} className="mb-2" />
                  <span className="text-xs">{social.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Copy Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Or copy:</h3>
          
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-gray-700 hover:border-[#00FFB2]/50 transition-colors"
          >
            <div className="flex items-center">
              <Copy size={16} className="mr-3 text-gray-400" />
              <span className="text-sm">Copy message with link</span>
            </div>
            {copied && <span className="text-xs text-[#00FFB2]">Copied!</span>}
          </button>

          <button
            onClick={copyLink}
            className="w-full flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-gray-700 hover:border-[#00FFB2]/50 transition-colors"
          >
            <div className="flex items-center">
              <Link size={16} className="mr-3 text-gray-400" />
              <span className="text-sm">Copy link only</span>
            </div>
            {copied && <span className="text-xs text-[#00FFB2]">Copied!</span>}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Share your achievements to inspire others on their career journey!
        </p>
      </div>
    </div>
  );
}