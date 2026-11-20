import { useEffect, useState } from 'react';
import { institucionService } from '../services/institucionService';

let institutionRequest;
const institutionUpdatedEvent = 'posgrado:institution-updated';

export const invalidateInstitutionInfo = () => {
  institutionRequest = undefined;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(institutionUpdatedEvent));
};

const getInstitutionInfo = () => {
  institutionRequest ||= institucionService.getInfo();
  return institutionRequest;
};

export const useInstitutionWhatsApp = (message) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => getInstitutionInfo()
      .then((info) => {
        const digits = String(info?.whatsapp || '').replace(/\D/g, '');
        if (active && digits.length >= 8) {
          setUrl(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`);
        } else if (active) setUrl('');
      })
      .catch(() => { if (active) setUrl(''); });
    load();
    window.addEventListener(institutionUpdatedEvent, load);
    return () => {
      active = false;
      window.removeEventListener(institutionUpdatedEvent, load);
    };
  }, [message]);

  return url;
};
