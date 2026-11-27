import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Share2 } from 'lucide-react';
import { copyToClipboard } from '../lib/utils';
import { ShareUrlResult } from '../lib/shareableState';
import { useI18n } from './I18nProvider';

export interface ShareLinkButtonProps {
  getShareUrl: () => Promise<ShareUrlResult>;
  className?: string;
  disabled?: boolean;
}

type ShareStatus = 'idle' | 'copied' | 'too_long' | 'error';

export function ShareLinkButton({
  getShareUrl,
  className = '',
  disabled = false,
}: ShareLinkButtonProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<ShareStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReset = useCallback((ms: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setStatus('idle');
      timerRef.current = null;
    }, ms);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleShare = useCallback(async () => {
    if (disabled) return;
    const result = await getShareUrl();
    if (!result.ok) {
      if ('reason' in result && result.reason === 'too_long') {
        setStatus('too_long');
        scheduleReset(4000);
      } else {
        setStatus('error');
        scheduleReset(3000);
      }
      return;
    }

    const copied = await copyToClipboard(result.url);
    if (copied) {
      setStatus('copied');
      scheduleReset(2500);
    } else {
      setStatus('error');
      scheduleReset(3000);
    }
  }, [disabled, getShareUrl, scheduleReset]);

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleShare}
        disabled={disabled}
        title={t.shareLink}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
          status === 'copied'
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400'
            : status === 'too_long'
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
            : status === 'error'
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {status === 'copied' ? (
          <>
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span>{t.shareLinkCopied}</span>
          </>
        ) : status === 'too_long' || status === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>{t.shareLink}</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>{t.shareLink}</span>
          </>
        )}
      </button>

      {status === 'too_long' && (
        <span
          role="alert"
          className="text-xs text-amber-600 dark:text-amber-400"
        >
          {t.shareLinkTooLong}
        </span>
      )}
      {status === 'error' && (
        <span
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {t.shareLinkFailed}
        </span>
      )}
    </div>
  );
}

export default ShareLinkButton;
