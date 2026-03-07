import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeedCoffee, getCoffee } from '../lib/api';
import type { FlavorProfile } from '@shared/schema';

const SCORE_LABELS: Array<[keyof FlavorProfile, string]> = [
  ['strengthIntensity', 'Fuerza'],
  ['aromaIntensity', 'Aroma'],
  ['sweetnessLevel', 'Dulzura'],
  ['acidityLevel', 'Acidez'],
  ['bitternessLevel', 'Amargor'],
  ['bodyWeight', 'Cuerpo'],
  ['aftertasteLength', 'Persistencia'],
  ['aftertastePleasant', 'Post-sabor'],
];

function ScoreBar({ value, color }: { value: number | null | undefined; color: 'blue' | 'amber' }) {
  if (!value) return <span className="text-gray-400 text-sm">—</span>;
  const bg = color === 'blue' ? 'bg-blue-400' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`${bg} h-2 rounded-full`} style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-sm text-gray-600 w-4 shrink-0">{value}</span>
    </div>
  );
}

function Stars({ rating, color }: { rating: number; color: 'blue' | 'amber' }) {
  const active = color === 'blue' ? 'text-blue-400' : 'text-yellow-500';
  return (
    <div className="flex justify-center gap-0.5 mt-1">
      {[...Array(10)].map((_, i) => (
        <span key={i} className={`text-sm ${i < rating ? active : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  );
}

export function ComparePage() {
  const { theirsId, mineId } = useParams<{ theirsId: string; mineId: string }>();
  const navigate = useNavigate();

  const theirsIdNum = parseInt(theirsId || '0');
  const mineIdNum = parseInt(mineId || '0');

  const { data: theirs, isLoading: loadingTheirs, error: errorTheirs } = useQuery({
    queryKey: ['feed', 'coffee', theirsIdNum],
    queryFn: () => getFeedCoffee(theirsIdNum),
    enabled: !!theirsIdNum,
  });

  const { data: mine, isLoading: loadingMine, error: errorMine } = useQuery({
    queryKey: ['coffees', mineIdNum],
    queryFn: () => getCoffee(mineIdNum),
    enabled: !!mineIdNum,
  });

  if (loadingTheirs || loadingMine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando comparación...</p>
        </div>
      </div>
    );
  }

  if (errorTheirs || errorMine || !theirs || !mine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los cafés para comparar</p>
          <button
            onClick={() => navigate('/feed')}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
          >
            Volver al Feed
          </button>
        </div>
      </div>
    );
  }

  const theirsNotes = new Set(theirs.flavorProfile?.flavorNotes || []);
  const mineNotes = new Set(mine.flavorProfile?.flavorNotes || []);
  const sharedNotes = new Set([...theirsNotes].filter((n) => mineNotes.has(n)));
  const hasFlavorProfiles = theirs.flavorProfile || mine.flavorProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate(`/feed/${theirs.id}`)}
            className="text-amber-600 hover:text-amber-700"
          >
            ← Volver al Café
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Coffee info */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{theirs.name}</h1>
          <p className="text-gray-600">por {theirs.roaster}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {theirs.origin && <span>Origen: {theirs.origin}</span>}
            {theirs.roastLevel && <span>Tueste: {theirs.roastLevel}</span>}
            {theirs.processingMethod && <span>Proceso: {theirs.processingMethod}</span>}
          </div>
        </div>

        {/* Comparison card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_6rem_1fr] sm:grid-cols-[1fr_8rem_1fr]">
            <div className="bg-blue-50 p-4 text-center border-b border-gray-200">
              <p className="font-bold text-gray-900 truncate">{theirs.user.displayName}</p>
              <p className="text-sm text-gray-500">@{theirs.user.username}</p>
            </div>
            <div className="bg-gray-50 p-4 border-b border-gray-200" />
            <div className="bg-amber-50 p-4 text-center border-b border-gray-200">
              <p className="font-bold text-gray-900">Tú</p>
              <p className="text-sm text-gray-500">{mine.user.displayName}</p>
            </div>
          </div>

          {/* Overall rating */}
          <div className="grid grid-cols-[1fr_6rem_1fr] sm:grid-cols-[1fr_8rem_1fr] border-b border-gray-100 items-center">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {theirs.rating}
                <span className="text-sm text-gray-400 font-normal">/10</span>
              </p>
              <Stars rating={theirs.rating} color="blue" />
            </div>
            <div className="bg-gray-50 p-3 flex items-center justify-center border-x border-gray-100">
              <span className="text-xs text-gray-500 text-center leading-tight">Valoración general</span>
            </div>
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {mine.rating}
                <span className="text-sm text-gray-400 font-normal">/10</span>
              </p>
              <Stars rating={mine.rating} color="amber" />
            </div>
          </div>

          {/* Flavor profile section */}
          {hasFlavorProfiles && (
            <>
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Perfil de Sabor
                </p>
              </div>

              {SCORE_LABELS.map(([key, label]) => {
                const theirVal = theirs.flavorProfile?.[key] as number | null | undefined;
                const myVal = mine.flavorProfile?.[key] as number | null | undefined;
                if (!theirVal && !myVal) return null;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_6rem_1fr] sm:grid-cols-[1fr_8rem_1fr] border-b border-gray-100 items-center"
                  >
                    <div className="p-3 pl-4">
                      <ScoreBar value={theirVal} color="blue" />
                    </div>
                    <div className="bg-gray-50 px-2 py-3 flex items-center justify-center border-x border-gray-100">
                      <span className="text-xs text-gray-500 text-center">{label}</span>
                    </div>
                    <div className="p-3 pr-4">
                      <ScoreBar value={myVal} color="amber" />
                    </div>
                  </div>
                );
              })}

              {/* Calculated profile labels */}
              {(theirs.flavorProfile?.calculatedFlavorProfile ||
                mine.flavorProfile?.calculatedFlavorProfile) && (
                <div className="grid grid-cols-[1fr_6rem_1fr] sm:grid-cols-[1fr_8rem_1fr] border-b border-gray-100 items-center">
                  <div className="p-4 flex justify-center">
                    {theirs.flavorProfile?.calculatedFlavorProfile ? (
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full text-center">
                        {theirs.flavorProfile.calculatedFlavorProfile}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                  <div className="bg-gray-50 px-2 py-4 flex items-center justify-center border-x border-gray-100">
                    <span className="text-xs text-gray-500 text-center">Perfil</span>
                  </div>
                  <div className="p-4 flex justify-center">
                    {mine.flavorProfile?.calculatedFlavorProfile ? (
                      <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full text-center">
                        {mine.flavorProfile.calculatedFlavorProfile}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Flavor notes */}
          {(theirsNotes.size > 0 || mineNotes.size > 0) && (
            <>
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Notas de Sabor
                  {sharedNotes.size > 0 && (
                    <span className="ml-2 text-amber-600 normal-case font-normal">
                      · {sharedNotes.size} en común
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-[1fr_6rem_1fr] sm:grid-cols-[1fr_8rem_1fr]">
                <div className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {theirsNotes.size === 0 && (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                    {[...theirsNotes].map((note) => (
                      <span
                        key={note}
                        className={`text-xs px-2 py-1 rounded ${
                          sharedNotes.has(note)
                            ? 'bg-amber-100 text-amber-800 font-medium'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 px-2 py-4 flex items-center justify-center border-x border-gray-100">
                  <span className="text-xs text-gray-500 text-center">Notas</span>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {mineNotes.size === 0 && (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                    {[...mineNotes].map((note) => (
                      <span
                        key={note}
                        className={`text-xs px-2 py-1 rounded ${
                          sharedNotes.has(note)
                            ? 'bg-amber-100 text-amber-800 font-medium'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* No flavor profiles at all */}
          {!hasFlavorProfiles && theirsNotes.size === 0 && mineNotes.size === 0 && (
            <div className="p-8 text-center text-gray-500">
              Ninguno de los dos tiene un perfil de sabor registrado para este café.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
