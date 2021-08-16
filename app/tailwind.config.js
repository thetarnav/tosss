module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	mode: 'jit',
	darkMode: 'media', // or 'media' or 'class'
	theme: {
		extend: {
			zIndex: {
				'-1': '-1',
			},
			spaceing: {
				4.5: '1.125rem',
				18: '4.5rem',
				'10vh': '10vh',
				'20vh': '20vh',
				'30vh': '30vh',
				'40vh': '40vh',
				'50vh': '50vh',
				'60vh': '60vh',
				'70vh': '70vh',
				'80vh': '80vh',
				'90vh': '90vh',
				'10vw': '10vw',
				'20vw': '20vw',
				'30vw': '30vw',
				'40vw': '40vw',
				'50vw': '50vw',
				'60vw': '60vw',
				'70vw': '70vw',
				'80vw': '80vw',
				'90vw': '90vw',
			},
			height: {
				max: 'max-content',
			},
			transitionProperty: {
				'clip-path': 'clip-path',
				base: 'opacity, transform',
			},
			transitionTimingFunction: {
				bouncy: 'cubic-bezier(0.51, 0.06, 0.56, 1.37)',
			},
		},
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			white: '#f6f6f6',
			gray: '#515070',
			tan: '#ffbb91',
			salomon: ' #ff8e6e',
		},
		fontFamily: {
			sans: 'Nunito, sans-serif',
			cursive: 'Averia Sans Libre, Nunito, cursive',
		},
	},
	variants: {
		borderWidth: ['last'],
		margin: ['last', 'first'],
		borderRadius: ['last', 'first'],
	},
}
