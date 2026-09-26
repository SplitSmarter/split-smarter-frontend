// src/components/common/AppText/AppText.styles.ts
import {cva, type VariantProps} from 'class-variance-authority';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const appTextVariants = cva(
    'text-text-primary',
    {
        variants: {
            variant: {
                h1: 'text-heading-h1 font-bold',
                h2: 'text-heading-h2 font-bold',
                h3: 'text-heading-h3 font-semibold',
                h4: 'text-heading-h4 font-semibold',
                'body-large': 'text-body-large font-normal',
                'body-base': 'text-body-base font-normal',
                'body-small': 'text-body-small font-normal',
                'caption-xs': 'text-caption-xs font-normal',
                'body-xs': 'text-body-xs font-normal',
            },
            colorScheme: {
                primary: 'text-text-primary',
                secondary: 'text-text-secondary',
                muted: 'text-text-primary-placeholder',
                link: 'text-text-link',
                canvas: 'text-text-canvas',
                error: 'text-status-error',
                success: 'text-green-increase',
                golden: 'text-golden',
            },
        },
        defaultVariants: {
            variant: 'body-base',
            colorScheme: 'primary',
        },
    }
);

export type AppTextVariantProps = VariantProps<typeof appTextVariants>;