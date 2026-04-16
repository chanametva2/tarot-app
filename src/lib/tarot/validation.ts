import { CardRecord, MeaningRecord } from './types';
import { getAllCards, getMeaningByCardId, getDeckManifest } from './loader';

interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  category: string;
  message: string;
  cardId?: string;
}

interface ValidationWarning {
  category: string;
  message: string;
  cardId?: string;
}

export function validateDeck(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const cards = getAllCards();
  const manifest = getDeckManifest();
  
  if (cards.length !== manifest.card_count) {
    errors.push({
      category: 'Card Count',
      message: `Expected ${manifest.card_count} cards, found ${cards.length}`,
    });
  }
  
  const cardIds = cards.map(c => c.card_id);
  const duplicates = cardIds.filter((id, index) => cardIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push({
      category: 'Duplicate',
      message: `Duplicate card_ids found: ${[...new Set(duplicates)].join(', ')}`,
    });
  }
  
  for (const card of cards) {
    if (!card.name?.th) {
      errors.push({
        category: 'Missing Field',
        message: 'Missing name.th',
        cardId: card.card_id,
      });
    }
    if (!card.name?.en) {
      errors.push({
        category: 'Missing Field',
        message: 'Missing name.en',
        cardId: card.card_id,
      });
    }
    if (!card.image) {
      errors.push({
        category: 'Missing Field',
        message: 'Missing image path',
        cardId: card.card_id,
      });
    }
    
    const meaning = getMeaningByCardId(card.card_id);
    if (!meaning) {
      errors.push({
        category: 'Missing Meanings',
        message: 'No meaning found for card',
        cardId: card.card_id,
      });
    } else {
      if (!meaning.upright?.th || meaning.upright.th.length === 0) {
        warnings.push({
          category: 'Missing Field',
          message: 'Missing upright.th',
          cardId: card.card_id,
        });
      }
      if (!meaning.upright?.en || meaning.upright.en.length === 0) {
        warnings.push({
          category: 'Missing Field',
          message: 'Missing upright.en',
          cardId: card.card_id,
        });
      }
      if (!meaning.reversed?.th || meaning.reversed.th.length === 0) {
        warnings.push({
          category: 'Missing Field',
          message: 'Missing reversed.th',
          cardId: card.card_id,
        });
      }
      if (!meaning.reversed?.en || meaning.reversed.en.length === 0) {
        warnings.push({
          category: 'Missing Field',
          message: 'Missing reversed.en',
          cardId: card.card_id,
        });
      }
      if (!meaning.reflection?.th || !meaning.reflection?.en) {
        warnings.push({
          category: 'Missing Field',
          message: 'Missing reflection.th or reflection.en',
          cardId: card.card_id,
        });
      }
    }
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

export function printValidationReport(): void {
  const result = validateDeck();
  
  console.log('='.repeat(50));
  console.log('  TAROT DECK VALIDATION REPORT');
  console.log('='.repeat(50));
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(e => {
      const cardInfo = e.cardId ? ` [${e.cardId}]` : '';
      console.log(`  [${e.category}]${cardInfo} ${e.message}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    result.warnings.forEach(w => {
      const cardInfo = w.cardId ? ` [${w.cardId}]` : '';
      console.log(`  [${w.category}]${cardInfo} ${w.message}`);
    });
  }
  
  if (result.passed && result.warnings.length === 0) {
    console.log('\n✅ ALL CHECKS PASSED');
  } else if (result.passed) {
    console.log('\n✅ NO ERRORS (with warnings)');
  }
  
  console.log('='.repeat(50));
}
