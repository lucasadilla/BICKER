const THEMES = {
    colorful: {
        left: {
            base: '#FF4D4D',
            hover: '#FF6A6A',
            text: '#FFFFFF',
            isDark: true,
        },
        right: {
            base: '#4D94FF',
            hover: '#76ACFF',
            text: '#FFFFFF',
            isDark: true,
        },
        text: {
            strong: '#1F2937',
            muted: '#6B7280',
            inverted: '#FFFFFF',
        },
        surfaces: {
            raised: 'rgba(255, 255, 255, 0.98)',
            solid: '#FFFFFF',
            border: 'rgba(15, 23, 42, 0.12)',
            borderMuted: 'rgba(15, 23, 42, 0.06)',
            highlight: 'rgba(37, 99, 235, 0.08)',
        },
        buttons: {
            primary: {
                bg: '#007BFF',
                hoverBg: '#0056b3',
                text: '#FFFFFF',
                shadow: '0 4px 0 #0056b3',
            },
            secondary: {
                bg: '#f0f0f0',
                hoverBg: '#e5e5e5',
                text: '#111111',
                border: '1px solid rgba(15, 23, 42, 0.12)',
            },
            danger: {
                bg: '#FF4D4D',
                hoverBg: '#FF6A6A',
                text: '#FFFFFF',
                border: 'none',
            },
            floating: {
                shadow: '10px 12px rgba(15, 23, 42, 0.45)',
            },
        },
        overlays: {
            onDark: {
                subtle: 'rgba(0, 0, 0, 0.2)',
                contrast: 'rgba(255, 255, 255, 0.25)',
                border: 'rgba(255, 255, 255, 0.6)',
                hover: 'rgba(255, 255, 255, 0.12)',
                active: 'rgba(255, 255, 255, 0.15)',
            },
            onLight: {
                subtle: 'rgba(0, 0, 0, 0.08)',
                contrast: 'rgba(0, 0, 0, 0.14)',
                border: 'rgba(0, 0, 0, 0.14)',
                hover: 'rgba(0, 0, 0, 0.08)',
                active: 'rgba(0, 0, 0, 0.1)',
            },
        },
        icon: {
            muted: '#4B5563',
        },
        shadows: {
            raised: '0 6px 18px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.06)',
            dropdown: '0 16px 24px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.04)',
            emojiHover: '0 8px 16px rgba(0, 0, 0, 0.25)',
        },
        counter: '#6B7280',
        nav: {
            text: '#FFFFFF',
            border: 'rgba(255, 255, 255, 0.7)',
            borderHover: 'rgba(255, 255, 255, 0.9)',
        },
    },
    monochrome: {
        left: {
            base: '#0F0F0F',
            hover: '#1C1C1C',
            text: '#FFFFFF',
            isDark: true,
        },
        right: {
            base: '#F5F5F5',
            hover: '#E0E0E0',
            text: '#050505',
            isDark: false,
        },
        text: {
            strong: '#F5F5F5',
            muted: '#BEBEBE',
            inverted: '#050505',
        },
        surfaces: {
            raised: 'rgba(12, 12, 12, 0.92)',
            solid: '#111111',
            border: 'rgba(255, 255, 255, 0.28)',
            borderMuted: 'rgba(255, 255, 255, 0.16)',
            highlight: 'rgba(255, 255, 255, 0.08)',
        },
        buttons: {
            primary: {
                bg: '#111111',
                hoverBg: '#000000',
                text: '#FFFFFF',
                shadow: '0 4px 0 #2B2B2B',
            },
            secondary: {
                bg: '#F5F5F5',
                hoverBg: '#E0E0E0',
                text: '#050505',
                border: '1px solid rgba(0, 0, 0, 0.2)',
            },
            danger: {
                bg: '#0F0F0F',
                hoverBg: '#000000',
                text: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            floating: {
                shadow: '10px 12px rgba(0, 0, 0, 0.7)',
            },
        },
        overlays: {
            onDark: {
                subtle: 'rgba(255, 255, 255, 0.12)',
                contrast: 'rgba(255, 255, 255, 0.2)',
                border: 'rgba(255, 255, 255, 0.35)',
                hover: 'rgba(255, 255, 255, 0.18)',
                active: 'rgba(255, 255, 255, 0.22)',
            },
            onLight: {
                subtle: 'rgba(0, 0, 0, 0.1)',
                contrast: 'rgba(0, 0, 0, 0.2)',
                border: 'rgba(0, 0, 0, 0.18)',
                hover: 'rgba(0, 0, 0, 0.08)',
                active: 'rgba(0, 0, 0, 0.12)',
            },
        },
        icon: {
            muted: '#E0E0E0',
        },
        shadows: {
            raised: '0 10px 30px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.5)',
            dropdown: '0 18px 32px rgba(0, 0, 0, 0.7), 0 6px 18px rgba(0, 0, 0, 0.55)',
            emojiHover: '0 10px 22px rgba(0, 0, 0, 0.65)',
        },
        counter: '#D4D4D4',
        nav: {
            text: '#FFFFFF',
            border: 'rgba(255, 255, 255, 0.45)',
            borderHover: 'rgba(255, 255, 255, 0.6)',
        },
    },
};

export function getSplitTheme(colorScheme) {
    return colorScheme === 'monochrome' ? THEMES.monochrome : THEMES.colorful;
}

export function getOverlayTokens(theme, side) {
    const isLeft = side === 'left' || side === 'red';
    const isDarkBackground = isLeft ? theme.left.isDark : theme.right.isDark;
    return isDarkBackground ? theme.overlays.onDark : theme.overlays.onLight;
}

