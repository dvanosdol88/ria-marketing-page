
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Define the shape of the 'item' prop
interface CarouselItem {
  title: string;
  description: React.ReactNode; // Now supports rich text
  image?: string;
  customContent?: React.ReactNode;
}

interface FlippableCardProps {
  item: CarouselItem;
}

export function FlippableCard({ item }: FlippableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // This wrapper div provides the 3D perspective
  return (
    <div className="[perspective:1000px] h-full">
      {/* This inner div is what actually flips. Shadow is set to shadow-2xl */}
      <div
        className={`relative h-full w-full rounded-xl shadow-2xl transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
      >
        {/* --- FRONT OF THE CARD --- */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {/* Padding is set to py-8 px-12 */}
          <div className="flex h-full flex-col rounded-xl bg-white py-8 px-12 text-center pt-[8px] pb-[8px]">
            {item.customContent ? (
              <div className="mb-4 flex justify-center w-full">
                {item.customContent}
              </div>
            ) : item.image ? (
              <div className="mb-4 flex justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-[132px] w-auto max-w-full object-contain"
                />
              </div>
            ) : null}
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {item.title}
            </h3>
            <p className="flex-grow text-gray-600 mb-6">{item.description}</p>

            {/* "Learn More" button (mt-auto) will now work */}
            <button
              onClick={() => setIsFlipped(true)}
              className="mt-auto inline-block font-semibold text-primary hover:text-primary/90"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* --- BACK OF THE CARD --- */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* Padding is set to py-8 px-12 */}
          <div className="flex h-full flex-col rounded-xl bg-gray-100 py-8 px-12 text-center">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              More about {item.title}
            </h4>
            <p className="flex-grow text-gray-600 mb-6">
              {/* You can add more detailed content here */}
              This is the back of the card, where you can add more in-depth
              information, charts, or links.
            </p>
            {/* This button will flip it back */}
            <Button
              onClick={() => setIsFlipped(false)}
              variant="outline"
              className="mt-auto inline-block"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
