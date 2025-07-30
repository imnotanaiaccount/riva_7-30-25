import React from 'react';
import { FaStar, FaBolt, FaEye, FaEnvelope, FaExternalLinkAlt, FaHome, FaUserTie } from 'react-icons/fa';
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../utils/supabase';

const serviceIcon = (service) => {
  if (/real estate/i.test(service)) return <FaHome className="text-blue-400 mr-1" />;
  if (/cleaning/i.test(service)) return <FaBolt className="text-green-400 mr-1" />;
  if (/landscaping/i.test(service)) return <FaUserTie className="text-green-500 mr-1" />;
  return <FaStar className="text-purple-400 mr-1" />;
};

const valueIcon = <FaBolt className="text-cyan-400 mr-1" />;

const getStatusBadge = (status) => {
  const statusMap = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    customer: 'bg-purple-100 text-purple-800',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

export default function LeadCard({ lead, expanded, onExpand, onClose, isHero, isAdmin = false }) {
  // For hero card, manage its own expansion state
  const [localExpanded, setLocalExpanded] = React.useState(false);
  const isExpanded = isHero ? localExpanded : expanded;
  const handleExpand = isHero ? () => setLocalExpanded(!localExpanded) : onExpand;
  const handleClose = isHero ? () => setLocalExpanded(false) : onClose;

  // Urgency color system
  const urgencyColors = {
    High: {
      badge: 'bg-red-700 text-white font-bold',
      icon: <FaBolt className="text-white mr-1" />,
    },
    Medium: {
      badge: 'bg-yellow-400 text-white font-bold',
      icon: <FaBolt className="text-white mr-1" />,
    },
    Low: {
      badge: 'bg-blue-600 text-white font-bold',
      icon: <FaBolt className="text-white mr-1" />,
    },
    Featured: {
      badge: 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 text-white font-bold',
      icon: null,
    },
  };
  // Card style logic
  const borderClass = (lead.urgency === 'Featured Project' || lead.score >= 9)
    ? 'border-2 border-blue-400/80 animate-glow-card ring-2 ring-blue-400/30'
    : 'border-2 border-blue-400/80 animate-glow-card ring-2 ring-blue-400/30';
  const boxShadow = (lead.urgency === 'Featured Project' || lead.score >= 9)
    ? '0 0 48px 8px rgba(0,122,255,0.22), 0 4px 32px 0 rgba(0,0,0,0.16)'
    : '0 0 48px 8px rgba(0,122,255,0.22), 0 4px 32px 0 rgba(0,0,0,0.16)';

  const [status, setStatus] = useState(lead.status || 'new');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      setError('');
      
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', lead.id);
      
      if (updateError) throw updateError;
      
      setStatus(newStatus);
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Interact with lead card for ${lead.name}`}
      className={`relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 pt-14 text-left shadow-2xl transition-all duration-400 group overflow-hidden cursor-pointer focus:ring-2 focus:ring-blue-400 ${borderClass} ${isExpanded ? 'z-20 bg-white/20 scale-100' : ''}`}
      style={{
        minHeight: isExpanded ? '420px' : '340px',
        background: 'linear-gradient(135deg, rgba(24,28,48,0.92) 0%, rgba(40,44,74,0.82) 100%)',
        boxShadow,
        maxWidth: isHero ? '24rem' : undefined,
        width: isHero ? '100%' : undefined,
        height: isHero ? '420px' : undefined,
      }}
      onClick={handleExpand}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleExpand()}
    >
      {/* Animated background nebula/particle effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute w-40 h-40 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-400/20 rounded-full blur-2xl opacity-60 animate-float-star left-1/2 top-0 -translate-x-1/2" />
        <div className="absolute w-24 h-24 bg-gradient-to-br from-pink-400/20 via-blue-400/10 to-purple-400/20 rounded-full blur-2xl opacity-40 animate-float-star right-4 bottom-4" />
      </div>
      {/* Premium badge system: Featured Project and Urgency */}
      <div className="flex justify-between items-center mb-3 relative z-20">
        {/* Featured Project badge (left, if present) */}
        {lead.urgency === 'Featured Project' && (
          <div className={`text-xs font-semibold px-4 py-1 rounded-full shadow-lg glass border border-white/10 ${urgencyColors.Featured.badge}`} style={{fontWeight: 600, letterSpacing: 0.2}}>
            Featured Project
          </div>
        )}
        {/* Urgency badge (right, if present and not 'Featured Project') */}
        {lead.urgency !== 'Featured Project' && urgencyColors[lead.urgency] && (
          <div className={`flex items-center gap-1 ${urgencyColors[lead.urgency].badge} text-xs font-semibold px-4 py-1 rounded-full shadow-lg glass border border-white/10`} style={{fontWeight: 700, letterSpacing: 0.2}}>
            {urgencyColors[lead.urgency].icon}
            {lead.urgency} Urgency
          </div>
        )}
        {isAdmin && (
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(lead.status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
      {/* Card main content */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="font-extrabold text-white text-xl flex items-center gap-2">
          {serviceIcon(lead.service)}
          {lead.name}
        </span>
      </div>
      <div className="flex items-center text-blue-300 text-base mb-2 relative z-10 gap-2">
        {serviceIcon(lead.service)}
        <span>Service: {lead.service}</span>
      </div>
      <div className="flex items-center text-gray-300 text-base mb-2 relative z-10 gap-2">
        <FaStar className="text-yellow-400" />
        AI Score: <span className="font-bold text-green-400 ml-1">{lead.score}/10</span>
      </div>
      <div className="text-gray-400 text-sm mb-3 relative z-10 font-medium">{lead.notes}</div>
      <div className="flex items-center justify-between mt-2 mb-3 relative z-10">
        <span className="flex items-center text-white font-semibold text-base gap-2">{valueIcon}Est. Value</span>
        <span className="text-blue-400 font-bold text-lg">{lead.value}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-3">
        <div className="flex items-center text-gray-400 text-sm">
          <FaEnvelope className="mr-2" />
          <span className="truncate">{lead.contact}</span>
        </div>
        {lead.projectUrl && !['Sarah L.', 'Mike R.', 'Lisa P.'].includes(lead.name) && (
          <a 
            href={lead.projectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors group"
            onClick={e => e.stopPropagation()}
          >
            See live site
            <FaExternalLinkAlt className="ml-1 text-xs opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>
      {/* Expanded details inline */}
      {isExpanded && (
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-2xl rounded-3xl flex flex-col items-center justify-center p-8 z-30 animate-fade-in ${isHero ? 'shadow-2xl border border-blue-400/40' : ''}`} style={{minHeight: '420px'}}>
          <button className={`absolute top-4 ${isHero ? 'right-4' : 'left-4'} text-white text-2xl z-40`} onClick={e => {e.stopPropagation(); handleClose();}} aria-label="Close">&times;</button>
          <h3 className="text-2xl font-bold text-white mb-2 mt-2">{lead.name}</h3>
          <div className="text-blue-300 mb-1">Service: {lead.service}</div>
          <div className="text-green-400 mb-1">Urgency: {lead.urgency}</div>
          <div className="text-yellow-400 mb-1">AI Score: {lead.score}/10</div>
          <div className="text-gray-300 mb-2">{lead.notes}</div>
          <div className="text-blue-400 font-bold mb-2">Est. Value: {lead.value}</div>
          <div className="text-xs text-gray-400 mb-2">Contact: {lead.contact}</div>
          {lead.projectUrl && !['Sarah L.', 'Mike R.', 'Lisa P.'].includes(lead.name) && (
            <a href={lead.projectUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs font-semibold mt-2 inline-block">See Live Site</a>
          )}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className={`text-sm rounded-md border-0 bg-white/5 text-white focus:ring-2 focus:ring-blue-500 ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="customer">Customer</option>
                  <option value="lost">Lost</option>
                </select>
                
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Email
                </a>
                
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Call
                  </a>
                )}
              </div>
              
              {error && (
                <p className="mt-2 text-xs text-red-400">{error}</p>
              )}
            </div>
          )}
        </div>
      )}
      {/* Compact quick-action bar at bottom */}
      <div className={`absolute bottom-4 left-0 w-full flex justify-center gap-2 ${isHero ? 'z-40 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-30 pointer-events-auto'}`}>
        <button
          className="bg-white/20 hover:bg-blue-500/80 text-white rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="View Details"
          aria-label="View Details"
          onClick={e => {e.stopPropagation(); handleExpand();}}
        >
          <FaEye />
        </button>
        <a
          className="bg-white/20 hover:bg-green-500/80 text-white rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Contact Lead"
          aria-label="Contact Lead"
          href={`mailto:${lead.contact}`}
          onClick={e => e.stopPropagation()}
        >
          <FaEnvelope />
        </a>
        {lead.projectUrl && !isHero && !['Sarah L.', 'Mike R.', 'Lisa P.'].includes(lead.name) && (
          <a
            className="bg-white/20 hover:bg-purple-500/80 text-white rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="See Live Site"
            aria-label="See Live Site"
            href={lead.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <FaExternalLinkAlt />
          </a>
        )}
      </div>
    </div>
  );
} 