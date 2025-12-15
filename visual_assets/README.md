# Upgrade. Improve. Save? Information Cards

This folder contains the React components and assets for the "Upgrade. Improve. Save?" cards.
These cards are designed to be used as stand-alone elements or in a grid layout (as shown in `ValueCards.tsx`), rather than a carousel.

## File Contents

- `ValueCards.tsx`: A container component displaying the three cards in a responsive grid.
- `FlippableCard.tsx`: The reusable 3D flippable card component.
- `DonutChart.tsx`: The chart component used in the "Improve Your Tools" card.
- `brain-plus-AI (3)_1764083318460.png`: Image for the "Upgrade" card.
- `save_money_piggy_bank_correct_color_1764085668526.png`: Image for the "Save" card.

## Dependencies

To use these components, you will need the following dependencies:

```bash
npm install lucide-react recharts clsx tailwind-merge
```

*Note: `embla-carousel-react` is no longer required.*

You may also need a `Button` component (referenced as `@/components/ui/button`). If you don not have this alias configured, please update the import in `FlippableCard.tsx` to point to your button component or use a standard HTML `<button>`.

## Usage

### Using the Grid Layout
Import `ValueCards` to display all three cards in a responsive grid:

```tsx
import { ValueCards } from './path/to/ValueCards';

<ValueCards 
  portfolioValue={1000000} 
  annualFeePercent={1.0} 
  portfolioGrowth={8.0} 
  years={20} 
/>
```

### Using Individual Cards
You can use `FlippableCard` directly to place a card anywhere:

```tsx
import { FlippableCard } from './path/to/FlippableCard';

<FlippableCard 
  item={{
    title: 'My Title',
    description: 'My Description',
    image: 'path/to/image.png'
  }} 
/>
```
