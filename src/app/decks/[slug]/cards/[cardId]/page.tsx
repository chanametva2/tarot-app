'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getDeckRegistry, getFullCard, getLookbookEntry, getGuidebookEntry } from '@/lib/tarot/deckLoader';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { CardModal } from '@/components/tarot/CardModal';
import { DrawResult } from '@/lib/tarot/types';

interface PageProps {
  params: Promise<{ slug: string; cardId: string }>;
}

export default function CardDetailPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string; cardId: string } | null>(null);
  const [showModal, setShowModal] = useState(true);
  const { lang } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  const handleClose = () => {
    if (resolvedParams) {
      router.push(`/decks/${resolvedParams.slug}/cards`);
    }
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    );
  }

  const { slug, cardId } = resolvedParams;
  const registry = getDeckRegistry(slug);
  const data = getFullCard(cardId, slug);
  const lookbookEntry = getLookbookEntry(cardId, slug);
  const guidebookEntry = getGuidebookEntry(cardId, slug);

  if (!registry || !data) {
    notFound();
  }

  const { card, meaning } = data;

  const drawResult: DrawResult = {
    card,
    meaning,
    orientation: 'upright',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href={`/decks/${slug}/cards`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-amber-400/70">
            {lang === 'th' ? 'กด ESC หรือคลิกพื้นหลังเพื่อปิด' : 'Press ESC or click backdrop to close'}
          </p>
        </div>
      </main>

      <CardModal
        draw={drawResult}
        isOpen={showModal}
        onClose={handleClose}
        deckSlug={slug}
        lookbookEntry={lookbookEntry}
        guidebookEntry={guidebookEntry}
      />
    </div>
  );
}
