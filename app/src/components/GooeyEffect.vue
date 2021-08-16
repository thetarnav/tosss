<template>
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter">
		<defs>
			<filter id="goo-xl">
				<feGaussianBlur
					in="SourceGraphic"
					stdDeviation="10"
					result="blur"
				/>
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -7"
					result="goo-xl"
				/>
				<feComposite in="SourceGraphic" in2="goo-xl" operator="atop" />
			</filter>
		</defs>
	</svg>
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter">
		<defs>
			<filter id="goo-l">
				<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -6"
					result="goo-l"
				/>
				<feComposite in="SourceGraphic" in2="goo-l" operator="atop" />
			</filter>
		</defs>
	</svg>
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter">
		<defs>
			<filter id="goo-m">
				<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -6"
					result="goo-m"
				/>
				<feComposite in="SourceGraphic" in2="goo-m" operator="atop" />
			</filter>
		</defs>
	</svg>
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter">
		<defs>
			<filter id="goo-s">
				<feGaussianBlur
					in="SourceGraphic"
					stdDeviation="1.8"
					result="blur"
				/>
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -4"
					result="goo-s"
				/>
				<feComposite in="SourceGraphic" in2="goo-s" operator="atop" />
			</filter>
		</defs>
	</svg>
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="svg-filter">
		<defs>
			<filter id="button-goo">
				<feGaussianBlur
					in="SourceGraphic"
					stdDeviation="10"
					result="blur"
				/>
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
					result="button-goo"
				/>
				<feComposite in="SourceGraphic" in2="button-goo" operator="atop" />
			</filter>
		</defs>
	</svg>
</template>

<style lang="postcss">
.svg-filter {
	@apply absolute w-0 h-0 hidden;
}
</style>
