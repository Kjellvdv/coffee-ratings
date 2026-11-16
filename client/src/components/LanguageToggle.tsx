import { useI18n, type Lang } from '../i18n';

const LANGS: Lang[] = ['es', 'en'];

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="inline-flex shrink-0 rounded-md border border-gray-300 overflow-hidden text-sm"
    >
      {LANGS.map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            title={t(code === 'es' ? 'lang.es' : 'lang.en')}
            className={`px-2.5 py-1.5 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500 ${
              active ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
